from pydantic import BaseSettings


class Settings(BaseSettings):
    model_parent_path: str = "/mnt/"
    default_model: str = "stabilityai/stable-diffusion-2"
    controlnet_default_model = "lllyasviel/sd-controlnet-canny"
    magicprompt_default_model = "Gustavosta/MagicPrompt-Stable-Diffusion"
    upscaling_model_default = "stabilityai/stable-diffusion-x4-upscaler"
    default_scheduler: str = "PNDMScheduler"
    hf_auth_token: str = ""
    enable_float32: bool = False
    max_num_images: int = 4
