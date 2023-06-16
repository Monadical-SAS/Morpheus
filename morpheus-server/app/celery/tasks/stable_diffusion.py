import importlib

from PIL import Image
from celery import Task
from loguru import logger
from torch.cuda import OutOfMemoryError

from app.celery.workers.stable_diffusion_app import app
from app.config import get_settings
from app.error.error import ModelLoadError, OutOfMemoryGPUError
from app.models.schemas import Prompt, PromptControlNet
from app.services.files_services import FilesService
from app.utils.decorators import (
    check_environment,
    run_as_per_environment,
)

file_service = FilesService()
settings = get_settings()

MODEL_PATH_DEFAULT = f"{settings.model_parent_path}{settings.model_default}"


class DiffusionTask(Task):
    abstract = True

    def __init__(self, name: str = MODEL_PATH_DEFAULT):
        super().__init__()
        self.model = None
        self.name_model = name
        print("Default model at init: ", self.name_model)

    @run_as_per_environment
    def __call__(self, *args, **kwargs):
        if not self.model:
            logger.info("loading model....")
            try:
                module_import = importlib.import_module(self.path[0])
                model_obj = getattr(module_import, self.path[1])
                self.model = model_obj(model_name=self.name_model)
                logger.info("Model loaded")
            except Exception as e:
                logger.exception(e)
                raise ModelLoadError from e
        return self.run(*args, **kwargs)


@app.task(
    ignore_result=False,
    bind=True,
    base=DiffusionTask,
    path=("app.celery.mlmodels.stable_diffusion", "StableDiffusionText2Image"),
    name=f"{__name__}.stable-diffusion-text2img",
)
@check_environment
def generate_stable_diffusion_text2img_output_task(self, prompt: Prompt) -> list[str]:
    try:
        model_selected = prompt.model
        sampler_selected = prompt.sampler

        logger.info(f"Current model: {self.model.model_name} - Model selected: {model_selected}")
        logger.info(f"Current sampler: {self.model.sampler} - Sampler selected: {sampler_selected}")

        if self.model.model_name != model_selected or self.model.sampler != sampler_selected:
            self.model.__init__(
                model_name=model_selected,
                sampler=sampler_selected,
                pipeline_name="StableDiffusionPipeline",
            )

        images = self.model.generate_images(prompt=prompt)
        # upload to s3
        logger.info("Uploading image(s) to s3 and getting the url(s)")
        filename = file_service.upload_multiple_images_to_s3(images=images, user_bucket=settings.images_temp_bucket)
        url_images = file_service.get_image_urls(filenames=filename)

        return url_images
    except OutOfMemoryError as e:
        logger.exception(e)
        raise OutOfMemoryGPUError from e
    except Exception as e:
        logger.exception(e)
        raise ModelLoadError from e


@app.task(
    ignore_result=False,
    bind=True,
    base=DiffusionTask,
    path=("app.celery.mlmodels.stable_diffusion", "StableDiffusionImage2Image"),
    name=f"{__name__}.stable-diffusion-img2img",
)
@check_environment
def generate_stable_diffusion_img2img_output_task(self, prompt: Prompt, image: Image) -> list[str]:
    try:
        model_selected = prompt.model
        sampler_selected = prompt.sampler

        logger.info(f"Current model: {self.model.model_name} - Model selected: {model_selected}")
        logger.info(f"Current sampler: {self.model.sampler} - Sampler selected: {sampler_selected}")

        if self.model.model_name != model_selected or self.model.sampler != sampler_selected:
            self.model.__init__(
                model_name=model_selected,
                sampler=sampler_selected,
                pipeline_name="StableDiffusionImg2ImgPipeline",
            )

        images = self.model.generate_images(prompt=prompt, image=image)
        # upload to s3
        logger.info("Uploading image(s) to s3 and getting the url(s)")
        filename = file_service.upload_multiple_images_to_s3(images=images, user_bucket=settings.images_temp_bucket)
        url_images = file_service.get_image_urls(filenames=filename)
        return url_images
    except OutOfMemoryError as e:
        logger.exception(e)
        raise OutOfMemoryGPUError
    except Exception as e:
        logger.exception(e)
        raise ModelLoadError


@app.task(
    ignore_result=False,
    bind=True,
    base=DiffusionTask,
    path=("app.celery.mlmodels.stable_diffusion", "StableDiffusionControlNet"),
    name=f"{__name__}.stable-diffusion-controlnet",
)
@check_environment
def generate_stable_diffusion_controlnet_output_task(self, prompt: PromptControlNet, image: Image) -> list[str]:
    try:
        model_selected = prompt.model
        sampler_selected = prompt.sampler
        controlnet_model_selected = prompt.controlnet_model

        logger.info(f"Current model: {self.model.model_name} - Model selected: {model_selected}")
        logger.info(f"Current sampler: {self.model.sampler} - Sampler selected: {sampler_selected}")
        logger.info(
            (
                f"Current controlnet model: {self.model.controlnet_model_name} - "
                f"Model selected: {controlnet_model_selected}"
            )
        )

        if (
            self.model.model_name != model_selected
            or self.model.sampler != sampler_selected
            or self.model.controlnet_model_name != controlnet_model_selected
        ):
            self.model.__init__(
                model_name=model_selected,
                controlnet_model_name=controlnet_model_selected,
                sampler=sampler_selected,
                pipeline_name="StableDiffusionControlNetPipeline",
            )

        images = self.model.generate_images(prompt=prompt, image=image)
        # upload to s3
        logger.info("Uploading image(s) to s3 and getting the url(s)")
        filename = file_service.upload_multiple_images_to_s3(images=images, user_bucket=settings.images_temp_bucket)
        url_images = file_service.get_image_urls(filenames=filename)
        return url_images
    except OutOfMemoryError as e:
        logger.exception(e)
        raise OutOfMemoryGPUError
    except Exception as e:
        logger.exception(e)
        raise ModelLoadError


