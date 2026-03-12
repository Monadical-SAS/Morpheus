import importlib
from enum import Enum
from functools import lru_cache

from omegaconf import OmegaConf
from pydantic import BaseSettings, PostgresDsn


class EnvironmentEnum(str, Enum):
    local = "local"
    dev = "dev"
    stage = "stage"
    prod = "prod"


class GenerativeAIBackendEnum(str, Enum):
    celery = "celery"
    ray = "ray"


class Settings(BaseSettings):
    postgres_user: str = "postgres"
    postgres_password: str = "password"
    postgres_host: str = "postgres"
    postgres_port: str = "5432"
    postgres_db: str = "morpheus"

    firebase_project_id: str
    firebase_private_key: str
    firebase_client_email: str
    firebase_web_api_key: str

    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    bucket_type: str = "S3"
    models_bucket: str
    images_bucket: str
    images_temp_bucket: str
    firebase_storage_bucket: str = ""

    temp_model_folder: str = "./tmp"
    default_scheduler: str = "DDPMScheduler"
    default_pipeline: str = "StableDiffusionXLPipeline"
    default_model: str = "stabilityai/stable-diffusion-xl-base-1.0"
    max_num_images: int = 4

    admin_email: str = "admin@morpheus.com"
    admin_password: str = "morpheusAdmin"

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
        "module": "app.repository.files.s3_files_repository",
        "handler": "S3ImagesRepository",
    },
    "Firebase": {
        "module": "app.repository.files.firebase_files_repository",
        "handler": "FirebaseImagesRepository",
    },
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
        module_import = importlib.import_module(file_handlers[settings.bucket_type]["module"])
        file_handler = getattr(module_import, file_handlers[settings.bucket_type]["handler"])
        return file_handler()
    except Exception as e:
        print("Error getting file handler", e)
        return None


@lru_cache()
def get_generative_ai_backend():
    settings = get_settings()
    try:
        module_import = importlib.import_module(backend_handlers[settings.generative_ai_backend]["module"])
        backend = getattr(module_import, backend_handlers[settings.generative_ai_backend]["handler"])
        return backend()
    except Exception as e:
        print("Error getting generative ai backend", e)
        return None
