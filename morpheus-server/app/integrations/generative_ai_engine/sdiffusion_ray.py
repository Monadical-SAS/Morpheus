import requests
from PIL import Image
from app.config import get_settings
from app.integrations.generative_ai_engine.generative_ai_interface import GenerativeAIInterface
from loguru import logger
from morpheus_data.models.schemas import GenerationRequest, TextGenerationRequest

settings = get_settings()


def send_request_to_ray_server(
        *,
        endpoint: str,
        request: GenerationRequest,
        image: Image = None,
        mask: Image = None
) -> str:
    files = {}
    if image:
        files["image"] = ("image.png", image.tobytes(), "image/png")
    if mask:
        files["mask"] = ("mask.png", mask.tobytes(), "image/png")

    request_args = {
        "url": f"http://worker-ray:8000/{endpoint}",
        "params": request.__dict__,
    }
    if files:
        request_args["files"] = files

    try:
        response = requests.post(**request_args)
        if response.status_code == 200:
            return response.text
        else:
            raise Exception(str(response.text))
    except Exception as e:
        print(e)
        raise Exception(str(e))


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
        pass

    @staticmethod
    def generate_pix2pix_images(*, request: GenerationRequest, image: Image) -> str:
        logger.info(f"Running generate_pix2pix_images process with request: {request}")
        task_id = send_request_to_ray_server(endpoint="pix2pux", request=request, image=image)
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
