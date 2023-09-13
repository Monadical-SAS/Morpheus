import io
import logging
from typing import Any

import ray
from PIL import Image

from app.actors.common.sd_base import StableDiffusionAbstract
from app.schemas.schemas import Prompt


@ray.remote(num_gpus=1)
class StableDiffusionUpscaling(StableDiffusionAbstract):
    def __init__(
            self, *,
            pipeline: str = "StableDiffusionUpscalePipeline",
            scheduler: str = "DDPMScheduler",
            model_id: str = "stabilityai/stable-diffusion-x4-upscaler"
    ):
        super().__init__(
            pipeline=pipeline,
            scheduler=scheduler,
            model_id=model_id,
        )
        self.logger = logging.getLogger(__name__)

    def generate(self, prompt: Prompt, image: Any):
        self.logger.info(f"StableDiffusionUpscaling.generate: prompt: {prompt}")
        image = Image.open(io.BytesIO(image))
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
        ).images
        self.logger.info(f"StableDiffusionUpscaling.generate: result: {len(result)}")
        return result