import importlib
from abc import ABC, abstractmethod
from pathlib import Path

import torch
from app.common.decorators import validate_stable_diffusion_upscaler
from app.config import get_settings
from loguru import logger

settings = get_settings()

MODEL_PATH_DEFAULT = f"{settings.model_parent_path}{settings.model_default}"
CONTROLNET_MODEL_PATH_DEFAULT = f"{settings.model_parent_path}{settings.controlnet_model_default}"


class StableDiffusionAbstract(ABC):
    def __init__(self, pipeline_name: str, sampler: str, model_name: str = MODEL_PATH_DEFAULT):
        hf_model_name = model_name.removeprefix(settings.model_parent_path)
        self.model_name = model_name if Path(model_name).exists() else hf_model_name
        self.token = settings.hf_auth_token
        self.sampler = sampler

        # Check the environment variable/settings file to determine if we should
        # be using 16 bit or 32 bit precision when generating images.  16 bit
        # will be faster, but 32 bit may have higher image quality.
        if settings.enable_float32:
            self.dtype = torch.float32
        else:
            self.dtype = torch.float16

        # Check to see if we have CUDA available via an NVidia GPU.
        if torch.cuda.is_available() and torch.backends.cuda.is_built():
            logger.info("PyTorch CUDA backend is available, enabling")
            self.generator_device = "cuda"
            self.enable_xformers = True
            self.device = "cuda"

        # Check to see if we have Apple Silicon's MPS Framework available and that it has
        # been compiled into this version of PyTorch.
        elif torch.backends.mps.is_available() and torch.backends.mps.is_built():
            logger.info("PyTorch Apple MPS backend is available, enabling")
            self.generator_device = "cpu"
            self.enable_xformers = False
            self.device = "mps"

            # With Apple M1/M2 hardware, we will always run in 32 bit precision.
            # as MPS doesn't currently support 16 bit.
            self.dtype = torch.float32

        # If neither of the CUDA or MPS are available, use the CPU instead.  This
        # will be very slow.
        else:
            logger.info("PyTorch is Defaulting to using CPU as a backend")
            self.generator_device = "cpu"
            self.enable_xformers = False
            self.device = "cpu"

        logger.info("Floating point precision during image generation: " + str(self.dtype))

        self._module_import = importlib.import_module("diffusers")
        self._pipeline = getattr(self._module_import, pipeline_name)

    @abstractmethod
    def generate_images(self, *args, **kwargs):
        pass

    @staticmethod
    @validate_stable_diffusion_upscaler
    def save_model(pipe, path: str):
        pipe.save_pretrained(save_directory=path)

    @staticmethod
    def swap_attention_slicing_option(model, enable: bool):
        (model.enable_attention_slicing() if enable else model.disable_attention_slicing())

    @staticmethod
    def swap_xformers(model, enable: bool):
        (
            model.enable_xformers_memory_efficient_attention()
            if enable
            else model.disable_xformers_memory_efficient_attention()
        )
