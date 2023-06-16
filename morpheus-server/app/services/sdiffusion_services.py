from typing import Any

from PIL import Image
from sqlalchemy.orm import Session

from app.config import get_settings
from app.error.error import ImageNotProvidedError, ModelNotFoundError, UserNotFoundError
from app.models.schemas import MagicPrompt, PromptControlNet, Prompt
from app.repository.model_repository import ModelRepository
from app.repository.sdiffusion_repository import StableDiffusionRepository
from app.repository.user_repository import UserRepository
from app.utils.images import get_rgb_image_from_bytes, resize_image


class StableDiffusionService:
    def __init__(self):
        self.sd_repository = StableDiffusionRepository()
        self.model_repository = ModelRepository()
        self.user_repository = UserRepository()
        self.settings = get_settings()

    def generate_text2img_images(self, db: Session, prompt: Prompt, email: str) -> str:
        self.validate_request(db=db, model=prompt.model, email=email)
        prompt.model = f"{self.settings.model_parent_path}{prompt.model}"
        return self.sd_repository.generate_text2img_images(prompt)

    def generate_img2img_images(self, db: Session, prompt: Prompt, image: Any, email: str) -> str:
        self.validate_request(db=db, model=prompt.model, email=email)
        image = self.validate_and_clean_image(image=image, width=prompt.width)
        prompt.model = f"{self.settings.model_parent_path}{prompt.model}"
        return self.sd_repository.generate_img2img_images(prompt, image)

    def generate_controlnet_images(self, db: Session, prompt: PromptControlNet, image: Any, email: str) -> str:
        self.validate_request(db=db, model=prompt.model, email=email)
        image = self.validate_and_clean_image(image=image, width=prompt.width)
        prompt.model = f"{self.settings.model_parent_path}{prompt.model}"
        return self.sd_repository.generate_controlnet_images(prompt, image)

    def generate_pix2pix_images(self, db: Session, prompt: Prompt, image: Any, email: str) -> str:
        self.validate_request(db=db, model=prompt.model, email=email)
        image = self.validate_and_clean_image(image=image, width=prompt.width)
        prompt.model = f"{self.settings.model_parent_path}{prompt.model}"
        return self.sd_repository.generate_pix2pix_images(prompt, image)

    def generate_inpainting_images(self, db: Session, prompt: Prompt, image: Any, mask: Any, email: str) -> str:
        self.validate_request(db=db, model=prompt.model, email=email)
        image = self.validate_and_clean_image(image=image, width=512, height=512)
        mask = self.validate_and_clean_image(image=mask, width=512, height=512)
        prompt.model = f"{self.settings.model_parent_path}{prompt.model}"
        return self.sd_repository.generate_inpainting_images(prompt, image, mask)

    def generate_upscaling_images(self, db: Session, prompt: Prompt, image: Any, email: str) -> str:
        self.validate_request(db=db, model=prompt.model, email=email)
        image = self.validate_and_clean_image(image=image)
        prompt.width = image.width
        prompt.height = image.height
        prompt.model = f"{self.settings.model_parent_path}{prompt.model}"
        return self.sd_repository.generate_upscaling_images(prompt, image)

    def generate_magicprompt(self, db: Session, prompt: MagicPrompt, email: str) -> str:
        self.validate_magicprompt_request(db=db, email=email)
        # prompt.config.model = f"{self.settings.model_parent_path}{prompt.config.model}"
        return self.sd_repository.generate_magicprompt(prompt)

    def validate_request(self, db: Session, model: str, email: str) -> None:
        db_user = self.user_repository.get_user_by_email(db=db, email=email)
        if not db_user:
            raise UserNotFoundError(f"User with email {email} not found")

        db_model = self.model_repository.get_model_by_source(db=db, model_source=model)
        if not db_model:
            raise ModelNotFoundError(f"model {model} does not exist in db")

    def validate_magicprompt_request(self, db: Session, email: str) -> None:
        db_user = self.user_repository.get_user_by_email(db=db, email=email)
        if not db_user:
            raise UserNotFoundError(f"User with email {email} not found")

    def validate_and_clean_image(self, *, image: Any, width: int = None, height: int = None) -> Image:
        if not image:
            raise ImageNotProvidedError("Image not provided")

        image = get_rgb_image_from_bytes(image)
        image = resize_image(image=image, width=width, height=height)
        return image
