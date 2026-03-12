from functools import lru_cache

from pydantic import BaseSettings, PostgresDsn


class Settings(BaseSettings):
    # PostgreSQL database config
    postgres_user: str = "postgres"
    postgres_password: str = "password"
    postgres_host: str = "postgres"
    postgres_port: str = "5432"
    postgres_db: str = "morpheus"

    # Storage config
    bucket_type: str = "S3"
    images_bucket: str
    images_temp_bucket: str
    models_folder: str = "/mnt/"

    # AWS credentials (required when bucket_type=S3)
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""

    # Firebase credentials (required when bucket_type=Firebase)
    firebase_project_id: str = ""
    firebase_private_key: str = ""
    firebase_client_email: str = ""
    firebase_storage_bucket: str = ""

    # Models config
    # DPMSolverMultistepScheduler converges in ~20 steps vs DDPMScheduler's 50+
    default_scheduler: str = "DPMSolverMultistepScheduler"
    default_pipeline: str = "StableDiffusionXLPipeline"
    default_model: str = "stabilityai/stable-diffusion-xl-base-1.0"
    enable_float32: bool = False
    enable_attention_slicing: bool = True

    # Prometheus
    prometheus_instance_name: str = "morpheus"

    def get_db_url(self) -> str:
        return PostgresDsn.build(
            scheme="postgresql",
            user=self.postgres_user,
            password=self.postgres_password,
            host=self.postgres_host,
            port=self.postgres_port,
            path=f"/{self.postgres_db}",
        )

    class Config:
        env_file = "secrets.env"


@lru_cache()
def get_settings():
    return Settings()
