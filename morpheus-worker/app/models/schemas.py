from enum import Enum
from typing import Optional, List
from uuid import UUID

from app.settings.settings import get_settings
from app.utils.prompts import generate_random_prompt
from pydantic import BaseModel

settings = get_settings()


class CategoryEnum(str, Enum):
    TEXT_TO_IMAGE = "text2img"
    IMAGE_TO_IMAGE = "img2img"
    PIX_TO_PIX = "pix2pix"
    UPSCALING = "upscaling"
    INPAINTING = "inpainting"


class Request(BaseModel):
    task_id: str
    prompt: str = "a beautiful cat with blue eyes, artwork, fujicolor, trending on artstation"
    negative_prompt: str = "bad, low res, ugly, deformed"
    width: int = 768
    height: int = 768
    num_inference_steps: int = 50
    guidance_scale: int = 10
    num_images_per_prompt: int = 1
    generator: int = -1
    strength: Optional[float] = 0.75
    pipeline: str = settings.default_pipeline
    scheduler: str = settings.default_scheduler
    model_id: str = settings.default_model
    user_id: str

    class Config:
        schema_extra = {
            "example": generate_random_prompt(),
            "exclude": ["image", "mask"],
        }


class ModelRequest(Request):
    image: Optional[bytes] = None
    mask: Optional[bytes] = None


class Generation(BaseModel):
    id: UUID
    results: List[str] = []
    failed: bool = False
