from PIL import Image
from loguru import logger

from app.celery.tasks.magic_prompt import generate_stable_diffusion_magicprompt_output_task
from app.celery.tasks.stable_diffusion import (
    generate_stable_diffusion_controlnet_output_task,
    generate_stable_diffusion_img2img_output_task,
    generate_stable_diffusion_inpaint_output_task,
    generate_stable_diffusion_pix2pix_output_task,
    generate_stable_diffusion_text2img_output_task,
    generate_stable_diffusion_upscale_output_task,
)
from app.models.schemas import MagicPrompt, Prompt, PromptControlNet


class StableDiffusionRepository:
    @staticmethod
    def generate_text2img_images(prompt: Prompt) -> str:
        logger.info(f" Running Stable Diffusion Text2Img process with prompt: {prompt}")
        task_id = generate_stable_diffusion_text2img_output_task.delay(prompt=prompt)
        return str(task_id)

    @staticmethod
    def generate_img2img_images(prompt: Prompt, image: Image) -> str:
        logger.info(f"Running Stable Diffusion Img2Img process with prompt: {prompt}")
        task_id = generate_stable_diffusion_img2img_output_task.delay(prompt=prompt, image=image)
        return str(task_id)

    @staticmethod
    def generate_controlnet_images(prompt: PromptControlNet, image: Image) -> str:
        logger.info(f"Running stable diffusion process with prompt: {prompt}")
        task_id = generate_stable_diffusion_controlnet_output_task.delay(prompt=prompt, image=image)
        return str(task_id)

    @staticmethod
    def generate_pix2pix_images(prompt: Prompt, image: Image) -> str:
        logger.info(f"Running Stable Diffusion Pix2Pix process with prompt: {prompt}")
        task_id = generate_stable_diffusion_pix2pix_output_task.delay(prompt=prompt, image=image)
        return str(task_id)

    @staticmethod
    def generate_inpainting_images(prompt: Prompt, image: Image, mask: Image) -> str:
        logger.info(f"Running Stable Diffusion Inpaint process with prompt: {prompt}")
        task_id = generate_stable_diffusion_inpaint_output_task.delay(prompt=prompt, image=image, mask=mask)
        return str(task_id)

    @staticmethod
    def generate_upscaling_images(prompt: Prompt, image: Image) -> str:
        logger.info(f"Running Stable Diffusion Upscale process with prompt: {prompt}")
        task_id = generate_stable_diffusion_upscale_output_task.delay(prompt=prompt, image=image)
        return str(task_id)

    @staticmethod
    def generate_magicprompt(prompt: MagicPrompt) -> str:
        logger.info(f"Running Stable Diffusion MagicPrompt process with prompt: {prompt}")
        task_id = generate_stable_diffusion_magicprompt_output_task.delay(prompt=prompt)
        return str(task_id)
