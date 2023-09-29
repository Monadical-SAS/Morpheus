import logging
import uuid

import ray
from app.actors.controlnet import StableDiffusionControlnet
from app.actors.sd_img_to_img import StableDiffusionImageToImage
from app.actors.sd_inpainting import StableDiffusionInpainting
from app.actors.sd_pix_to_pix import StableDiffusionPixToPix
from app.actors.sd_text_to_img import StableDiffusionText2Img
from app.actors.sd_upscaling import StableDiffusionUpscaling
from app.integrations.db_client import DBClient
from app.integrations.s3_client import S3Client
from app.models.schemas import CategoryEnum, Generation, ModelRequest
# for local testing
from app.utils.images import create_fake_images


@ray.remote
class ModelHandler:
    def __init__(self, *, endpoint: CategoryEnum, request: ModelRequest):
        self.endpoint = endpoint
        self.request = request
        self.logger = logging.getLogger("ray")
        self.generator_args = {
            "pipeline": self.request.pipeline,
            "model_id": self.request.model_id,
            "scheduler": self.request.scheduler,
        }
        if self.endpoint == CategoryEnum.CONTROLNET:
            self.generator_args["controlnet_id"] = self.request.controlnet_id

        self.generator = self.get_generator().remote(**self.generator_args)
        self.s3_client = S3Client()

    def get_generator(self):
        generators = {
            CategoryEnum.TEXT_TO_IMAGE: StableDiffusionText2Img,
            CategoryEnum.IMAGE_TO_IMAGE: StableDiffusionImageToImage,
            CategoryEnum.CONTROLNET: StableDiffusionControlnet,
            CategoryEnum.PIX_TO_PIX: StableDiffusionPixToPix,
            CategoryEnum.UPSCALING: StableDiffusionUpscaling,
            CategoryEnum.INPAINTING: StableDiffusionInpainting,
        }
        generator = generators.get(self.endpoint)
        if generator is None:
            raise ValueError(f"Invalid endpoint: {self.endpoint}")

        return generator

    def handle_generation(self):
        self.logger.info(f"Generating image for: {self.request}")
        db_client = DBClient()

        try:
            # Create generation record in database
            db_client.create_generation(
                generation_id=uuid.UUID(self.request.task_id)
            )

            # Generate images with Stable Diffusion models
            # generated_images_future = self.generator.generate.remote(request=self.request)
            # generated_images = ray.get(generated_images_future)
            # for local testing
            generated_images = create_fake_images(n_images=self.request.num_images_per_prompt)

            # Upload images to S3 Bucket
            image_urls = self.s3_client.upload_multiple_files(
                files=generated_images,
                folder_name=self.request.user_id,
                file_name=f"{self.request.task_id}"
            )

            # Update generation in database
            generation = db_client.update_generation(generation=Generation(
                id=self.request.task_id,
                results=image_urls,
                status="COMPLETED"
            ))

            # Return image URLs
            self.logger.info(f"Generation {generation.id} updated with result: {generation.results}")
            return generation
        except Exception as e:
            self.logger.error(f"Error generating image: {e}")
            db_client.update_generation(generation=Generation(
                id=self.request.task_id,
                status="FAILED"
            ))
            raise e