@app.task(
    ignore_result=False,
    bind=True,
    base=DiffusionTask,
    path=("app.celery.mlmodels.stable_diffusion", "StableDiffusionInstructPix2Pix"),
    name=f"{__name__}.stable-diffusion-pix2pix",
)
@check_environment
def generate_stable_diffusion_pix2pix_output_task(self, prompt: Prompt, image: Image) -> list[str]:
    try:
        model_selected = prompt.model
        sampler_selected = prompt.sampler

        logger.info(f"Current model: {self.model.model_name} - Model selected: {model_selected}")
        logger.info(f"Current sampler: {self.model.sampler} - Sampler selected: {sampler_selected}")

        if self.model.model_name != model_selected or self.model.sampler != sampler_selected:
            self.model.__init__(
                model_name=model_selected,
                sampler=sampler_selected,
                pipeline_name="StableDiffusionInstructPix2PixPipeline",
            )

        images = self.model.generate_images(prompt=prompt, image=image)

        # Upload generated images to s3.
        logger.info("Uploading image(s) to s3 and getting the url(s)")
        filename = file_service.upload_multiple_images_to_s3(images=images, user_bucket=settings.images_temp_bucket)
        url_images = file_service.get_image_urls(filenames=filename)
        return url_images
    except OutOfMemoryError as e:
        logger.exception(e)
        raise OutOfMemoryGPUError
    except Exception as e:
        logger.exception(e)
        raise ModelLoadError


@app.task(
    ignore_result=False,
    bind=True,
    base=DiffusionTask,
    path=("app.celery.mlmodels.stable_diffusion", "StableDiffusionInpainting"),
    name=f"{__name__}.stable-diffusion-inpainting",
)
@check_environment
def generate_stable_diffusion_inpaint_output_task(self, prompt: Prompt, image: Image, mask: Image) -> list[str]:
    try:
        model_selected = prompt.model
        sampler_selected = prompt.sampler

        logger.info(f"Current model: {self.model.model_name} - Model selected: {model_selected}")
        logger.info(f"Current sampler: {self.model.sampler} - Sampler selected: {sampler_selected}")

        if self.model.model_name != model_selected or self.model.sampler != sampler_selected:
            self.model.__init__(
                model_name=model_selected,
                sampler=sampler_selected,
                pipeline_name="StableDiffusionInpaintPipeline",
            )

        images = self.model.generate_images(prompt=prompt, image=image, mask=mask)

        # Upload generated images to s3.
        logger.info("Uploading image(s) to s3 and getting the url(s)")
        filename = file_service.upload_multiple_images_to_s3(images=images, user_bucket=settings.images_temp_bucket)
        url_images = file_service.get_image_urls(filenames=filename)
        return url_images
    except OutOfMemoryError as e:
        logger.exception(e)
        raise OutOfMemoryGPUError
    except Exception as e:
        logger.exception(e)
        raise ModelLoadError


@app.task(
    ignore_result=False,
    bind=True,
    base=DiffusionTask,
    path=("app.celery.mlmodels.stable_diffusion", "StableDiffusionUpscale"),
    name=f"{__name__}.stable-diffusion-upscale",
)
@check_environment
def generate_stable_diffusion_upscale_output_task(self, prompt: Prompt, image: Image) -> list[str]:
    try:
        model_selected = prompt.model
        sampler_selected = prompt.sampler

        logger.info(f"Current model: {self.model.model_name} - Model selected: {model_selected}")
        logger.info(f"Current sampler: {self.model.sampler} - Sampler selected: {sampler_selected}")

        if self.model.model_name != model_selected or self.model.sampler != sampler_selected:
            self.model.__init__(
                model_name=model_selected,
                sampler=sampler_selected,
                pipeline_name="StableDiffusionUpscalePipeline",
            )

        images = self.model.generate_images(prompt=prompt, image=image)

        # Upload generated images to s3.
        logger.info("Uploading image(s) to s3 and getting the url(s)")
        filename = file_service.upload_multiple_images_to_s3(images=images, user_bucket=settings.images_temp_bucket)
        url_images = file_service.get_image_urls(filenames=filename)
        return url_images
    except OutOfMemoryError as e:
        logger.exception(e)
        raise OutOfMemoryGPUError
    except Exception as e:
        logger.exception(e)
        raise ModelLoadError
