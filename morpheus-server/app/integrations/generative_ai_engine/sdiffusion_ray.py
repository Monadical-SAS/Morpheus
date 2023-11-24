import requests
from PIL import Image
from app.config import get_settings
from app.error.generation import RayCapacityExceededError
from app.integrations.generative_ai_engine.generative_ai_interface import GenerativeAIInterface
from loguru import logger
from morpheus_data.models.schemas import GenerationRequest, TextGenerationRequest
from morpheus_data.utils.images import from_image_to_bytes

settings = get_settings()
RAY_BACKEND_URL = settings.ray_backend_url


def send_request_to_ray_server(
        *,
        endpoint: str,
        request: GenerationRequest,
        image: Image = None,
        mask: Image = None
) -> str:
    files = {}
    if image:
        bytes_image = from_image_to_bytes(image)
        files["image"] = ("image.png", bytes_image, "image/png")
    if mask:
        bytes_mask = from_image_to_bytes(mask)
        files["mask"] = ("mask.png", bytes_mask, "image/png")

    request_args = {
        "url": f"{RAY_BACKEND_URL}/{endpoint}",
        "params": request.__dict__,
    }
    logger.info(f"Sending request to ray server with args: {request_args}")

    if files:
        request_args["files"] = files

    try:
        can_request, pending_tasks = validate_waiting_room()
        if not can_request:
            raise RayCapacityExceededError(
                f"There is no capacity at the moment. "
                f"Please try again later. Number of pending tasks = {pending_tasks}."
            )

        response = requests.post(**request_args)
        if response.status_code == 200:
            return response.text
        else:
            raise Exception(str(response.text))
    except Exception as e:
        logger.error(f"Error while sending request to ray server: {e}")
        raise Exception(str(e))


def validate_waiting_room() -> (bool, int):
    if not settings.waiting_room_enabled:
        return True, 0

    try:
        pending_tasks = ray_pending_tasks()
        worker_number = ray_worker_number()
        worker_number = worker_number if worker_number > 0 else 1
        max_tasks = settings.max_tasks_per_worker or 10
        can_request = (pending_tasks / worker_number) < max_tasks
        return can_request, pending_tasks
    except Exception as e:
        logger.error(f"Error while validating waiting room: {e}")
        raise e


def ray_pending_tasks() -> int:
    url = f"{RAY_BACKEND_URL}/pending-tasks"
    response = requests.get(url)
    if response.status_code == 200:
        return int(response.text)
    else:
        raise Exception(str(response.text))


def ray_worker_number() -> int:
    url = f"{RAY_BACKEND_URL}/worker-number-cache"
    response = requests.get(url)
    if response.status_code == 200:
        return int(response.text)
    else:
        raise Exception(str(response.text))


class GenerativeAIStableDiffusionRay(GenerativeAIInterface):
    @staticmethod
    def generate_text2img_images(*, request: GenerationRequest) -> str:
        logger.info(f"Running generate_img2img_images process with request: {request}")
        task_id = send_request_to_ray_server(endpoint="text2img", request=request)
        return str(task_id)

    @staticmethod
    def generate_img2img_images(*, request: GenerationRequest, image: Image) -> str:
        logger.info(f"Running generate_img2img_images process with request: {request}")
        task_id = send_request_to_ray_server(endpoint="img2img", request=request, image=image)
        return str(task_id)

    @staticmethod
    def generate_controlnet_images(*, request: GenerationRequest, image: Image) -> str:
        logger.info(f"Running generate_controlnet_images process with request: {request}")
        task_id = send_request_to_ray_server(endpoint="controlnet", request=request, image=image)
        return str(task_id)

    @staticmethod
    def generate_pix2pix_images(*, request: GenerationRequest, image: Image) -> str:
        logger.info(f"Running generate_pix2pix_images process with request: {request}")
        task_id = send_request_to_ray_server(endpoint="pix2pix", request=request, image=image)
        return str(task_id)

    @staticmethod
    def generate_inpainting_images(*, request: GenerationRequest, image: Image, mask: Image) -> str:
        logger.info(f"Running generate_inpainting_images process with request: {request}")
        task_id = send_request_to_ray_server(endpoint="inpainting", request=request, image=image, mask=mask)
        return str(task_id)

    @staticmethod
    def generate_upscaling_images(*, request: GenerationRequest, image: Image) -> str:
        logger.info(f"Running generate_upscaling_images process with request: {request}")
        task_id = send_request_to_ray_server(endpoint="upscaling", request=request, image=image)
        return str(task_id)

    @staticmethod
    def generate_magic_prompt(*, request: TextGenerationRequest) -> str:
        logger.info(f"Running generate_magic_prompt process with request: {request}")
        task_id = send_request_to_ray_server(endpoint="magic_prompt", request=request)
        return str(task_id)
