import logging
from io import BytesIO

import ray
import torch
from PIL import Image

from app.actors.common.sd_base import StableDiffusionAbstract
from app.models.schemas import ModelRequest


@ray.remote(num_gpus=1)
class StableDiffusionPixToPix(StableDiffusionAbstract):
    def __init__(
            self, *,
            pipeline: str = "StableDiffusionInstructPix2PixPipeline",
            scheduler: str = "DDPMScheduler",
            model_id: str = "timbrooks/instruct-pix2pix"
    ):
        super().__init__(
            pipeline=pipeline,
            scheduler=scheduler,
            model_id=model_id
        )
        self.logger = logging.getLogger("ray")

    def _warmup(self):
        if self.device != "cuda":
            return
        self.logger.info("Running pix2pix warmup pass...")
        try:
            dummy = Image.new("RGB", (128, 128))
            with torch.no_grad():
                self.pipeline(image=dummy, prompt="warmup", num_inference_steps=1, output_type="latent")
            self.logger.info("Warmup complete")
        except Exception as e:
            self.logger.warning(f"Warmup failed (non-fatal): {e}")

    def generate(self, request: ModelRequest):
        self.logger.info(f"StableDiffusionPixToPix.generate: request: {request.dict(exclude={'image', 'palette_image', 'mask'})}")
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
        self.logger.info(f"StableDiffusionPixToPix.generate: result: {len(result)}")
        return result
