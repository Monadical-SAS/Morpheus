import logging

import ray

from app.actors.common.sd_base import StableDiffusionAbstract
from app.schemas.schemas import Prompt


@ray.remote(num_gpus=1)
class StableDiffusionText2Img(StableDiffusionAbstract):
    def __init__(
            self, *,
            pipeline: str = "StableDiffusionXLPipeline",
            scheduler: str = "DDPMScheduler",
            model_id: str = "stabilityai/stable-diffusion-xl-base-1.0"
    ):
        super().__init__(
            pipeline=pipeline,
            model_id=model_id,
            scheduler=scheduler
        )
        self.logger = logging.getLogger(__name__)

    def generate(self, prompt: Prompt):
        self.logger.info(f"StableDiffusionV2Text2Img.generate: prompt: {prompt}")
        self.set_generator(prompt.generator)
        result = self.pipeline(
            prompt=prompt.prompt,
            width=prompt.width,
            height=prompt.height,
            num_inference_steps=prompt.num_inference_steps,
            guidance_scale=prompt.guidance_scale,
            num_images_per_prompt=prompt.num_images_per_prompt,
            negative_prompt=prompt.negative_prompt,
            generator=self.generator,
        ).images
        self.logger.info(f"StableDiffusionV2Text2Img.generate: result: {len(result)}")
        return result
