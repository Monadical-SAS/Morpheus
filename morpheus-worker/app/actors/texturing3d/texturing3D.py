import torch
from diffusers import (
    UNet2DConditionModel,
)
from loguru import logger

from app.actors.common.sd_base import StableDiffusionAbstract


class Texturing3DDepthDiffusion(StableDiffusionAbstract):
    def __init__(self):
        super().__init__(
            pipeline="StableDiffusionDepth2ImgPipeline",
            model_id="stabilityai/stable-diffusion-2-depth",
            dtype=torch.float32,
        )


class Texturing3DInpaintingDiffusion(StableDiffusionAbstract):
    def __init__(self):
        super().__init__(
            pipeline="StableDiffusionInpaintPipeline",
            model_id="stabilityai/stable-diffusion-2-inpainting",
            dtype=torch.float32,
        )


class Texturing3D:
    def __init__(self):
        self.depth_model_name = "stabilityai/stable-diffusion-2-depth"
        self.inpainting_model_name = "stabilityai/stable-diffusion-2-inpainting"

        self.depth_model = Texturing3DDepthDiffusion()
        self.depth_model = self.depth_model.pipeline
        self.inpainting_model = Texturing3DInpaintingDiffusion()
        self.inpainting_model = self.inpainting_model.pipeline
        self.inpaint_unet = UNet2DConditionModel.from_pretrained(
            self.inpainting_model_name, subfolder="unet"
        )
        logger.info("models loaded")
