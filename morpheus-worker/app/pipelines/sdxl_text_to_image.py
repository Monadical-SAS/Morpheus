import ray
import torch
from diffusers import StableDiffusionXLPipeline
from ray import serve
from ray.serve.deployment_graph import InputNode
from ray.serve.drivers import DAGDriver
from ray.serve.http_adapters import json_request


@serve.deployment
class StableDiffusionXLTextToImage:
    def __init__(self):
        model_id = "stabilityai/stable-diffusion-xl-base-1.0"

        self.pipe = StableDiffusionXLPipeline.from_pretrained(
            model_id,
            torch_dtype=torch.float16,
            variant="fp16",
            use_safetensors=True
        )
        self.pipe = self.pipe.to("cuda")

    async def __call__(self, http_request):
        request = await http_request.json()
        prompt = request["prompt"]
        img_size = request["img_size"]
        assert len(prompt), "prompt parameter cannot be empty"
        generator = torch.Generator(self.generator_device).manual_seed(prompt.generator)
        task_id = ray.get_runtime_context().get_task_id()
        print(f"Task ID: {task_id}")
        image = self.pipe(prompt, height=img_size, width=img_size).images[0]
        return image


with InputNode() as input_node:
    sdxl_text_to_image = StableDiffusionXLTextToImage.bind()

app = DAGDriver.options(route_prefix="/text2img_xl").bind(sdxl_text_to_image, http_adapter=json_request)
