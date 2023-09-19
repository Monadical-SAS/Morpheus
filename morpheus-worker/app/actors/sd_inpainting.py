import io
import logging

import ray
from PIL import Image

from app.actors.common.sd_base import StableDiffusionAbstract
from app.models.schemas import ModelRequest


@ray.remote(num_gpus=1)
class StableDiffusionInpainting(StableDiffusionAbstract):
    def __init__(
            self, *,
            pipeline: str = "StableDiffusionXLInpaintPipeline",
            scheduler: str = "DDPMScheduler",
            model_id: str = "stabilityai/stable-diffusion-xl-base-1.0"
    ):
        super().__init__(
            pipeline=pipeline,
            scheduler=scheduler,
            model_id=model_id
        )
        self.logger = logging.getLogger("ray")

    def generate(self, request: ModelRequest):
        self.logger.info(f"StableDiffusionInpainting.generate: request: {request}")
        self.set_generator(request.generator)
        image = Image.open(io.BytesIO(request.image)).convert("RGB")
        mask = Image.open(io.BytesIO(request.mask)).convert("RGB")

        result = self.pipeline(
            image=image,
            mask_image=mask,
            request=request.prompt,
            negative_request=request.negative_prompt,
            guidance_scale=request.guidance_scale,
            num_inference_steps=request.num_inference_steps,
            num_images_per_request=request.num_images_per_prompt,
            generator=self.generator,
            strength=request.strength,
        ).images
        self.logger.info(f"StableDiffusionInpainting.generate: result: {len(result)}")
        return result
