# script.py
import ray
from io import BytesIO
import torch
import os

from diffusers import EulerDiscreteScheduler, StableDiffusionPipeline

@ray.remote
def image():
    model_id = "stabilityai/stable-diffusion-2"
	
    task_id = ray.task_context.task_id()
    print(task_id)

    scheduler = EulerDiscreteScheduler.from_pretrained(
		model_id, subfolder="scheduler"
	)
    pipe = StableDiffusionPipeline.from_pretrained(
		model_id, scheduler=scheduler
	)
    pipe = pipe.to("cpu")

    prompt = "pretty cow"
    img_size = 512
    image = pipe(prompt, height=img_size, width=img_size).images[0]
    return image

ray.init()
print(ray.get(image.remote()))
print(os.getenv('PROMPT', "NA"))