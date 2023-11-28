import logging
from io import BytesIO

import ray
from PIL import Image

from app.actors.common.sd_base import StableDiffusionAbstract
from app.models.schemas import ModelRequest
from app.utils.color_palette import get_image_to_image_palette_base


@ray.remote(num_gpus=1)
class StableDiffusionImageToImage(StableDiffusionAbstract):
    def __init__(
        self,
        *,
        pipeline: str,
        scheduler: str,
        model_id: str,
    ):
        pipeline = pipeline or "StableDiffusionXLImg2ImgPipeline"
        scheduler = scheduler or "DDPMScheduler"
        model_id = model_id or "stabilityai/stable-diffusion-xl-refiner-1.0"
        self.logger = logging.getLogger("ray")
        super().__init__(
            pipeline=pipeline,
            scheduler=scheduler,
            model_id=model_id,
        )

    def generate(self, request: ModelRequest):
        self.logger.info(f"StableDiffusionImageToImage.generate: request: {request}")
        self.set_generator(request.generator)
        image = Image.open(BytesIO(request.image)).convert("RGB")
        if request.palette_image:
            palette_image = get_image_to_image_palette_base(
                palette_option=request.palette_option,
                base_image=image,
                palette_image=Image.open(BytesIO(request.palette_image)).convert("RGB"),
            )
            image = palette_image if palette_image else image

        result = self.pipeline(
            image=image,
            prompt=request.prompt,
            negative_prompt=request.negative_prompt,
            guidance_scale=request.guidance_scale,
            num_inference_steps=request.num_inference_steps,
            num_images_per_prompt=request.num_images_per_prompt,
            strength=request.strength,
            generator=self.generator,
        ).images
        self.logger.info(f"StableDiffusionImageToImage.generate: result: {len(result)}")
        return result
