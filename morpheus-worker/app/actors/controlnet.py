import logging
from io import BytesIO

import ray
from PIL import Image

from app.actors.common.sd_base import StableDiffusionAbstract
from app.models.schemas import ModelRequest
from app.utils.color_palette import get_controlnet_palette_base
from app.utils.controlnet import preprocessing_image


@ray.remote(num_gpus=1)
class StableDiffusionControlnet(StableDiffusionAbstract):
    def __init__(
        self,
        *,
        pipeline: str,
        scheduler: str,
        model_id: str,
        controlnet_id: str,
    ):
        pipeline = pipeline or "StableDiffusionControlNetImg2ImgPipeline"
        scheduler = scheduler or "DDPMScheduler"
        model_id = model_id or "runwayml/stable-diffusion-v1-5"
        controlnet_id = controlnet_id or "lllyasviel/sd-controlnet-canny"
        self.logger = logging.getLogger("ray")
        super().__init__(
            pipeline=pipeline,
            scheduler=scheduler,
            model_id=model_id,
            controlnet_id=controlnet_id,
        )

    def generate(self, request: ModelRequest):
        self.logger.info(f"StableDiffusionControlnet.generate: request: {request}")
        self.set_generator(request.generator)
        controlnet_type = request.controlnet_type or "canny"
        image = Image.open(BytesIO(request.image)).convert("RGB")
        base_image = preprocessing_image.get(controlnet_type)(image)

        if request.palette_image:
            palette_image = get_controlnet_palette_base(
                palette_option=request.palette_option,
                base_image=image,
                palette_image=Image.open(BytesIO(request.palette_image)).convert("RGB"),
            )
            image = palette_image if palette_image else image

        result = self.pipeline(
            image=image,
            control_image=base_image,
            prompt=request.prompt,
            width=request.width,
            height=request.height,
            num_inference_steps=request.num_inference_steps,
            guidance_scale=request.guidance_scale,
            negative_prompt=request.negative_prompt,
            num_images_per_prompt=request.num_images_per_prompt,
            generator=self.generator,
        ).images
        result.insert(0, base_image)
        self.logger.info(f"StableDiffusionControlnet.generate: result: {len(result)}")
        return result
