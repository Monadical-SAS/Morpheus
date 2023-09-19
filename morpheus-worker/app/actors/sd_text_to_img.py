import logging

import ray
from app.actors.common.sd_base import StableDiffusionAbstract
from app.models.schemas import ModelRequest


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
        self.logger = logging.getLogger("ray")

    def generate(self, request: ModelRequest):
        self.logger.info(f"StableDiffusionV2Text2Img.generate: request: {request}")
        self.set_generator(request.generator)
        result = self.pipeline(
            prompt=request.prompt,
            width=request.width,
            height=request.height,
            num_inference_steps=request.num_inference_steps,
            guidance_scale=request.guidance_scale,
            num_images_per_prompt=request.num_images_per_prompt,
            negative_prompt=request.negative_prompt,
            generator=self.generator,
        ).images
        self.logger.info(f"StableDiffusionV2Text2Img.generate: result: {len(result)}")
        return result
