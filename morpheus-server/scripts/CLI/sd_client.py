import inspect

from loguru import logger

from api_client import build_query_string, make_request, get_task_results
from images import save_images
from settings import model_config, ModelConfig, settings


def generate_text2img(
    *, prompt: str, token: str = None, await_response: bool = True, config: ModelConfig = model_config
):
    config.model = "stabilityai/stable-diffusion-2"
    url = build_query_string(prompt=prompt, endpoint="text2img", config=config)
    logger.info(f"Making request to {url} with prompt: {prompt}")

    task_id = make_request(url=url, params={}, token=token)
    logger.info(f"Task ID: {task_id}")
    handle_response(await_response=await_response, task_id=task_id, token=token)


def generate_img2img(
    *, prompt: str, image: str, token: str = None, await_response: bool = True, config: ModelConfig = model_config
):
    config.model = "stabilityai/stable-diffusion-2"
    url = build_query_string(prompt=prompt, endpoint="img2img", config=config)
    # Files are getting read in and passed to the API server in the body of
    # the request.
    files = {"image": open(image, "rb")}
    logger.info(f"Making request to {url} with files: {image}")

    task_id = make_request(url=url, params={}, files=files, token=token)
    logger.info(f"Task ID: {task_id}")
    handle_response(await_response=await_response, task_id=task_id, token=token)


def generate_pix2pix(
    *, prompt: str, image: str, token: str = None, await_response: bool = True, config: ModelConfig = model_config
):
    config.model = "timbrooks/instruct-pix2pix"
    url = build_query_string(prompt=prompt, endpoint="pix2pix", config=config)
    # Files are getting read in and passed to the API server in the body of
    # the request.
    files = {"image": open(image, "rb")}
    logger.info(f"Making request to {url} with files: {image}")

    task_id = make_request(url=url, params={}, files=files, token=token)
    logger.info(f"Task ID: {task_id}")
    handle_response(await_response=await_response, task_id=task_id, token=token)


def generate_inpainting(
    *,
    prompt: str,
    image: str,
    mask: str,
    token: str = None,
    await_response: bool = True,
    config: ModelConfig = model_config,
):
    config.model = "runwayml/stable-diffusion-inpainting"
    url = build_query_string(prompt=prompt, endpoint="inpaint", config=config)
    # Files are getting read in and passed to the API server in the body of
    # the request.
    files = {"image": open(image, "rb"), "mask": open(mask, "rb")}
    logger.info(f"Making request to {url} with files: {image} and {mask}")

    task_id = make_request(url=url, params={}, files=files, token=token)
    logger.info(f"Task ID: {task_id}")
    handle_response(await_response=await_response, task_id=task_id, token=token)


def generate_upscaling(
    *,
    prompt: str,
    image: str,
    width: int,
    height: int,
    token: str = None,
    await_response: bool = True,
    config: ModelConfig = model_config,
):
    config.model = "stabilityai/stable-diffusion-x4-upscaler"
    config.width = width or 128
    config.height = height or 128
    url = build_query_string(prompt=prompt, endpoint="upscale", config=config)
    # Files are getting read in and passed to the API server in the body of
    # the request.
    files = {"image": open(image, "rb")}
    logger.info(f"Making request to {url} with files: {image}")
    task_id = make_request(url=url, params={}, files=files, token=token)
    logger.info(f"Task ID: {task_id}")
    handle_response(await_response=await_response, task_id=task_id, token=token)


def generate_magicprompt(
    *,
    prompt: str,
    token: str = None,
    await_response: bool = True,
    config: ModelConfig = model_config,
):
    config.model = "stabilityai/stable-diffusion-2"
    url = f"{settings.base_url}/sdiffusion/magicprompt/prompt/"
    params = {"prompt": prompt, "config": config.dict()}
    logger.info(f"Making request to {url} with params: {params}")

    task_id = make_request(url=url, params=params, token=token)
    logger.info(f"Task ID: {task_id}")
    handle_response(await_response=await_response, task_id=task_id, token=token)


def handle_response(*, await_response: bool, task_id: str, token: str = None):
    if await_response:
        response = get_task_results(task_id=task_id, token=token)
        logger.info(f"Response: {response}")

        # The type of data returned will depend on the calling function.  eg) Some
        # calls will return image data, while others return lists of strings.
        caller = str(inspect.stack()[1][3])

        if caller == "generate_magicprompt":
            # Magic prompt returns a list of strings, and doesn't require any images
            # to be saved, so do nothing here.
            pass
        else:
            # Else save the images to S3.
            save_images(response["data"])
