import importlib
from abc import ABC, abstractmethod
from pathlib import Path

import app.utils.lora_ti_utils as lora_ti_utils
import torch
from app.celery.mlmodels.controlnet import preprocessing_image
from app.config import get_settings
from app.utils.decorators import validate_stable_diffusion_upscaler
from diffusers import (
    DDPMScheduler,
    StableDiffusionPipeline,
    StableDiffusionUpscalePipeline,
    StableDiffusionXLPipeline
)
from loguru import logger
from morpheus_data.models.schemas import GenerationRequest

settings = get_settings()

MODEL_PATH_DEFAULT = f"{settings.model_parent_path}{settings.default_model}"
CONTROLNET_MODEL_PATH_DEFAULT = f"{settings.model_parent_path}{settings.controlnet_default_model}"


class StableDiffusionAbstract(ABC):
    def __init__(self, pipeline_name: str, scheduler: str, model_name: str = MODEL_PATH_DEFAULT):
        hf_model_name = model_name.removeprefix(settings.model_parent_path)
        self.model_name = model_name if Path(model_name).exists() else hf_model_name
        self.token = settings.hf_auth_token
        self.scheduler = scheduler

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

    @staticmethod
    def add_lora_to_model(model, lora_path):
        download_dir = lora_ti_utils.create_lora_ti_folder()
        if "civitai.com" in lora_path:
            lora_info = lora_ti_utils.get_civitai_model_info(lora_path)
            lora_filename = lora_ti_utils.download_from_civitai(lora_info["download_link"], download_dir)
            model.load_lora_weights(lora_filename)
        else:
            model.load_lora_weights(lora_path, cache_dir=download_dir)
        lora_ti_utils.delete_lora_ti_folder(download_dir)

    @staticmethod
    def add_embedding_to_model(model, embedding_path):
        try:
            download_dir = lora_ti_utils.create_lora_ti_folder()
            if "civitai.com" in embedding_path:
                embedding_info = lora_ti_utils.get_civitai_model_info(embedding_path)
                embedding_filename = lora_ti_utils.download_from_civitai(embedding_info["download_link"], download_dir)
                if embedding_info["trigger_words"] is not None:
                    model.load_textual_inversion(embedding_filename, token=embedding_info["trigger_words"])
                else:
                    model.load_textual_inversion(embedding_filename)
            else:
                model.load_textual_inversion(embedding_path, cache_dir=download_dir)
            lora_ti_utils.delete_lora_ti_folder(download_dir)
        except ValueError:
            logger.info("Embedding is already loaded")


class StableDiffusionBaseClassic(StableDiffusionAbstract):
    def __init__(
            self,
            model_name: str,
            scheduler: str = "PNDMScheduler",
            pipeline_name: str = "StableDiffusionPipeline",
    ):
        super().__init__(pipeline_name=pipeline_name, model_name=model_name, scheduler=scheduler)

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
        scheduler = getattr(self._module_import, self.scheduler)
        self.model.scheduler = scheduler.from_config(self.model.scheduler.config)

        if not Path(model_name).exists() and settings.environment != "prod":
            logger.info(f"saving model in {model_name}")
            self.save_model(pipe=self.pipe, path=model_name)

        # By default, no LoRA are loaded into the model
        self.loaded_lora = False

    def generate_images(self, *args, **kwargs):
        pass


class StableDiffusionBaseControlNet(StableDiffusionAbstract):
    def __init__(
            self,
            model_name: str,
            controlnet_model_name: str = CONTROLNET_MODEL_PATH_DEFAULT,
            scheduler: str = "PNDMScheduler",
            pipeline_name: str = "StableDiffusionPipeline",
    ):
        super().__init__(pipeline_name=pipeline_name, model_name=model_name, scheduler=scheduler)

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
        scheduler = getattr(self._module_import, self.scheduler)
        self.model.scheduler = scheduler.from_config(self.model.scheduler.config)

        if not Path(model_name).exists() and settings.environment != "prod":
            logger.info(f"saving model in {model_name}")
            self.save_model(pipe=self.pipe, path=model_name)

        if not Path(controlnet_model_name).exists() and settings.environment != "prod":
            logger.info(f"saving model in {model_name}")
            self.save_model(pipe=controlnet, path=controlnet_model_name)

        # By default, no LoRA are loaded into the model
        self.loaded_lora = False

    def generate_images(self, *args, **kwargs):
        pass


