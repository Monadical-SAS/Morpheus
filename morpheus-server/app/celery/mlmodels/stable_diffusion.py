import importlib
from abc import ABC, abstractmethod
from pathlib import Path

import torch
from diffusers import (
    DDPMScheduler,
    StableDiffusionPipeline,
    StableDiffusionUpscalePipeline,
)
from loguru import logger

from app.celery.mlmodels.controlnet import preprocessing_image
from app.config import get_settings
from app.models.schemas import Prompt, PromptControlNet

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


class StableDiffusionBaseClassic(StableDiffusionAbstract):
    def __init__(
        self,
        model_name: str,
        sampler: str = "PNDMScheduler",
        pipeline_name: str = "StableDiffusionPipeline",
    ):
        super().__init__(pipeline_name=pipeline_name, model_name=model_name, sampler=sampler)

        classic_pipeline = StableDiffusionPipeline.from_pretrained(
            self.model_name,
            torch_dtype=self.dtype,
            use_auth_token=self.token,
        )

        self.pipe = self._pipeline(**classic_pipeline.components)
        self.model = self.pipe.to(self.device)

        # Set param optimization
        self.model.enable_attention_slicing()

        if self.enable_xformers:
            self.model.enable_xformers_memory_efficient_attention()

        # import scheduler
        scheduler = getattr(self._module_import, self.sampler)
        self.model.scheduler = scheduler.from_config(self.model.scheduler.config)

        if not Path(model_name).exists() and settings.environment != "prod":
            self.save_model(self.pipe, model_name)

    def generate_images(self, *args, **kwargs):
        pass


class StableDiffusionBaseControlNet(StableDiffusionAbstract):
    def __init__(
        self,
        model_name: str,
        controlnet_model_name: str = CONTROLNET_MODEL_PATH_DEFAULT,
        sampler: str = "PNDMScheduler",
        pipeline_name: str = "StableDiffusionPipeline",
    ):
        super().__init__(pipeline_name=pipeline_name, model_name=model_name, sampler=sampler)

        hf_controlnet_model_name = controlnet_model_name.removeprefix(settings.model_parent_path)

        self.controlnet_model_name = (
            controlnet_model_name if Path(controlnet_model_name).exists() else hf_controlnet_model_name
        )

        controlnet_model = getattr(self._module_import, "ControlNetModel")
        controlnet = controlnet_model.from_pretrained(self.controlnet_model_name, torch_dtype=self.dtype)

        self.pipe = self._pipeline.from_pretrained(self.model_name, controlnet=controlnet, torch_dtype=self.dtype)
        self.pipe.enable_model_cpu_offload()
        self.model = self.pipe

        # Set param optimization
        self.model.enable_attention_slicing()

        if self.enable_xformers:
            self.model.enable_xformers_memory_efficient_attention()

        # import scheduler
        scheduler = getattr(self._module_import, self.sampler)
        self.model.scheduler = scheduler.from_config(self.model.scheduler.config)

        if not Path(model_name).exists() and settings.environment != "prod":
            self.save_model(pipe=self.pipe, path=model_name)

        if not Path(controlnet_model_name).exists() and settings.environment != "prod":
            self.save_model(pipe=controlnet, path=controlnet_model_name)

    def generate_images(self, *args, **kwargs):
        pass


class StableDiffusionText2Image(StableDiffusionBaseClassic):
    def __init__(
        self,
        model_name: str,
        sampler: str = "PNDMScheduler",
        pipeline_name: str = "StableDiffusionPipeline",
    ):
        super().__init__(pipeline_name=pipeline_name, model_name=model_name, sampler=sampler)

    def generate_images(self, **kwargs):
        logger.info("generating image in Text2Image pipeline")
        prompt: Prompt = kwargs.get("prompt")
        generator = torch.Generator(self.generator_device).manual_seed(prompt.generator)

        images = self.model(
            prompt=prompt.prompt,
            negative_prompt=prompt.negative_prompt,
            num_images_per_prompt=prompt.num_images_per_prompt,
            guidance_scale=prompt.guidance_scale,
            num_inference_steps=prompt.num_inference_steps,
            generator=generator,
            width=prompt.width,
            height=prompt.height,
        ).images

        if len(images) == 0:
            logger.info("Unable to generate text2img images")
            return None

        logger.info("text2img task completed successfully")
        return images


class StableDiffusionImage2Image(StableDiffusionBaseClassic):
    def __init__(
        self,
        model_name: str,
        sampler: str = "PNDMScheduler",
        pipeline_name: str = "StableDiffusionImg2ImgPipeline",
    ):
        super().__init__(pipeline_name=pipeline_name, model_name=model_name, sampler=sampler)

    def generate_images(self, **kwargs):
        logger.info("generating image in Image2Image pipeline")
        prompt: Prompt = kwargs.get("prompt")
        image = kwargs.get("image")
        generator = torch.Generator(self.generator_device).manual_seed(prompt.generator)

        images = self.model(
            prompt=prompt.prompt,
            negative_prompt=prompt.negative_prompt,
            image=image,
            generator=generator,
            num_inference_steps=prompt.num_inference_steps,
            guidance_scale=prompt.guidance_scale,
            num_images_per_prompt=prompt.num_images_per_prompt,
            strength=prompt.strength,
        ).images

        if len(images) == 0:
            logger.info("No text2img images generated")
            return None

        logger.info("image2img task completed successfully")
        return images


