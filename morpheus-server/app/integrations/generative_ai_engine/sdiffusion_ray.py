import requests
from PIL import Image
from app.integrations.generative_ai_engine.generative_ai_interface import GenerativeAIInterface
from loguru import logger
from morpheus_data.models.schemas import GenerationRequest


def send_request_to_ray_server(
        *,
        endpoint: str,
        form_data: GenerationRequest,
        image: Image = None,
        mask: Image = None
) -> str:
    form_data.task_id = str(form_data.task_id)
    form_data = form_data.dict()
    request_data, files = {"data": form_data, }, dict()
    if image:
        files["image"] = ("image.png", image.tobytes(), "image/png")
    if mask:
        files["mask"] = ("mask.png", mask.tobytes(), "image/png")
    if files:
        request_data["files"] = files

    url = f"http://worker-ray:8000/{endpoint}"
    response = requests.post(url, json=request_data)
    if response.status_code == 200:
        return response.text
    else:
        raise Exception(str(response.text))


class GenerativeAIStableDiffusionRay(GenerativeAIInterface):
    @staticmethod
    def generate_text2img_images(*, request: GenerationRequest) -> str:
        logger.info(f"Running generate_img2img_images process with request: {request}")
        task_id = send_request_to_ray_server(endpoint="text2img", form_data=request)
        return str(task_id)

    @staticmethod
    def generate_img2img_images(*, request: GenerationRequest, image: Image) -> str:
        logger.info(f"Running generate_img2img_images process with request: {request}")
        task_id = send_request_to_ray_server(endpoint="img2img", form_data=request, image=image)
        return str(task_id)

    @staticmethod
    def generate_controlnet_images(*, request: GenerationRequest, image: Image) -> str:
        pass

    @staticmethod
    def generate_pix2pix_images(*, request: GenerationRequest, image: Image) -> str:
        logger.info(f"Running generate_pix2pix_images process with request: {request}")
        task_id = send_request_to_ray_server(endpoint="pix2pux", form_data=request, image=image)
        return str(task_id)

    @staticmethod
    def generate_inpainting_images(*, request: GenerationRequest, image: Image, mask: Image) -> str:
        logger.info(f"Running generate_inpainting_images process with request: {request}")
        task_id = send_request_to_ray_server(endpoint="inpainting", form_data=request, image=image, mask=mask)
        return str(task_id)

    @staticmethod
    def generate_upscaling_images(*, request: GenerationRequest, image: Image) -> str:
        logger.info(f"Running generate_upscaling_images process with request: {request}")
        task_id = send_request_to_ray_server(endpoint="upscaling", form_data=request, image=image)
        return str(task_id)

    @staticmethod
    def generate_magicprompt(*, request: GenerationRequest) -> str:
        pass