class StableDiffusionText2Image(StableDiffusionBaseClassic):
    def __init__(
            self,
            model_name: str,
            scheduler: str = "PNDMScheduler",
            pipeline_name: str = "StableDiffusionPipeline",
    ):
        super().__init__(pipeline_name=pipeline_name, model_name=model_name, scheduler=scheduler)

    def generate_images(self, **kwargs):
        logger.info("generating image in Text2Image pipeline")
        request: GenerationRequest = kwargs.get("request")
        generator = torch.Generator(self.generator_device).manual_seed(request.generator)
        attention_params = {}

        # LoRA
        if request.use_lora:
            self.add_lora_to_model(self.model, request.lora_path)
            self.loaded_lora = True
        else:
            request.lora_scale = 0.0

        # Use scale param only if a lora has been loaded
        if self.loaded_lora:
            attention_params["scale"] = request.lora_scale

        # Textual Inversion Embeddings
        if request.use_embedding:
            self.add_embedding_to_model(self.model, request.embedding_path)

        images = self.model(
            prompt=request.prompt,
            negative_prompt=request.negative_prompt,
            num_images_per_prompt=request.num_images_per_prompt,
            guidance_scale=request.guidance_scale,
            num_inference_steps=request.num_inference_steps,
            generator=generator,
            width=request.width,
            height=request.height,
            cross_attention_kwargs=attention_params,
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
            scheduler: str = "PNDMScheduler",
            pipeline_name: str = "StableDiffusionImg2ImgPipeline",
    ):
        super().__init__(pipeline_name=pipeline_name, model_name=model_name, scheduler=scheduler)

    def generate_images(self, **kwargs):
        logger.info("generating image in Image2Image pipeline")
        request: GenerationRequest = kwargs.get("request")
        image = kwargs.get("image")
        generator = torch.Generator(self.generator_device).manual_seed(request.generator)
        attention_params = {}

        # LoRA
        if request.use_lora:
            self.add_lora_to_model(self.model, request.lora_path)
            self.loaded_lora = True
        else:
            request.lora_scale = 0.0

        # Use scale param only if a lora has been loaded
        if self.loaded_lora:
            attention_params["scale"] = request.lora_scale

        # Textual Inversion Embeddings
        if request.use_embedding:
            self.add_embedding_to_model(self.model, request.embedding_path)

        images = self.model(
            image=image,
            prompt=request.prompt,
            negative_prompt=request.negative_prompt,
            generator=generator,
            num_inference_steps=request.num_inference_steps,
            guidance_scale=request.guidance_scale,
            num_images_per_prompt=request.num_images_per_prompt,
            strength=request.strength,
            cross_attention_kwargs=attention_params,
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
            scheduler: str = "PNDMScheduler",
            pipeline_name: str = "StableDiffusionControlNetPipeline",
    ):
        super().__init__(
            pipeline_name=pipeline_name,
            model_name=model_name,
            scheduler=scheduler,
            controlnet_model_name=controlnet_model_name,
        )

    def generate_images(self, **kwargs):
        logger.info("generating image in Controlnet pipeline")
        request: GenerationRequest = kwargs.get("request")
        image = kwargs.get("image")
        generator = torch.Generator(device="cpu").manual_seed(request.generator)
        attention_params = {}

        # LoRA
        if request.use_lora:
            # At the moment, civitai lora with cpu offload is not supported by Huggingface
            # https://github.com/huggingface/diffusers/issues/3958
            if "civitai.com" not in request.lora_path:
                self.add_lora_to_model(self.model, request.lora_path)
                self.loaded_lora = True
        else:
            request.lora_scale = 0.0

        if self.loaded_lora:
            attention_params["scale"] = request.lora_scale

        # Textual Inversion Embeddings
        if request.use_embedding:
            self.add_embedding_to_model(self.model, request.embedding_path)

        # preprocessing image
        base_image = preprocessing_image.get(request.controlnet_type)(image)

        images = self.model(
            prompt=request.prompt,
            negative_prompt=request.negative_prompt,
            image=base_image,
            generator=generator,
            num_inference_steps=request.num_inference_steps,
            guidance_scale=request.guidance_scale,
            num_images_per_prompt=request.num_images_per_prompt,
            cross_attention_kwargs=attention_params,
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
            scheduler: str = "PNDMScheduler",
            pipeline_name: str = "StableDiffusionInstructPix2PixPipeline",
    ):
        super().__init__(pipeline_name=pipeline_name, model_name=model_name, scheduler=scheduler)

    def generate_images(self, **kwargs):
        logger.info("Generating image in Pix2Pix pipeline.")
        request: GenerationRequest = kwargs.get("request")
        image = kwargs.get("image")
        generator = torch.Generator(self.generator_device).manual_seed(request.generator)

        images = self.model(
            prompt=request.prompt,
            negative_prompt=request.negative_prompt,
            num_inference_steps=request.num_inference_steps,
            guidance_scale=request.guidance_scale,
            num_images_per_prompt=request.num_images_per_prompt,
            generator=generator,
            image=image,
        ).images

        if len(images) == 0:
            logger.info("No pix2pix images generated")
            return None

        logger.info("pix2pix task completed successfully")
        return images


