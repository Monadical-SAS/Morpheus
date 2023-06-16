import sys
from pathlib import Path

import torch
from diffusers import ControlNetModel, StableDiffusionPipeline
from dynamicprompts.generators import RandomPromptGenerator
from dynamicprompts.generators.magicprompt import MagicPromptGenerator
from omegaconf import OmegaConf

sys.path.append(".")
from app.config import get_settings  # noqa: E402

settings = get_settings()


def load_config_from_file(filename):
    return OmegaConf.load(filename)


def download_model_from_huggingface(params):
    output = params.source.replace(" ", "_")
    path = f"./tmp/{output}"

    if Path(path).exists():
        print(f"Model was already downloaded. You can find it in {path}")
        return output
    try:
        model = StableDiffusionPipeline.from_pretrained(
            params.source,
            revision="fp16",
            torch_dtype=torch.float16,
            use_auth_token=settings.hf_auth_token,
        )
    except OSError as e:
        print("OSerror", e)
        model = StableDiffusionPipeline.from_pretrained(
            params.source,
            # revision="fp16",
            torch_dtype=torch.float16,
            use_auth_token=settings.hf_auth_token,
        )
    model.save_pretrained(f"tmp/{output}")
    return output


def download_controlnet_model_from_huggingface(params):
    output = params.source.replace(" ", "_")
    path = f"./tmp/{output}"
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
    model.save_pretrained(f"tmp/{output}")
    return output


def download_magicprompt_model_from_huggingface(params):
    output = params.source.replace(" ", "_")
    path = f"./tmp/{output}"

    if Path(path).exists():
        print(f"MagicPrompt Model was already downloaded. You can find it in {path}")
        return output
    try:
        generator = RandomPromptGenerator()
        magic_generator = MagicPromptGenerator(prompt_generator=generator, model_name=params.source, device="cpu")
    except OSError as e:
        print("OSerror", e)

    magic_generator.generator.save_pretrained(f"tmp/{output}")
    return output
