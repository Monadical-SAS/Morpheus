import importlib

from PIL import Image, ImageFilter
from celery import Task
from loguru import logger
from torch.cuda import OutOfMemoryError

from app.celery.workers.stable_diffusion_app import app
from app.config import get_settings, get_file_handlers
from app.error.error import ModelLoadError, OutOfMemoryGPUError
from app.models.schemas import Prompt, PromptControlNet
from app.services.files_services import FilesService
from app.utils.decorators import (
    check_environment,
    run_as_per_environment,
)
from app.celery.mlmodels.controlnet import generate_canny_image
import app.utils.recoloring as recoloring

files_repository = get_file_handlers()
file_service = FilesService(files_repository=files_repository)
settings = get_settings()

MODEL_PATH_DEFAULT = f"{settings.model_parent_path}{settings.model_default}"


class DiffusionTask(Task):
    abstract = True

    def __init__(self, name: str = MODEL_PATH_DEFAULT):
        super().__init__()
        self.model = None
        self.name_model = name

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
def generate_stable_diffusion_img2img_output_task(
    self, prompt: Prompt, image: Image, palette_image: Image
) -> list[str]:
    print("Entering task generate_stable_diffusion_img2img_output_task")
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

        if prompt.color_palette == "None":
            images = self.model.generate_images(prompt=prompt, image=image)

        else:
            conditioning_image = None
            if prompt.color_palette == "Quantization - Blend" and palette_image:
                color_list = recoloring.get_image_colors(palette_image)
                quantized_image = recoloring.quantize(image, palette=color_list, use_gray_level=False)
                conditioning_image = Image.blend(quantized_image, image, alpha=0.3)

            elif prompt.color_palette == "Quantization - Contours" and palette_image:
                color_list = recoloring.get_image_colors(palette_image)
                quantized_image = recoloring.quantize(image, palette=color_list, use_gray_level=False)
                contours = generate_canny_image(image)
                conditioning_image = recoloring.draw_contours_on_image(contours, quantized_image)

            elif prompt.color_palette == "Quantization Gray - Blend" and palette_image:
                color_list = recoloring.get_image_colors(palette_image)
                quantized_image = recoloring.quantize(image, palette=color_list, use_gray_level=True)
                conditioning_image = Image.blend(quantized_image, image, alpha=0.3)

            elif prompt.color_palette == "Quantization Gray - Contours" and palette_image:
                color_list = recoloring.get_image_colors(palette_image)
                quantized_image = recoloring.quantize(image, palette=color_list, use_gray_level=True)
                contours = generate_canny_image(image)
                conditioning_image = recoloring.draw_contours_on_image(contours, quantized_image)

            elif prompt.color_palette == "Random Polygons - Blend" and palette_image:
                color_list = recoloring.get_image_colors(palette_image)
                polygon_image = recoloring.random_polygon_image(
                    color_list, width=image.width, height=image.height, num_polygons=150
                )
                polygon_image = polygon_image.filter(ImageFilter.GaussianBlur(radius=20))
                conditioning_image = Image.blend(polygon_image, image, alpha=0.15)

            elif prompt.color_palette == "Random Polygons - Contours" and palette_image:
                color_list = recoloring.get_image_colors(palette_image)
                polygon_image = recoloring.random_polygon_image(
                    color_list, width=image.width, height=image.height, num_polygons=150
                )
                polygon_image = polygon_image.filter(ImageFilter.GaussianBlur(radius=20))
                contours = generate_canny_image(image)
                conditioning_image = recoloring.draw_contours_on_image(contours, polygon_image)

            elif prompt.color_palette == "Random Color Blocks Small - Blend" and palette_image:
                color_list = recoloring.get_image_colors(palette_image)
                random_block_image = recoloring.create_block_image(8, 8, image.width, image.height, color_list)
                conditioning_image = Image.blend(random_block_image, image, alpha=0.15)

            elif prompt.color_palette == "Random Color Blocks Small - Contours" and palette_image:
                color_list = recoloring.get_image_colors(palette_image)
                random_block_image = recoloring.create_block_image(8, 8, image.width, image.height, color_list)
                contours = generate_canny_image(image)
                conditioning_image = recoloring.draw_contours_on_image(contours, random_block_image)

            elif prompt.color_palette == "Random Color Blocks Large - Blend" and palette_image:
                color_list = recoloring.get_image_colors(palette_image)
                random_block_image = recoloring.create_block_image(3, 3, image.width, image.height, color_list)
                conditioning_image = Image.blend(random_block_image, image, alpha=0.3)

            elif prompt.color_palette == "Random Color Blocks Large - Contours" and palette_image:
                color_list = recoloring.get_image_colors(palette_image)
                random_block_image = recoloring.create_block_image(3, 3, image.width, image.height, color_list)
                contours = generate_canny_image(image)
                conditioning_image = recoloring.draw_contours_on_image(contours, random_block_image)

            elif prompt.color_palette == "Color Matching - PCA" and palette_image:
                conditioning_image = recoloring.match_color(image, palette_image, "pca")

            elif prompt.color_palette == "Color Matching - Cholesky" and palette_image:
                conditioning_image = recoloring.match_color(image, palette_image, "chol")

            elif prompt.color_palette == "Color Matching - Symmetric" and palette_image:
                conditioning_image = recoloring.match_color(image, palette_image, "sym")

            elif prompt.color_palette == "Linear Color Transfer" and palette_image:
                conditioning_image = recoloring.color_transfer(image, palette_image)

            # image generation with recolored conditioning image
            images = self.model.generate_images(prompt=prompt, image=conditioning_image)

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
def generate_stable_diffusion_controlnet_output_task(
    self, prompt: PromptControlNet, image: Image, palette_image: Image
) -> list[str]:
    try:
        model_selected = prompt.model
        sampler_selected = prompt.sampler
        controlnet_model_selected = prompt.controlnet_model
        name = "StableDiffusionControlNetPipeline"
        if prompt.controlnet_input_type == "Image-to-Image":
            name = "StableDiffusionControlNetImg2ImgPipeline"

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
            or self.model.pipeline_name != name
        ):

            self.model.__init__(
                model_name=model_selected,
                controlnet_model_name=controlnet_model_selected,
                sampler=sampler_selected,
                pipeline_name=name,
            )

        # Color palettes
        if prompt.color_palette == "None":
            images = self.model.generate_images(prompt=prompt, image=image)

        else:
            conditioning_image = None
            if prompt.color_palette == "Quantization" and palette_image:
                color_list = recoloring.get_image_colors(palette_image)
                conditioning_image = recoloring.quantize(image, palette=color_list, use_gray_level=False)

            elif prompt.color_palette == "Quantization Gray" and palette_image:
                color_list = recoloring.get_image_colors(palette_image)
                conditioning_image = recoloring.quantize(image, palette=color_list, use_gray_level=True)

            elif prompt.color_palette == "Random Polygons" and palette_image:
                color_list = recoloring.get_image_colors(palette_image)
                polygon_image = recoloring.random_polygon_image(
                    color_list, width=image.width, height=image.height, num_polygons=150
                )
                conditioning_image = polygon_image.filter(ImageFilter.GaussianBlur(radius=20))

            elif prompt.color_palette == "Random Color Blocks Small" and palette_image:
                color_list = recoloring.get_image_colors(palette_image)
                conditioning_image = recoloring.create_block_image(8, 8, image.width, image.height, color_list)

            elif prompt.color_palette == "Random Color Blocks Large" and palette_image:
                color_list = recoloring.get_image_colors(palette_image)
                conditioning_image = recoloring.create_block_image(3, 3, image.width, image.height, color_list)

            elif prompt.color_palette == "Color Matching - PCA" and palette_image:
                conditioning_image = recoloring.match_color(image, palette_image, "pca")

            elif prompt.color_palette == "Color Matching - Cholesky" and palette_image:
                conditioning_image = recoloring.match_color(image, palette_image, "chol")

            elif prompt.color_palette == "Color Matching - Symmetric" and palette_image:
                conditioning_image = recoloring.match_color(image, palette_image, "sym")

            elif prompt.color_palette == "Linear Color Transfer" and palette_image:
                conditioning_image = recoloring.color_transfer(image, palette_image)

            # image generation with recolored conditioning image
            images = self.model.generate_images(prompt=prompt, image=image, conditioning_image=conditioning_image)

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
