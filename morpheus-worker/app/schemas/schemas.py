from typing import Optional

from pydantic import BaseModel


class PromptRequest(BaseModel):
    prompt: str
    img_size: int = 512


class Prompt(BaseModel):
    prompt: str
    model: str
    sampler: str
    negative_prompt: str
    width: int = 512
    height: int = 512
    num_inference_steps: int = 50
    guidance_scale: int = 10
    num_images_per_prompt: int = 1
    generator: int = -1
    strength: Optional[float] = 0.75

    class Config:
        schema_extra = {
            "example": {
                "prompt": "Prompt text",
                "model": "stabilityai/stable-diffusion-2",
                "sampler": "Euler",
                "negative_prompt": "Negative prompt text",
                "width": 512,
                "height": 512,
                "num_inference_steps": 50,
                "guidance_scale": 10,
                "num_images_per_prompt": 1,
                "generator": -1,
                "strength": 0.75,
            }
        }
