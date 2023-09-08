from typing import Optional, Any
import uuid

from pydantic import BaseModel


class Prompt(BaseModel):
    task_id: uuid.UUID
    prompt: str = "a beautiful cat with blue eyes, artwork, fujicolor, trending on artstation"
    negative_prompt: str = "bad, low res, ugly, deformed"
    width: int = 768
    height: int = 768
    num_inference_steps: int = 50
    guidance_scale: int = 10
    num_images_per_prompt: int = 1
    generator: int = -1
    strength: Optional[float] = 0.75
    image: Optional[Any] = None
    mask: Optional[Any] = None
    model_id: str
    scheduler: str
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
                "model_id": "stabilityai/stable-diffusion-xl-base-1.0",
                "scheduler": "PNDMScheduler",
                "user_id": "ray@morpheus.com",
            }
        }
