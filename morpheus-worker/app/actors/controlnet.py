import logging
from io import BytesIO

import ray
from PIL import Image

from app.actors.common.sd_base import StableDiffusionAbstract
from app.models.schemas import ModelRequest
from app.utils.controlnet import preprocessing_image


@ray.remote(num_gpus=1)
class StableDiffusionControlnet(StableDiffusionAbstract):
    def __init__(
            self, *,
            pipeline: str = "StableDiffusionXLImg2ImgPipeline",
            scheduler: str = "DDPMScheduler",
            model_id: str = "stabilityai/stable-diffusion-xl-refiner-1.0",
            controlnet_id: str = "lllyasviel/sd-controlnet-canny"
    ):
        super().__init__(
            pipeline=pipeline,
            scheduler=scheduler,
            model_id=model_id,
            controlnet_id=controlnet_id
        )
        self.logger = logging.getLogger("ray")

    def generate(self, request: ModelRequest):
        self.logger.info(f"StableDiffusionControlnet.generate: request: {request}")
        self.set_generator(request.generator)
        image = Image.open(BytesIO(request.image)).convert("RGB")
        base_image = preprocessing_image.get(request.controlnet_type)(image)
        result = self.pipeline(
            image=base_image,
            prompt=request.prompt,
            negative_prompt=request.negative_prompt,
            guidance_scale=request.guidance_scale,
            num_inference_steps=request.num_inference_steps,
            num_images_per_prompt=request.num_images_per_prompt,
            strength=request.strength,
            generator=self.generator,
        ).images
        result.insert(0, base_image)
        self.logger.info(f"StableDiffusionControlnet.generate: result: {len(result)}")
        return result
