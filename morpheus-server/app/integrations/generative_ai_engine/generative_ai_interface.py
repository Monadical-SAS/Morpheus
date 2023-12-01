from abc import ABC, abstractmethod

from PIL import Image
from morpheus_data.models.schemas import GenerationRequest, TextGenerationRequest


class GenerativeAIInterface(ABC):
    @staticmethod
    @abstractmethod
    def generate_text2img_images(*, request: GenerationRequest) -> str:
        raise NotImplementedError("generate_text2img_images method is not implemented")

    @staticmethod
    @abstractmethod
    def generate_img2img_images(*, request: GenerationRequest, image: Image, palette_image: Image = None) -> str:
        raise NotImplementedError("generate_img2img_images method is not implemented")

    @staticmethod
    @abstractmethod
    def generate_controlnet_images(*, request: GenerationRequest, image: Image, palette_image: Image = None) -> str:
        raise NotImplementedError("generate_controlnet_images method is not implemented")

    @staticmethod
    @abstractmethod
    def generate_pix2pix_images(*, request: GenerationRequest, image: Image) -> str:
        raise NotImplementedError("generate_pix2pix_images method is not implemented")

    @staticmethod
    @abstractmethod
    def generate_inpainting_images(*, request: GenerationRequest, image: Image, mask: Image) -> str:
        raise NotImplementedError("generate_inpainting_images method is not implemented")

    @staticmethod
    @abstractmethod
    def generate_upscaling_images(*, request: GenerationRequest, image: Image) -> str:
        raise NotImplementedError("generate_upscaling_images method is not implemented")

    @staticmethod
    @abstractmethod
    def generate_magic_prompt(*, request: TextGenerationRequest) -> str:
        raise NotImplementedError("generate_magic_prompt method is not implemented")
