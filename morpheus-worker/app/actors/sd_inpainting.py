import io
import logging

import ray
from PIL import Image

from app.actors.common.sd_base import StableDiffusionAbstract
from app.actors.s3_client import S3Client
from app.schemas.schemas import Prompt


@ray.remote(num_gpus=1)
class StableDiffusionInpainting(StableDiffusionAbstract):
    def __init__(self, scheduler: str):
        super().__init__(
            pipeline_name="StableDiffusionInpaintPipeline",
            model_id="runwayml/stable-diffusion-inpainting",
            scheduler=scheduler
        )
        self.logger = logging.getLogger(__name__)
        self.s3_client = S3Client.remote()

    def generate(self, prompt: Prompt):
        self.logger.info(f"StableDiffusionInpainting.generate: prompt: {prompt}")
        image = Image.open(io.BytesIO(prompt.image))
        mask = Image.open(io.BytesIO(prompt.mask))

        result = self.pipe(
            prompt=prompt.prompt,
            width=prompt.width,
            height=prompt.height,
            num_inference_steps=prompt.num_inference_steps,
            guidance_scale=prompt.guidance_scale,
            num_images_per_prompt=prompt.num_images_per_prompt,
            negative_prompt=prompt.negative_prompt,
            strength=prompt.strength,
            image=image,
            mask_image=mask
        ).images
        return self.s3_client.upload_multiple_files.remote(
            files=result,
            folder_name=prompt.user_id,
            file_name=f"{prompt.task_id}"
        )
