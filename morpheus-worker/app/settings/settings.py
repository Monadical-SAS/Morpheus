from pydantic import BaseSettings


class Settings(BaseSettings):
    aws_access_key_id: str
    aws_secret_access_key: str
    images_bucket: str
    models_folder: str = "/mnt/"
    pipeline_name_default: str = "StableDiffusionXLPipeline"
    model_default: str = "stabilityai/stable-diffusion-xl-base-1.0"
    scheduler_default: str = "DDPMScheduler"
    enable_float32: bool = False
    enable_attention_slicing: bool = False

    class Config:
        env_file = "secrets.env"


def get_settings():
    settings = Settings()
    return settings
