from enum import Enum
from functools import lru_cache

from pydantic import BaseSettings

from utils import (
    download_controlnet_model_from_huggingface,
    download_magicprompt_model_from_huggingface,
    download_model_from_huggingface,
)

MODEL_FILE_PATH = "./scripts/models/models-info.yaml"
CONTROLNET_FILE_PATH = "./scripts/models/controlnet-models-info.yaml"
MAGICPROMPT_FILE_PATH = "./scripts/models/magicprompt-models-info.yaml"


class APIServer(str, Enum):
    local = "local"
    staging = "staging"
    production = "production"


class Target(str, Enum):
    sdiffusion = "sdiffusion"
    controlnet = "controlnet"
    magicprompt = "magicprompt"


class DBTarget(str, Enum):
    sdiffusion = "sdiffusion"
    controlnet = "controlnet"


class Settings(BaseSettings):
    hf_auth_token: str = ""


@lru_cache()
def get_settings() -> Settings:
    settings = Settings()
    return settings


api_server_urls = {
    "local": "http://api:8001",
    "staging": "http://216.153.52.83:8001",
    'production': "https://api-morpheus.monadical.io",
}

# API service endpoints
models_url = {
    "sdiffusion": "models",
    "controlnet": "cnmodels",
}

# Map targets to their corresponding functions to download models
download_model = {
    "sdiffusion": download_model_from_huggingface,
    "controlnet": download_controlnet_model_from_huggingface,
    "magicprompt": download_magicprompt_model_from_huggingface,
}

# Map targets to their corresponding config file
config_file = {
    "sdiffusion": MODEL_FILE_PATH,
    "controlnet": CONTROLNET_FILE_PATH,
    "magicprompt": MAGICPROMPT_FILE_PATH,
}
