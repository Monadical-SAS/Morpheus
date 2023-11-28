from enum import Enum
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel

from app.settings.settings import get_settings
from app.utils.prompts import generate_random_prompt

settings = get_settings()


class CategoryEnum(str, Enum):
    TEXT_TO_IMAGE = "text2img"
    IMAGE_TO_IMAGE = "img2img"
    CONTROLNET = "controlnet"
    PIX_TO_PIX = "pix2pix"
    UPSCALING = "upscaling"
    INPAINTING = "inpainting"


class TextCategoryEnum(str, Enum):
    MAGIC_PROMPT = "magic_prompt"


class GenerationRequest(BaseModel):
    task_id: str = None
    user_id: str = "user@morpheus.com"
    prompt: str = "a beautiful cat with blue eyes, artwork, trending on artstation"
    negative_prompt: str = "bad, low res, ugly, deformed"
    width: int = 768
    height: int = 768
    num_inference_steps: int = 50
    guidance_scale: int = 10
    num_images_per_prompt: int = 1
    generator: int = -1
    strength: Optional[float] = 0.8
    pipeline: str = None
    scheduler: str = None
    model_id: str = None
    controlnet_id: str = None
    controlnet_type: str = None
    palette_option: str = None

    class Config:
        schema_extra = {
            "example": generate_random_prompt(),
        }


class ModelRequest(GenerationRequest):
    image: Optional[bytes] = None
    mask: Optional[bytes] = None
    palette_image: Optional[bytes] = None


class TextGenerationRequest(BaseModel):
    task_id: str = None
    prompt: str = "a beautiful cat with blue eyes, artwork, trending on artstation"
    model_id: str = "Gustavosta/MagicPrompt-Stable-Diffusion"
    user_id: str


class Generation(BaseModel):
    id: UUID
    results: List[str] = []
    status: str = "PENDING"
