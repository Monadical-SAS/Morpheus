import io
import logging

import ray
from PIL import Image

from app.actors.common.sd_base import StableDiffusionAbstract
from app.schemas.schemas import Prompt


@ray.remote(num_gpus=1)
class StableDiffusionImageToImage(StableDiffusionAbstract):
    def __init__(
            self, *,
            pipeline: str = "StableDiffusionImg2ImgPipeline",
            scheduler: str = "DDPMScheduler",
            model_id: str = "stabilityai/stable-diffusion-2-1"
    ):
        super().__init__(
            pipeline=pipeline,
            scheduler=scheduler,
            model_id=model_id,
        )
        self.logger = logging.getLogger(__name__)

    def generate(self, prompt: Prompt):
        self.logger.info(f"StableDiffusionImageToImage.generate: prompt: {prompt}")
        image = Image.open(io.BytesIO(prompt.image))
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
        self.logger.info(f"StableDiffusionImageToImage.generate: result: {len(result)}")
        return result
