from PIL import Image
from app.config import get_settings
from app.error.error import ImageNotProvidedError, ModelNotFoundError, UserNotFoundError
from app.integrations.generative_ai_engine.generative_ai_interface import GenerativeAIInterface
from morpheus_data.models.schemas import MagicPrompt, Prompt, PromptControlNet
from morpheus_data.repository.generation_repository import GenerationRepository
from morpheus_data.repository.model_repository import ModelRepository
from morpheus_data.repository.user_repository import UserRepository
from morpheus_data.utils.images import get_rgb_image_from_bytes, resize_image
from sqlalchemy.orm import Session


class StableDiffusionService:
    def __init__(self, generative_ai_generator: GenerativeAIInterface):
        self.sd_generator = generative_ai_generator
        self.generation_repository = GenerationRepository()
        self.model_repository = ModelRepository()
        self.user_repository = UserRepository()
        self.settings = get_settings()

    def build_backend_request(self, db: Session, prompt: Prompt, email: str) -> dict:
        self.validate_request(db=db, model=prompt.model, email=email)
        generation_db = self.generation_repository.create_generation(db=db)
        pipeline = hasattr(prompt, "pipeline") and prompt.pipeline or "StableDiffusionPipeline"

        backend_request = {
            **prompt.dict(),
            "task_id": generation_db.id,
            "user_id": email,
            "model_id": prompt.model,
            "scheduler": prompt.sampler,
            "pipeline": pipeline,
        }
        return backend_request

    def generate_text2img_images(self, db: Session, prompt: Prompt, email: str) -> str:
        backend_request = self.build_backend_request(db=db, prompt=prompt, email=email)
        return self.sd_generator.generate_text2img_images(prompt=prompt, **backend_request)

    def generate_img2img_images(self, db: Session, prompt: Prompt, image: bytes, email: str) -> str:
        backend_request = self.build_backend_request(db=db, prompt=prompt, email=email)
        image = self.validate_and_clean_image(image=image, width=prompt.width)
        return self.sd_generator.generate_img2img_images(prompt, image, **backend_request)

    def generate_controlnet_images(self, db: Session, prompt: PromptControlNet, image: bytes, email: str) -> str:
        backend_request = self.build_backend_request(db=db, prompt=prompt, email=email)
        image = self.validate_and_clean_image(image=image, width=prompt.width)
        return self.sd_generator.generate_controlnet_images(prompt, image, **backend_request)

    def generate_pix2pix_images(self, db: Session, prompt: Prompt, image: bytes, email: str) -> str:
        backend_request = self.build_backend_request(db=db, prompt=prompt, email=email)
        image = self.validate_and_clean_image(image=image, width=prompt.width)
        return self.sd_generator.generate_pix2pix_images(prompt, image, **backend_request)

    def generate_inpainting_images(self, db: Session, prompt: Prompt, image: bytes, mask: bytes, email: str) -> str:
        backend_request = self.build_backend_request(db=db, prompt=prompt, email=email)
        image = self.validate_and_clean_image(image=image, width=512, height=512)
        mask = self.validate_and_clean_image(image=mask, width=512, height=512)
        return self.sd_generator.generate_inpainting_images(prompt, image, mask, **backend_request)

    def generate_upscaling_images(self, db: Session, prompt: Prompt, image: bytes, email: str) -> str:
        backend_request = self.build_backend_request(db=db, prompt=prompt, email=email)
        image = self.validate_and_clean_image(image=image)
        prompt.width = image.width
        prompt.height = image.height
        return self.sd_generator.generate_upscaling_images(prompt, image, **backend_request)

    def generate_magicprompt(self, db: Session, prompt: MagicPrompt, email: str) -> str:
        self.validate_magicprompt_request(db=db, email=email)
        # prompt.config.model = f"{self.settings.model_parent_path}{prompt.config.model}"
        return self.sd_generator.generate_magicprompt(prompt)

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

    def validate_and_clean_image(self, *, image: bytes, width: int = None, height: int = None) -> Image:
        if not image:
            raise ImageNotProvidedError("Image not provided")

        image = get_rgb_image_from_bytes(image)
        image = resize_image(image=image, width=width, height=height)
        return image
