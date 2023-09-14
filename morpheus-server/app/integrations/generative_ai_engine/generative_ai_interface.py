from abc import ABC, abstractmethod

from PIL import Image
from morpheus_data.models.schemas import MagicPrompt, Prompt, PromptControlNet


class GenerativeAIInterface(ABC):
    @staticmethod
    @abstractmethod
    def generate_text2img_images(prompt: Prompt, **kwargs) -> str:
        raise NotImplementedError("generate_text2img_images method is not implemented")

    @staticmethod
    @abstractmethod
    def generate_img2img_images(prompt: Prompt, image: Image, **kwargs) -> str:
        raise NotImplementedError("generate_img2img_images method is not implemented")

    @staticmethod
    @abstractmethod
    def generate_controlnet_images(prompt: PromptControlNet, image: Image, **kwargs) -> str:
        raise NotImplementedError("generate_controlnet_images method is not implemented")

    @staticmethod
    @abstractmethod
    def generate_pix2pix_images(prompt: Prompt, image: Image, **kwargs) -> str:
        raise NotImplementedError("generate_pix2pix_images method is not implemented")

    @staticmethod
    @abstractmethod
    def generate_inpainting_images(prompt: Prompt, image: Image, mask: Image, **kwargs) -> str:
        raise NotImplementedError("generate_inpainting_images method is not implemented")

    @staticmethod
    @abstractmethod
    def generate_upscaling_images(prompt: Prompt, image: Image, **kwargs) -> str:
        raise NotImplementedError("generate_upscaling_images method is not implemented")

    @staticmethod
    @abstractmethod
    def generate_magicprompt(prompt: MagicPrompt, **kwargs) -> str:
        raise NotImplementedError("generate_magicprompt method is not implemented")
