from pydantic import BaseSettings


# --------------------------------------------
# CLI settings
# --------------------------------------------
class Settings(BaseSettings):
    morpheus_username: str = ""
    morpheus_password: str = ""

    firebase_api_key: str = ""
    firebase_auth_url: str = "http://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword"

    base_url = "http://localhost:8001"

    class Config:
        env_file = ".env"


def get_settings() -> Settings:
    settings = Settings()
    return settings


settings = get_settings()


# --------------------------------------------
# Model settings
# --------------------------------------------
class ModelConfig(BaseSettings):
    model: str = "stabilityai/stable-diffusion-2"
    sampler: str = "PNDMScheduler"
    negative_prompt: str = "ugly, low resolution"
    width: int = 768
    height: int = 768
    num_inference_steps: int = 70
    guidance_scale: int = 15
    num_images_per_prompt: int = 1
    generator: int = -1

    class Config:
        env_file = ".env"


def get_model_config() -> ModelConfig:
    model_config = ModelConfig()
    return model_config


model_config = get_model_config()
