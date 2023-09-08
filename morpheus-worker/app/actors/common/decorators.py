import json
from functools import wraps

from app.settings.settings import get_settings
from loguru import logger

settings = get_settings()


def validate_stable_diffusion_upscaler(func):
    @wraps(func)
    def wrapper_check_stable_diffusion_upscaler(*args, **kwargs):
        func(*args, **kwargs)
        file_path = f"{settings.models_folder}stabilityai/stable-diffusion-x4-upscaler"
        if kwargs["path"] == file_path:
            logger.info("Fixing Stable Diffusion Upscaling 4x model...")
            fix_stable_diffusion_upscaling_4x_model(f"{file_path}/model_index.json")

    return wrapper_check_stable_diffusion_upscaler


def fix_stable_diffusion_upscaling_4x_model(file_path):
    with open(file_path, "r") as json_file:
        data = json.load(json_file)

    # Remove the problematic entries
    data.pop("watermarker", None)
    data.pop("feature_extractor", None)
    data.pop("safety_checker", None)

    # Overwrite the JSON file
    with open(file_path, "w") as json_file:
        json.dump(data, json_file, indent=2)
