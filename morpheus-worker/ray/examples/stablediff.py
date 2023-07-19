# script.py
import ray
from io import BytesIO
from fastapi import FastAPI
from fastapi.responses import Response
import torch
import os

from diffusers import EulerDiscreteScheduler, StableDiffusionPipeline

@ray.remote(num_gpus=1)
def image():
        model_id = "stabilityai/stable-diffusion-2"

        scheduler = EulerDiscreteScheduler.from_pretrained(
                model_id, subfolder="scheduler"
        )
        pipe = StableDiffusionPipeline.from_pretrained(
                model_id, scheduler=scheduler, revision="fp16", torch_dtype=tor>
        )
        pipe = pipe.to("cuda")

        prompt = "pretty cow"
        img_size = 512
        image = pipe(prompt, height=img_size, width=img_size).images[0]
        return image

ray.init()
print(ray.get(image.remote()))
print(os.getenv('PROMPT', "no hay"))
