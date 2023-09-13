import logging

import ray

from app.actors.s3_client import S3Client
from app.actors.sd_controlnet import StableDiffusionControlnet
from app.actors.sd_img_to_img import StableDiffusionImageToImage
from app.actors.sd_inpainting import StableDiffusionInpainting
from app.actors.sd_pix_to_pix import StableDiffusionPixToPix
from app.actors.sd_text_to_img import StableDiffusionText2Img
from app.actors.sd_upscaling import StableDiffusionUpscaling
from app.schemas.schemas import Prompt, CategoryEnum
from app.utils.prompts import generate_random_prompt


@ray.remote(num_cpus=0)
class ModelsHandler:
    def __init__(self, *, endpoint: CategoryEnum):
        self.endpoint = endpoint
        self.logger = logging.getLogger(__name__)
        self.generator = self.get_generator().remote()
        self.s3_client = S3Client.remote()

    def get_generator(self):
        generators = {
            CategoryEnum.TEXT_TO_IMAGE: StableDiffusionText2Img,
            CategoryEnum.IMAGE_TO_IMAGE: StableDiffusionImageToImage,
            CategoryEnum.PIX_TO_PIX: StableDiffusionPixToPix,
            CategoryEnum.UPSCALING: StableDiffusionUpscaling,
            CategoryEnum.INPAINTING: StableDiffusionInpainting,
            CategoryEnum.CONTROLNET: StableDiffusionControlnet,
        }
        generator = generators.get(self.endpoint)
        if generator is None:
            raise ValueError(f"Invalid endpoint: {self.endpoint}")

        return generator

    def handle_generation(self, prompt: Prompt):
        random_config = generate_random_prompt()
        prompt = Prompt(**random_config)
        self.logger.info(f"Generating image for: {prompt}")
        # Generate images with Stable Diffusion models
        generated_images_future = self.generator.generate.remote(prompt=prompt)
        generated_images = ray.get(generated_images_future)

        # Upload images to S3 Bucket
        image_urls_future = self.s3_client.upload_multiple_files.remote(
            files=generated_images,
            folder_name=prompt.user_id,
            file_name=f"{prompt.task_id}"
        )
        image_urls = ray.get(image_urls_future)

        # Return image URLs
        self.logger.info(f"Uploaded images: {image_urls}")
        return image_urls
