from typing import Union

from PIL import Image
from app.config import get_settings
from app.error.error import ImageNotProvidedError, ModelNotFoundError
from app.error.generation import GenerationNotFoundError, ImageTooLargeError
from app.integrations.generative_ai_engine.generative_ai_interface import GenerativeAIInterface
from morpheus_data.models.schemas import GenerationRequest, TextGenerationRequest
from morpheus_data.models.schemas import MagicPrompt, Prompt, PromptControlNet
from morpheus_data.repository.generation_repository import GenerationRepository
from morpheus_data.repository.model_repository import ModelRepository
from morpheus_data.repository.user_repository import UserRepository
from morpheus_data.utils.images import get_rgb_image_from_bytes
from sqlalchemy.orm import Session


class StableDiffusionService:
    def __init__(self, generative_ai_generator: GenerativeAIInterface):
        self.sd_generator = generative_ai_generator
        self.generation_repository = GenerationRepository()
        self.model_repository = ModelRepository()
        self.user_repository = UserRepository()
        self.settings = get_settings()

    def get_generation_result(self, db: Session, task_id: str) -> str:
        generation = self.generation_repository.get_generation(db=db, generation_id=task_id)
        if generation is None:
            raise GenerationNotFoundError(f"Generation with id {task_id} not found")
        return generation

    def generate_text2img_images(self, db: Session, prompt: Prompt, email: str) -> str:
        backend_request = self._build_backend_request(db=db, prompt=prompt, email=email)
        if backend_request.model_id == "stabilityai/stable-diffusion-xl-base-1.0":
            backend_request.pipeline = "StableDiffusionXLPipeline"
        else:
            backend_request.pipeline = "StableDiffusionPipeline"
        return self.sd_generator.generate_text2img_images(request=backend_request)

    def generate_img2img_images(self, db: Session, prompt: Prompt, image: bytes, email: str) -> str:
        backend_request = self._build_backend_request(db=db, prompt=prompt, email=email)
        if backend_request.model_id == "stabilityai/stable-diffusion-xl-base-1.0":
            backend_request.pipeline = "StableDiffusionXLImg2ImgPipeline"
            backend_request.model_id = "stabilityai/stable-diffusion-xl-refiner-1.0"
        else:
            backend_request.pipeline = "StableDiffusionImg2ImgPipeline"
        image = self._validate_and_clean_image(image=image)
        return self.sd_generator.generate_img2img_images(request=backend_request, image=image)

    def generate_controlnet_images(self, db: Session, prompt: PromptControlNet, image: bytes, email: str) -> str:
        backend_request = self._build_backend_request(db=db, prompt=prompt, email=email)
        backend_request.pipeline = "StableDiffusionControlNetPipeline"
        backend_request.model_id = "runwayml/stable-diffusion-v1-5"
        image = self._validate_and_clean_image(image=image)
        return self.sd_generator.generate_controlnet_images(request=backend_request, image=image)

    def generate_pix2pix_images(self, db: Session, prompt: Prompt, image: bytes, email: str) -> str:
        backend_request = self._build_backend_request(db=db, prompt=prompt, email=email)
        backend_request.pipeline = "StableDiffusionInstructPix2PixPipeline"
        image = self._validate_and_clean_image(image=image)
        return self.sd_generator.generate_pix2pix_images(request=backend_request, image=image)

    def generate_inpainting_images(self, db: Session, prompt: Prompt, image: bytes, mask: bytes, email: str) -> str:
        backend_request = self._build_backend_request(db=db, prompt=prompt, email=email)
        if backend_request.model_id == "stabilityai/stable-diffusion-xl-base-1.0":
            backend_request.pipeline = "StableDiffusionXLInpaintPipeline"
        else:
            backend_request.pipeline = "StableDiffusionInpaintPipeline"
        image = self._validate_and_clean_image(image=image)
        mask = self._validate_and_clean_image(image=mask)
        return self.sd_generator.generate_inpainting_images(request=backend_request, image=image, mask=mask)

    def generate_upscaling_images(self, db: Session, prompt: Prompt, image: bytes, email: str) -> str:
        backend_request = self._build_backend_request(db=db, prompt=prompt, email=email)
        backend_request.pipeline = "StableDiffusionUpscalePipeline"
        image = self._validate_and_clean_image(image=image)
        if image.width > 512 or image.height > 512:
            raise ImageTooLargeError("Image size for upscaling must be less than 512x512")

        prompt.width = image.width
        prompt.height = image.height
        return self.sd_generator.generate_upscaling_images(request=backend_request, image=image)

    def generate_magic_prompt(self, prompt: MagicPrompt, email: str) -> str:
        backend_request = TextGenerationRequest(prompt=prompt.prompt, user_id=email)
        return self.sd_generator.generate_magic_prompt(request=backend_request)

    def _validate_request(self, db: Session, model: str = None) -> None:
        db_model = self.model_repository.get_model_by_source(db=db, model_source=model)
        if not db_model:
            raise ModelNotFoundError(f"model {model} does not exist in db")

    def _build_backend_request(
            self,
            db: Session,
            prompt: Union[Prompt, PromptControlNet],
            email: str
    ) -> GenerationRequest:
        self._validate_request(db=db, model=prompt.model)
        pipeline = hasattr(prompt, "pipeline") and prompt.pipeline or "StableDiffusionPipeline"
        request_dict = {
            **prompt.dict(),
            "user_id": email,
            "pipeline": pipeline,
            "scheduler": prompt.sampler,
            "model_id": prompt.model,
        }
        if hasattr(prompt, "controlnet_model"):
            request_dict["controlnet_id"] = prompt.controlnet_model
        if hasattr(prompt, "controlnet_type"):
            request_dict["controlnet_type"] = prompt.controlnet_type

        backend_request = GenerationRequest(**request_dict)
        return backend_request

    def _validate_and_clean_image(self, *, image: bytes) -> Image:
        if not image:
            raise ImageNotProvidedError("Image not provided")

        try:
            return get_rgb_image_from_bytes(image)
        except Exception as e:
            raise ImageNotProvidedError(f"Invalid image provided: {e}")
