from PIL import Image
from app.integrations.generative_ai_engine.generative_ai_interface import (
    GenerativeAIInterface,
)
from loguru import logger
from morpheus_data.models.schemas import GenerationRequest, TextGenerationRequest


class GenerativeAIStableDiffusionCelery(GenerativeAIInterface):
    @staticmethod
    def generate_text2img_images(*, request: GenerationRequest) -> str:
        logger.info(f"Running Stable Diffusion Text2Img process with request: {request}")
        raise NotImplementedError("Stable Diffusion Text2Img is not implemented yet.")

    @staticmethod
    def generate_img2img_images(*, request: GenerationRequest, image: Image, palette_image: Image = None) -> str:
        logger.info(f"Running Stable Diffusion Img2Img process with request: {request}")
        raise NotImplementedError("Stable Diffusion Img2Img is not implemented yet.")

    @staticmethod
    def generate_controlnet_images(*, request: GenerationRequest, image: Image, palette_image: Image = None) -> str:
        logger.info(f"Running stable diffusion process with request: {request}")
        raise NotImplementedError("Stable Diffusion ControlNet is not implemented yet.")

    @staticmethod
    def generate_pix2pix_images(*, request: GenerationRequest, image: Image) -> str:
        logger.info(f"Running Stable Diffusion Pix2Pix process with request: {request}")
        raise NotImplementedError("Stable Diffusion Pix2Pix is not implemented yet.")

    @staticmethod
    def generate_inpainting_images(*, request: GenerationRequest, image: Image, mask: Image) -> str:
        logger.info(f"Running Stable Diffusion Inpainting process with request: {request}")
        raise NotImplementedError("Stable Diffusion Inpainting is not implemented yet.")

    @staticmethod
    def generate_upscaling_images(*, request: GenerationRequest, image: Image) -> str:
        logger.info(f"Running Stable Diffusion Upscaling process with request: {request}")
        raise NotImplementedError("Stable Diffusion Upscaling is not implemented yet.")

    @staticmethod
    def generate_magic_prompt(*, request: TextGenerationRequest) -> str:
        logger.info(f"Running Stable Diffusion MagicPrompt process with request: {request}")
        raise NotImplementedError("Stable Diffusion MagicPrompt is not implemented yet.")
