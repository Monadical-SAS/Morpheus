import ray
import torch
from diffusers import EulerDiscreteScheduler, StableDiffusionImg2ImgPipeline
from ray import serve
from ray.serve.deployment_graph import InputNode
from ray.serve.drivers import DAGDriver
from ray.serve.http_adapters import json_request


@serve.deployment
class StableDiffusionImageToImage:
    def __init__(self):
        model_id = "stabilityai/stable-diffusion-2"
        scheduler = EulerDiscreteScheduler.from_pretrained(
            model_id, subfolder="scheduler"
        )
        self.pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
            model_id, scheduler=scheduler, revision="fp16", torch_dtype=torch.float16
        )
        self.pipe = self.pipe.to("cuda")

    async def __call__(self, http_request):
        request = await http_request.json()
        prompt = request["prompt"]
        img_size = request["img_size"]
        image = request["image"]
        assert len(prompt), "prompt parameter cannot be empty"
        task_id = ray.get_runtime_context().get_task_id()
        print(f"Task ID: {task_id}")
        image = self.pipe(prompt, image=image, height=img_size, width=img_size).images[0]
        return image


with InputNode() as input_node:
    sd_image_to_image = StableDiffusionImageToImage.bind()

app = DAGDriver.options(route_prefix="/img2img").bind(sd_image_to_image, http_adapter=json_request)
