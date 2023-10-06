import importlib
from enum import Enum
from functools import lru_cache

from morpheus_data.config import Settings as SettingsData
from omegaconf import OmegaConf
from pydantic import PostgresDsn


class EnvironmentEnum(str, Enum):
    local = "local"
    local_mps = "local-mps"
    dev = "dev"
    stage = "stage"
    prod = "prod"


class GenerativeAIBackendEnum(str, Enum):
    celery = "celery"
    ray = "ray"


class Settings(SettingsData):
    environment: EnvironmentEnum = EnvironmentEnum.local

    model_parent_path: str = "/mnt/"
    default_model: str = "stabilityai/stable-diffusion-2"
    controlnet_default_model = "lllyasviel/sd-controlnet-canny"
    magicprompt_default_model = "Gustavosta/MagicPrompt-Stable-Diffusion"
    upscaling_model_default = "stabilityai/stable-diffusion-x4-upscaler"
    default_scheduler: str = "PNDMScheduler"
    hf_auth_token: str = ""
    enable_float32: bool = False
    max_num_images: int = 4

    generative_ai_backend: str = GenerativeAIBackendEnum.celery
    waiting_room_enabled: bool = True
    max_tasks_per_worker: int = 8

    celery_broker_url: str = "redis://redis:6379/0"
    celery_result_backend: str = "redis://redis:6379/0"
    celery_stable_diffusion_queue: str = "stable_diffusion"
    celery_magic_prompt_queue: str = "magic_prompt"
    celery_default_queue: str = "default"
    celery_worker_prefetch_multiplier: int = 1

    class Config:
        env_file = "secrets.env"

    def get_db_url(self) -> str:
        return PostgresDsn.build(
            scheme="postgresql",
            user=self.postgres_user,
            password=self.postgres_password,
            host=self.postgres_host,
            port=self.postgres_port,
            path=f"/{self.postgres_db}",
        )


@lru_cache()
def get_settings() -> Settings:
    settings = Settings()
    return settings


@lru_cache()
def read_available_samplers(file: str):
    return OmegaConf.load(file)


samplers = read_available_samplers("config/sd-schedulers.yaml")

file_handlers = {
    "S3": {
        "module": "morpheus_data.repository.files.s3_files_repository",
        "handler": "S3ImagesRepository",
    }
}

backend_handlers = {
    "celery": {
        "module": "app.integrations.generative_ai_engine.sdiffusion_celery",
        "handler": "GenerativeAIStableDiffusionCelery",
    },
    "ray": {
        "module": "app.integrations.generative_ai_engine.sdiffusion_ray",
        "handler": "GenerativeAIStableDiffusionRay",
    },
}


@lru_cache()
def get_file_handlers():
    settings = get_settings()
    try:
        module_import = importlib.import_module(
            file_handlers[settings.bucket_type]["module"]
        )
        file_handler = getattr(
            module_import, file_handlers[settings.bucket_type]["handler"]
        )
        return file_handler()
    except Exception as e:
        print("Error getting file handler", e)
        return None


@lru_cache()
def get_generative_ai_backend():
    settings = get_settings()
    try:
        module_import = importlib.import_module(
            backend_handlers[settings.generative_ai_backend]["module"]
        )
        backend = getattr(
            module_import, backend_handlers[settings.generative_ai_backend]["handler"]
        )
        return backend()
    except Exception as e:
        print("Error getting generative ai backend", e)
        return None
