import io
import logging
from typing import Any

import ray
from PIL import Image

from app.actors.common.sd_base import StableDiffusionAbstract
from app.actors.s3_client import S3Client
from app.schemas.schemas import Prompt


@ray.remote(num_gpus=1)
class StableDiffusionInpainting(StableDiffusionAbstract):
    def __init__(
            self, *,
            pipeline: str = "StableDiffusionInpaintPipeline",
            scheduler: str = "DDPMScheduler",
            model_id: str = "runwayml/stable-diffusion-inpainting"
    ):
        super().__init__(
            pipeline=pipeline,
            scheduler=scheduler,
            model_id=model_id
        )
        self.logger = logging.getLogger(__name__)
        self.s3_client = S3Client.remote()

    def generate(self, prompt: Prompt, image: Any, mask: Any):
        self.logger.info(f"StableDiffusionInpainting.generate: prompt: {prompt}")
        image = Image.open(io.BytesIO(image))
        mask = Image.open(io.BytesIO(mask))

        result = self.pipeline(
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