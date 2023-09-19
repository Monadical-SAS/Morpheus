import logging
from io import BytesIO

import ray
from PIL import Image

from app.actors.common.sd_base import StableDiffusionAbstract
from app.models.schemas import ModelRequest


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
        self.logger = logging.getLogger("ray")

    def generate(self, request: ModelRequest):
        self.logger.info(f"StableDiffusionUpscaling.generate: request: {request}")
        self.set_generator(request.generator)
        image = Image.open(BytesIO(request.image)).convert("RGB")
        result = self.pipeline(
            image=image,
            prompt=request.prompt,
            negative_prompt=request.negative_prompt,
            guidance_scale=request.guidance_scale,
            num_inference_steps=request.num_inference_steps,
            num_images_per_prompt=request.num_images_per_prompt,
            generator=self.generator,
        ).images
        self.logger.info(f"StableDiffusionUpscaling.generate: result: {len(result)}")
        return result
