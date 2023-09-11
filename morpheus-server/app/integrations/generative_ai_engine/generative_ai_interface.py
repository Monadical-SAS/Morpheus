from abc import ABC, abstractmethod

from PIL import Image

from morpheus_data.models.schemas import MagicPrompt, Prompt, PromptControlNet


class GenerativeAIInterface(ABC):
    @staticmethod
    @abstractmethod
    def generate_text2img_images(prompt: Prompt) -> str:
        raise NotImplementedError("This method is not implemented")

    @staticmethod
    @abstractmethod
    def generate_img2img_images(prompt: Prompt, image: Image) -> str:
        raise NotImplementedError("This method is not implemented")

    @staticmethod
    @abstractmethod
    def generate_controlnet_images(prompt: PromptControlNet, image: Image) -> str:
        raise NotImplementedError("This method is not implemented")

    @staticmethod
    @abstractmethod
    def generate_pix2pix_images(prompt: Prompt, image: Image) -> str:
        raise NotImplementedError("This method is not implemented")

    @staticmethod
    @abstractmethod
    def generate_inpainting_images(prompt: Prompt, image: Image, mask: Image) -> str:
        raise NotImplementedError("This method is not implemented")

    @staticmethod
    @abstractmethod
    def generate_upscaling_images(prompt: Prompt, image: Image) -> str:
        raise NotImplementedError("This method is not implemented")

    @staticmethod
    @abstractmethod
    def generate_magicprompt(prompt: MagicPrompt) -> str:
        raise NotImplementedError("This method is not implemented")
