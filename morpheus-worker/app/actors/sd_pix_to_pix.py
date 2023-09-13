import io
import logging
from typing import Any

import ray
from PIL import Image

from app.actors.common.sd_base import StableDiffusionAbstract
from app.schemas.schemas import Prompt


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
        self.logger = logging.getLogger(__name__)

    def generate(self, prompt: Prompt):
        self.logger.info(f"StableDiffusionPixToPix.generate: prompt: {prompt}")
        image = Image.open(io.BytesIO(prompt.image))
        self.set_generator(prompt.generator)
        result = self.pipeline(
            image=image,
            prompt=prompt.prompt,
            negative_prompt=prompt.negative_prompt,
            guidance_scale=prompt.guidance_scale,
            num_inference_steps=prompt.num_inference_steps,
            num_images_per_prompt=prompt.num_images_per_prompt,
            generator=self.generator,
        ).images
        self.logger.info(f"StableDiffusionPixToPix.generate: result: {len(result)}")
        return result
