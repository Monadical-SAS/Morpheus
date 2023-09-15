from PIL import Image
from loguru import logger
from morpheus_data.models.schemas import GenerationRequest

from app.celery.tasks.magic_prompt import generate_stable_diffusion_magicprompt_output_task
from app.celery.tasks.stable_diffusion import (
    generate_stable_diffusion_controlnet_output_task,
    generate_stable_diffusion_img2img_output_task,
    generate_stable_diffusion_inpaint_output_task,
    generate_stable_diffusion_pix2pix_output_task,
    generate_stable_diffusion_text2img_output_task,
    generate_stable_diffusion_upscale_output_task,
    generate_stable_diffusion_xl_text2img_output_task
)
from app.integrations.generative_ai_engine.generative_ai_interface import GenerativeAIInterface


class GenerativeAIStableDiffusionCelery(GenerativeAIInterface):
    @staticmethod
    def generate_text2img_images(*, request: GenerationRequest) -> str:
        logger.info(f"Running Stable Diffusion Text2Img process with request: {request}")
        if request.model_id.endswith("stabilityai/stable-diffusion-xl-base-1.0"):
            task_id = generate_stable_diffusion_xl_text2img_output_task.delay(request=request)
        else:
            task_id = generate_stable_diffusion_text2img_output_task.delay(request=request)
        return str(task_id)

    @staticmethod
    def generate_img2img_images(*, request: GenerationRequest, image: Image) -> str:
        logger.info(f"Running Stable Diffusion Img2Img process with request: {request}")
        task_id = generate_stable_diffusion_img2img_output_task.delay(request=request, image=image)
        return str(task_id)

    @staticmethod
    def generate_controlnet_images(*, request: GenerationRequest, image: Image) -> str:
        logger.info(f"Running stable diffusion process with request: {request}")
        task_id = generate_stable_diffusion_controlnet_output_task.delay(request=request, image=image)
        return str(task_id)

    @staticmethod
    def generate_pix2pix_images(*, request: GenerationRequest, image: Image) -> str:
        logger.info(f"Running Stable Diffusion Pix2Pix process with request: {request}")
        task_id = generate_stable_diffusion_pix2pix_output_task.delay(request=request, image=image)
        return str(task_id)

    @staticmethod
    def generate_inpainting_images(*, request: GenerationRequest, image: Image, mask: Image) -> str:
        logger.info(f"Running Stable Diffusion Inpainting process with request: {request}")
        task_id = generate_stable_diffusion_inpaint_output_task.delay(request=request, image=image, mask=mask)
        return str(task_id)

    @staticmethod
    def generate_upscaling_images(*, request: GenerationRequest, image: Image) -> str:
        logger.info(f"Running Stable Diffusion Upscaling process with request: {request}")
        task_id = generate_stable_diffusion_upscale_output_task.delay(request=request, image=image)
        return str(task_id)

    @staticmethod
    def generate_magicprompt(*, request: GenerationRequest) -> str:
        logger.info(f"Running Stable Diffusion MagicPrompt process with request: {request}")
        task_id = generate_stable_diffusion_magicprompt_output_task.delay(request=request)
        return str(task_id)
