import json
from functools import wraps
from morpheus_data.config import get_settings

settings = get_settings()

TEMP_MODEL_FOLDER = settings.temp_model_folder


def validate_stable_diffusion_upscaler(func):
    @wraps(func)
    def wrapper_check_stable_diffusion_upscaler(*args, **kwargs):
        output = func(*args, **kwargs)
        if output == "stabilityai/stable-diffusion-x4-upscaler":
            print("Fixing Stable Diffusion Upscaling 4x model")
            fix_stable_diffusion_upscaling_4x_model(f"{TEMP_MODEL_FOLDER}/{output}/model_index.json")
            print("Fixed!")
        return output

    return wrapper_check_stable_diffusion_upscaler


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
