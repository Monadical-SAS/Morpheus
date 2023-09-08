import io
import logging

import ray
from PIL import Image
from app.actors.s3_client import S3Client


@ray.remote(num_gpus=1)
class StableDiffusionControlnet:
    def __init__(self):
        import torch
        from diffusers import EulerDiscreteScheduler, StableDiffusionControlNetPipeline, ControlNetModel
        self.logger = logging.getLogger(__name__)

        model_id = "stabilityai/stable-diffusion-x4-upscaler"
        controlnet_id = "lllyasviel/sd-controlnet-canny"

        scheduler = EulerDiscreteScheduler.from_pretrained(
            model_id, subfolder="scheduler"
        )
        controlnet = ControlNetModel.from_pretrained(controlnet_id)
        self.pipe = StableDiffusionControlNetPipeline.from_pretrained(
            model_id,
            controlnet=controlnet,
            scheduler=scheduler,
            revision="fp16",
            torch_dtype=torch.float16
        )
        self.pipe = self.pipe.to("cuda")

    def generate(self, task_id: str, prompt: str, base_image: any):
        assert len(prompt), self.logger.error("prompt parameter cannot be empty")
        image = Image.open(io.BytesIO(base_image))
        result = self.pipe(prompt, image=image).images[0]
        s3_client = S3Client.remote()
        result = ray.get(s3_client.upload_file.remote(result, "ray-results", f"{task_id}.png"))
        self.logger.info(f"ControlNet for taskId {task_id} result {result}")
        return result
