import logging

import ray

from app.actors.s3_client import S3Client
from app.schemas.schemas import Prompt


@ray.remote(num_gpus=1)
class StableDiffusionV2Text2Img:
    def __init__(self, model_id: str, scheduler: str):
        super().__init__(
            pipeline_name="StableDiffusionPipeline",
            model_id=model_id,
            scheduler=scheduler
        )
        self.logger = logging.getLogger(__name__)
        self.s3_client = S3Client.remote()

    def generate(self, prompt: Prompt):
        self.logger.info(f"StableDiffusionV2Text2Img.generate: prompt: {prompt}")
        result = self.pipe(
            prompt=prompt.prompt,
            width=prompt.width,
            height=prompt.height,
            num_inference_steps=prompt.num_inference_steps,
            guidance_scale=prompt.guidance_scale,
            num_images_per_prompt=prompt.num_images_per_prompt,
            negative_prompt=prompt.negative_prompt,
        ).images
        return self.s3_client.upload_multiple_files.remote(
            files=result,
            folder_name=prompt.user_id,
            file_name=f"{prompt.task_id}"
        )


@ray.remote(num_gpus=1)
class StableDiffusionXLTextToImage:
    def __init__(self, model_id: str, scheduler: str):
        super().__init__(
            pipeline_name="StableDiffusionXLPipeline",
            model_id="stabilityai/stable-diffusion-xl-base-1.0",
            scheduler=scheduler
        )
        self.logger = logging.getLogger(__name__)
        self.s3_client = S3Client.remote()

    def generate(self, prompt: Prompt):
        self.logger.info(f"StableDiffusionXLTextToImage.generate: prompt: {prompt}")
        result = self.pipe(
            prompt=prompt.prompt,
            width=prompt.width,
            height=prompt.height,
            num_inference_steps=prompt.num_inference_steps,
            guidance_scale=prompt.guidance_scale,
            num_images_per_prompt=prompt.num_images_per_prompt,
            negative_prompt=prompt.negative_prompt,
        ).images
        return self.s3_client.upload_multiple_files.remote(
            files=result,
            folder_name=prompt.user_id,
            file_name=f"{prompt.task_id}"
        )