class StableDiffusionControlNet(StableDiffusionBaseControlNet):
    def __init__(
        self,
        model_name: str,
        controlnet_model_name: str = CONTROLNET_MODEL_PATH_DEFAULT,
        sampler: str = "PNDMScheduler",
        pipeline_name: str = "StableDiffusionControlNetPipeline",
    ):
        super().__init__(
            pipeline_name=pipeline_name,
            model_name=model_name,
            sampler=sampler,
            controlnet_model_name=controlnet_model_name,
        )

    def generate_images(self, **kwargs):
        logger.info("generating image in Controlnet pipeline")
        prompt: PromptControlNet = kwargs.get("prompt")
        image = kwargs.get("image")
        generator = torch.Generator(device="cpu").manual_seed(prompt.generator)

        # preprocessing image
        base_image = preprocessing_image.get(prompt.controlnet_type)(image)

        images = self.model(
            prompt=prompt.prompt,
            negative_prompt=prompt.negative_prompt,
            image=base_image,
            generator=generator,
            num_inference_steps=prompt.num_inference_steps,
            guidance_scale=prompt.guidance_scale,
            num_images_per_prompt=prompt.num_images_per_prompt,
        ).images

        if len(images) == 0:
            logger.info("No text2img images generated")
            return None

        # add base processed image
        images.insert(0, base_image)
        logger.info("controlnet task completed successfully")
        return images


class StableDiffusionInstructPix2Pix(StableDiffusionBaseClassic):
    def __init__(
        self,
        model_name: str,
        sampler: str = "PNDMScheduler",
        pipeline_name: str = "StableDiffusionInstructPix2PixPipeline",
    ):
        super().__init__(pipeline_name=pipeline_name, model_name=model_name, sampler=sampler)

    def generate_images(self, **kwargs):
        logger.info("Generating image in Pix2Pix pipeline.")
        prompt: Prompt = kwargs.get("prompt")
        image = kwargs.get("image")
        generator = torch.Generator(self.generator_device).manual_seed(prompt.generator)

        images = self.model(
            prompt=prompt.prompt,
            negative_prompt=prompt.negative_prompt,
            num_inference_steps=prompt.num_inference_steps,
            guidance_scale=prompt.guidance_scale,
            num_images_per_prompt=prompt.num_images_per_prompt,
            generator=generator,
            image=image,
        ).images

        if len(images) == 0:
            logger.info("No text2img images generated")
            return None

        logger.info("pix2pix task completed successfully")
        return images


class StableDiffusionInpainting(StableDiffusionBaseClassic):
    def __init__(
        self,
        model_name: str,
        sampler: str = "PNDMScheduler",
        pipeline_name: str = "StableDiffusionInpaintPipeline",
    ):
        super().__init__(pipeline_name=pipeline_name, model_name=model_name, sampler=sampler)

    def generate_images(self, **kwargs):
        logger.info("Generating image in Inpaint pipeline.")
        prompt: Prompt = kwargs.get("prompt")
        image = kwargs.get("image")
        mask = kwargs.get("mask")
        generator = torch.Generator(self.generator_device).manual_seed(prompt.generator)

        images = self.model(
            prompt=prompt.prompt,
            negative_prompt=prompt.negative_prompt,
            num_inference_steps=prompt.num_inference_steps,
            guidance_scale=prompt.guidance_scale,
            num_images_per_prompt=prompt.num_images_per_prompt,
            generator=generator,
            image=image,
            mask_image=mask,
        ).images

        if len(images) == 0:
            logger.info("No text2img images generated")
            return None

        logger.info("inpainting task completed successfully")
        return images


class StableDiffusionUpscale(StableDiffusionAbstract):
    def __init__(
        self,
        model_name: str,
        sampler: str = "PNDMScheduler",
        pipeline_name: str = "StableDiffusionUpscalePipeline",
    ):
        super().__init__(pipeline_name=pipeline_name, model_name=model_name, sampler=sampler)

        scheduler = DDPMScheduler(num_train_timesteps=1000, beta_schedule="squaredcos_cap_v2")

        pipeline = StableDiffusionUpscalePipeline.from_pretrained(
            self.model_name,
            torch_dtype=self.dtype,
            use_auth_token=self.token,
            low_res_scheduler=scheduler,
        )

        self.pipe = self._pipeline(**pipeline.components)
        self.model = self.pipe.to(self.device)

        # Set param optimization
        self.model.enable_attention_slicing()

        if self.enable_xformers:
            self.model.enable_xformers_memory_efficient_attention()

        # import scheduler
        scheduler = getattr(self._module_import, self.sampler)
        self.model.scheduler = scheduler.from_config(self.model.scheduler.config)

        if not Path(model_name).exists() and settings.environment != "prod":
            self.save_model(self.pipe, model_name)

    def generate_images(self, **kwargs):
        logger.info("Generating image in Upscale pipeline.")
        prompt: Prompt = kwargs.get("prompt")
        image = kwargs.get("image")
        generator = torch.Generator(self.generator_device).manual_seed(prompt.generator)

        images = self.model(
            prompt=prompt.prompt,
            negative_prompt=prompt.negative_prompt,
            num_inference_steps=prompt.num_inference_steps,
            guidance_scale=prompt.guidance_scale,
            num_images_per_prompt=prompt.num_images_per_prompt,
            generator=generator,
            image=image,
        ).images

        if len(images) == 0:
            logger.info("No text2img images generated")
            return None

        logger.info("upscale task completed successfully")
        return images
