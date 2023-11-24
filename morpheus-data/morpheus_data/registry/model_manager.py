import shutil
from glob import glob
from pathlib import Path

import torch
from diffusers import (
    ControlNetModel,
    StableDiffusionPipeline,
    StableDiffusionXLPipeline,
    StableDiffusionUpscalePipeline,
)
from dynamicprompts.generators import RandomPromptGenerator
from dynamicprompts.generators.magicprompt import MagicPromptGenerator

from morpheus_data.config import get_settings
from morpheus_data.models.schemas import MLModelCreate
from morpheus_data.registry.interfaces import ModelManagerInterface
from morpheus_data.utils.decorators import validate_stable_diffusion_upscaler

settings = get_settings()
TEMP_MODEL_FOLDER = settings.temp_model_folder

pipelines = {
    "stable-diffusion-xl": StableDiffusionXLPipeline,
    "x4-upscaler": StableDiffusionUpscalePipeline,
}


@validate_stable_diffusion_upscaler
def download_model_from_huggingface(params: MLModelCreate):
    output = params.source.replace(" ", "_")
    path = f"{TEMP_MODEL_FOLDER}/{output}"

    if Path(path).exists():
        print(f"Model was already downloaded. You can find it in {path}")
        return output

    pipeline = next((value for key, value in pipelines.items() if key in params.source), StableDiffusionPipeline)

    try:
        model = pipeline.from_pretrained(
            params.source,
            revision="fp16",
            torch_dtype=torch.float16,
        )
    except OSError as e:
        print("OSerror", e)
        model = pipeline.from_pretrained(
            params.source,
            # revision="fp16",
            torch_dtype=torch.float16,
        )
    model.save_pretrained(f"{TEMP_MODEL_FOLDER}/{output}")
    return output


def download_controlnet_model_from_huggingface(params: MLModelCreate):
    output = params.source.replace(" ", "_")
    path = f"{TEMP_MODEL_FOLDER}/{output}"
    model = ""

    if Path(path).exists():
        print(f"ControlNet Model was already downloaded. You can find it in {path}")
        return output
    try:
        model = ControlNetModel.from_pretrained(
            params.source,
            torch_dtype=torch.float16,
        )
    except OSError as e:
        print("OSerror", e)
        model = ControlNetModel.from_pretrained(
            params.source,
            torch_dtype=torch.float16,
        )
    model.save_pretrained(f"{TEMP_MODEL_FOLDER}/{output}")
    return output


def download_magicprompt_model_from_huggingface(params):
    output = params.source.replace(" ", "_")
    path = f"{TEMP_MODEL_FOLDER}/{output}"

    if Path(path).exists():
        print(f"MagicPrompt Model was already downloaded. You can find it in {path}")
        return output
    try:
        generator = RandomPromptGenerator()
        magic_generator = MagicPromptGenerator(prompt_generator=generator, model_name=params.source, device="cpu")
    except OSError as e:
        print("OSerror", e)

    magic_generator.generator.save_pretrained(f"{TEMP_MODEL_FOLDER}/{output}")
    return output


def remove_model_from_disk(name):
    path = f"{TEMP_MODEL_FOLDER}/{name}"
    if not Path(path).exists():
        print("Folder not found in local")
        return
    shutil.rmtree(f"{TEMP_MODEL_FOLDER}/{name}")
    print(f"Model deleted from {TEMP_MODEL_FOLDER} folder")


def list_models_in_disk() -> list:
    path = f"{TEMP_MODEL_FOLDER}/"
    if not Path(path).exists():
        print("Folder not found in local")
        return
    return glob(f"{TEMP_MODEL_FOLDER}/*/*")


# Map kind of model to their corresponding functions to download models
download_model = {
    "diffusion": download_model_from_huggingface,
    "controlnet": download_controlnet_model_from_huggingface,
    "prompt": download_magicprompt_model_from_huggingface,
}


class ModelManagerHuggingFace(ModelManagerInterface):
    def __init__(self, *, model_manager_factory=None):
        if model_manager_factory is None:
            model_manager_factory = download_model
        self.model_manager = model_manager_factory

    def download_model(self, *, kind: str, params: MLModelCreate) -> str:
        output_path = self.model_manager[kind](params)
        return output_path

    def remove_model(self, *, name: str) -> None:
        remove_model_from_disk(name)

    def list_models(self) -> list:
        return list_models_in_disk()
