from enum import Enum
from functools import lru_cache

from pydantic import BaseSettings, PostgresDsn


class EnvironmentEnum(str, Enum):
    local = "local"
    local_mps = "local-mps"
    dev = "dev"
    stage = "stage"
    prod = "prod"


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

    bucket_type: str = "S3"
    images_bucket: str
    images_temp_bucket: str
    models_bucket: str

    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""

    model_default: str = "stabilityai/stable-diffusion-2"
    sampler_default: str = "PNDMScheduler"
    max_num_images: int = 4

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
