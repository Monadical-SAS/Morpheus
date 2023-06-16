#!/usr/bin/env python3

import typer
from loguru import logger

from api_client import authenticate_user
from sd_client import (
    generate_text2img,
    generate_img2img,
    generate_pix2pix,
    generate_inpainting,
    generate_upscaling,
    generate_magicprompt,
)

cli = typer.Typer(rich_markup_mode="rich")


@cli.command("text2img")
def text2img_mode(prompt: str, token: str = None):
    logger.info(f"Generating text2img with prompt: {prompt}")
    if token is None:
        token = authenticate_user()
    generate_text2img(prompt=prompt, token=token)


@cli.command("img2img")
def img2img_mode(prompt: str, image: str, token: str = None):
    logger.info(f"Generating img2img with prompt: {prompt} and image: {image}")
    if token is None:
        token = authenticate_user()
    generate_img2img(prompt=prompt, image=image, token=token)


@cli.command("pix2pix")
def pix2pix_mode(prompt: str, image: str, token: str = None):
    logger.info(f"Generating pix2pix with prompt: {prompt} and image: {image}")
    if token is None:
        token = authenticate_user()
    generate_pix2pix(prompt=prompt, image=image, token=token)


@cli.command("inpaint")
def inpaint_mode(prompt: str, image: str, mask: str, token: str = None):
    logger.info(f"Generating inpainting with prompt: {prompt}, image: {image} and mask: {mask}")
    if token is None:
        token = authenticate_user()
    generate_inpainting(prompt=prompt, image=image, mask=mask, token=token)


@cli.command("upscale")
def upscale_mode(prompt: str, image: str, width: int = None, height: int = None, token: str = None):
    logger.info(f"Generating upscale with prompt: {prompt} and image: {image}")
    if token is None:
        token = authenticate_user()
    generate_upscaling(prompt=prompt, image=image, width=width, height=height, token=token)


@cli.command("magicprompt")
def magicprompt_mode(prompt: str, token: str = None):
    logger.info(f"Generating MagicPrompt with prompt: {prompt}")
    if token is None:
        token = authenticate_user()
    generate_magicprompt(prompt=prompt, token=token)


if __name__ == "__main__":
    cli()
