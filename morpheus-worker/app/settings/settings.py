from pydantic import BaseSettings, PostgresDsn


class Settings(BaseSettings):
    # PostgreSQL database config
    postgres_user: str = "postgres"
    postgres_password: str = "password"
    postgres_host: str = "postgres"
    postgres_port: str = "5432"
    postgres_db: str = "morpheus"

    # AWS and s3 config
    aws_access_key_id: str
    aws_secret_access_key: str
    images_bucket: str
    images_temp_bucket: str
    models_folder: str = "/mnt/"

    # Models config
    default_scheduler: str = "DDPMScheduler"
    default_pipeline: str = "StableDiffusionXLPipeline"
    default_model: str = "stabilityai/stable-diffusion-xl-base-1.0"
    enable_float32: bool = True
    enable_attention_slicing: bool = False

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


def get_settings():
    settings = Settings()
    return settings
