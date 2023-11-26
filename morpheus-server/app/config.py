import importlib
from enum import Enum
from functools import lru_cache

from morpheus_data.config import Settings as SettingsData
from omegaconf import OmegaConf
from pydantic import PostgresDsn


class EnvironmentEnum(str, Enum):
    local = "local"
    dev = "dev"
    stage = "stage"
    prod = "prod"


class GenerativeAIBackendEnum(str, Enum):
    celery = "celery"
    ray = "ray"


class Settings(SettingsData):
    environment: EnvironmentEnum = EnvironmentEnum.local

    allowed_origins: str = "http://localhost:3000,http://localhost:3001"
    generative_ai_backend: str = GenerativeAIBackendEnum.ray
    ray_backend_url: str = "http://worker-ray:8000"
    waiting_room_enabled: bool = True
    max_tasks_per_worker: int = 8

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
