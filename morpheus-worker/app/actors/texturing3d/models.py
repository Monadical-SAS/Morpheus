from pydantic import BaseModel, Field


class Prompt(BaseModel):
    prompt: str = Field(..., min_length=1)
    negative_prompt: str = "bad, ugly"
    width: int = 512
    height: int = 512
    num_inference_steps: int = 50
    guidance_scale: int = 10
    num_images_per_prompt: int = 1
    generator: int = 42
    strength: float = 0.75
    num_views_3d: int = 8
    front_positive_prompt: str = None
    front_negative_prompt: str = None
    not_front_positive_prompt: str = None
    not_front_negative_prompt: str = None
    inpainting_mode_3d: bool = False
    no_inpainting_mode_3d: bool = False