class StableDiffusionInpainting(StableDiffusionBaseClassic):
    def __init__(
            self,
            model_name: str,
            scheduler: str = "PNDMScheduler",
            pipeline_name: str = "StableDiffusionInpaintPipeline",
    ):
        super().__init__(pipeline_name=pipeline_name, model_name=model_name, scheduler=scheduler)

    def generate_images(self, **kwargs):
        logger.info("Generating image in Inpainting pipeline.")
        request: GenerationRequest = kwargs.get("request")
        image = kwargs.get("image")
        mask = kwargs.get("mask")
        generator = torch.Generator(self.generator_device).manual_seed(request.generator)

        images = self.model(
            prompt=request.prompt,
            negative_prompt=request.negative_prompt,
            num_inference_steps=request.num_inference_steps,
            guidance_scale=request.guidance_scale,
            num_images_per_prompt=request.num_images_per_prompt,
            generator=generator,
            image=image,
            mask_image=mask,
        ).images

        if len(images) == 0:
            logger.info("No inpainting images generated")
            return None

        logger.info("inpainting task completed successfully")
        return images


class StableDiffusionUpscale(StableDiffusionAbstract):
    def __init__(
            self,
            model_name: str,
            scheduler: str = "PNDMScheduler",
            pipeline_name: str = "StableDiffusionUpscalePipeline",
    ):
        super().__init__(pipeline_name=pipeline_name, model_name=model_name, scheduler=scheduler)

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
        scheduler = getattr(self._module_import, self.scheduler)
        self.model.scheduler = scheduler.from_config(self.model.scheduler.config)

        if not Path(model_name).exists() and settings.environment != "prod":
            logger.info(f"saving model in {model_name}")
            self.save_model(pipe=self.pipe, path=model_name)

    def generate_images(self, **kwargs):
        logger.info("Generating image in Upscale pipeline.")
        request: GenerationRequest = kwargs.get("request")
        image = kwargs.get("image")
        generator = torch.Generator(self.generator_device).manual_seed(request.generator)

        images = self.model(
            prompt=request.prompt,
            negative_prompt=request.negative_prompt,
            num_inference_steps=request.num_inference_steps,
            guidance_scale=request.guidance_scale,
            num_images_per_prompt=request.num_images_per_prompt,
            generator=generator,
            image=image,
        ).images

        if len(images) == 0:
            logger.info("No upscaled images generated")
            return None

        logger.info("upscale task completed successfully")
        return images


class StableDiffusionXLText2Image(StableDiffusionAbstract):
    def __init__(
            self,
            model_name: str = "stabilityai/stable-diffusion-xl-base-1.0",
            scheduler: str = "PNDMScheduler",
            pipeline_name: str = "StableDiffusionXLPipeline",
    ):
        super().__init__(pipeline_name=pipeline_name, model_name=model_name, scheduler=scheduler)
        self.pipe = StableDiffusionXLPipeline.from_pretrained(
            "stabilityai/stable-diffusion-xl-base-1.0",
            torch_dtype=torch.float16,
            variant="fp16",
            use_safetensors=True
        )
        self.pipe.to("cuda")

        # enable xformers, torch < 2.0
        self.pipe.enable_xformers_memory_efficient_attention()

    def generate_images(self, **kwargs):
        logger.info("generating image in Text2Image pipeline")
        request: GenerationRequest = kwargs.get("request")
        generator = torch.Generator(self.generator_device).manual_seed(request.generator)

        images = self.pipe(
            prompt=request.prompt,
            negative_prompt=request.negative_prompt,
            num_images_per_prompt=1,
            guidance_scale=request.guidance_scale,
            num_inference_steps=request.num_inference_steps,
            generator=generator,
            width=request.width or 768,
            height=request.height or 768,
        ).images

        if len(images) == 0:
            logger.info("Unable to generate text2img images")
            return None

        logger.info("text2img task completed successfully")
        return images
