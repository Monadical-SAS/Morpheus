#!/usr/bin/env python3

import random

import typer
from rich import print

from api_client import authenticate_user
from sd_client import generate_text2img, generate_img2img, generate_pix2pix, generate_inpainting, generate_upscaling
from settings import model_config, ModelConfig

cli = typer.Typer(rich_markup_mode="rich")


@cli.command("stress")
def stress_tests_standard_mode(num_requests: int):
    token = authenticate_user()
    for i in range(num_requests):
        print(f"Request {i + 1} of {num_requests}")
        generate_text2img(prompt="A photo of a cat in a field of flowers.", token=token, await_response=False)


@cli.command("stress-random")
def stress_tests_random_mode(num_requests: int):
    token = authenticate_user()
    for i in range(num_requests):
        print(f"Request {i + 1} of {num_requests}")
        config = get_random_config()
        function, params = get_random_option()
        function(token=token, config=config, await_response=False, **params)


def get_random_config():
    size = random.choice([480, 512, 768])
    config: ModelConfig = model_config
    config.width = size
    config.height = size
    config.num_inference_steps = random.randint(10, 150)
    config.guidance_scale = random.randint(5, 20)
    config.num_images_per_prompt = random.randint(1, 4)
    return config


def get_random_option():
    options = ["text2img", "img2img", "pix2pix", "inpaint"]
    random_option = random.choice(options)

    if random_option == "text2img":
        params = {"prompt": "A photo of a cat in a field of flowers."}
        return generate_text2img, params

    elif random_option == "img2img":
        prompt = "A dog surrounded by flowers."
        image = "images/dog.png"
        params = {"prompt": prompt, "image": image}
        return generate_img2img, params

    elif random_option == "pix2pix":
        prompt = "Turn the dog into a chiwawa."
        image = "images/dog.png"
        params = {"prompt": prompt, "image": image}
        return generate_pix2pix, params

    elif random_option == "inpaint":
        prompt = "Add a cat to the park bench."
        image = "images/dog.png"
        mask = "images/mask.png"
        params = {"prompt": prompt, "image": image, "mask": mask}
        return generate_inpainting, params

    elif random_option == "upscale":
        prompt = "A white cat."
        image = "images/lr_cat.png"
        params = {"prompt": prompt, "image": image}
        return generate_upscaling, params

    else:
        raise ValueError("Invalid option.")


if __name__ == "__main__":
    cli()
