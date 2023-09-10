import uuid
from typing import Optional, Any

from pydantic import BaseModel
from app.settings.settings import get_settings

settings = get_settings()


class Prompt(BaseModel):
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
            "example": {
                "task_id": str(uuid.uuid4()),
                "prompt": "a beautiful cat with blue eyes, artwork, fujicolor, trending on artstation",
                "negative_prompt": "bad, low res, ugly, deformed",
                "width": 768,
                "height": 768,
                "num_inference_steps": 50,
                "guidance_scale": 10,
                "num_images_per_prompt": 1,
                "generator": -1,
                "strength": 0.75,
                "pipeline": settings.default_pipeline,
                "scheduler": settings.default_scheduler,
                "model_id": settings.default_model,
                "user_id": "ray@morpheus.com",
            }
        }
