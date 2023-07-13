import json
import random
import time
from functools import wraps

from loguru import logger

from app.config import get_file_handlers, get_settings

settings = get_settings()
files_repository = get_file_handlers()


def simulate_generation():
    input_images = files_repository.get_files(max_keys=10)
    random_number = random.randint(1, settings.max_num_images)
    final_images = []
    for i in range(random_number):
        final_images.append(random.choice(input_images))
    return final_images


def simulate_prompt_generation():
    text = (
        "This is a fake prompt generated by the model. It is just used to check the full flow of prompt generation"
        " in local without run the model"
    )
    return text


def fix_stable_diffusion_upscaling_4x_model(file_path):
    # Load JSON file
    with open(file_path, "r") as json_file:
        data = json.load(json_file)

    # Remove the problematic entries
    data.pop("watermarker", None)
    data.pop("feature_extractor", None)
    data.pop("safety_checker", None)

    # Overwrite the JSON file
    with open(file_path, "w") as json_file:
        json.dump(data, json_file, indent=2)


def check_environment(func):
    @wraps(func)
    def wrapper_check_environment(*args, **kwargs):
        if settings.environment == "local":
            logger.info("Simulating the image generation")
            time.sleep(3)
            logger.info("Simulating uploading to s3 and the url retrieval")
            time.sleep(1)
            return simulate_generation()
        elif settings.environment == "local-mps":
            logger.info("Apple Silicon environment configured - using MPS for image generation")

        return func(*args, **kwargs)

    return wrapper_check_environment


def check_environment_for_magic_prompt(func):
    @wraps(func)
    def wrapper_check_environment(*args, **kwargs):
        if settings.environment == "local":
            logger.info("Simulating the prompt generation")
            time.sleep(3)
            return simulate_prompt_generation()
        elif settings.environment == "local-mps":
            logger.info("Apple Silicon environment configured - using MPS for image generation")

        return func(*args, **kwargs)

    return wrapper_check_environment


def run_as_per_environment(method):
    @wraps(method)
    def wrapper_check_environment(ref, *args, **kwargs):
        if settings.environment == "local":
            logger.info("Simulating loading model")
            time.sleep(3)
            logger.info("Loading finished")
            return ref.run(*args, **kwargs)
        elif settings.environment == "local-mps":
            logger.info("Apple Silicon environment configured - loading model using MPS")

        return method(ref, *args, **kwargs)

    return wrapper_check_environment


def validate_stable_diffusion_upscaler(func):
    @wraps(func)
    def wrapper_check_stable_diffusion_upscaler(*args, **kwargs):
        func(*args, **kwargs)
        file_path = f"{settings.model_parent_path}stabilityai/stable-diffusion-x4-upscaler"
        if kwargs["path"] == file_path:
            logger.info("Fixing Stable Diffusion Upscaling 4x model...")
            fix_stable_diffusion_upscaling_4x_model(f"{file_path}/model_index.json")

    return wrapper_check_stable_diffusion_upscaler
