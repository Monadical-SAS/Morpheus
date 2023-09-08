import logging

import ray
from app.actors.s3_client import S3Client


@ray.remote(num_gpus=1)
class StableDiffusionV2Text2Img:
    def __init__(self):
        import torch
        from diffusers import EulerDiscreteScheduler, StableDiffusionPipeline
        self.logger = logging.getLogger(__name__)
        model_id = "stabilityai/stable-diffusion-2"
        scheduler = EulerDiscreteScheduler.from_pretrained(
            model_id, subfolder="scheduler"
        )
        self.pipe = StableDiffusionPipeline.from_pretrained(
            model_id, scheduler=scheduler, revision="fp16", torch_dtype=torch.float16
        )
        self.pipe = self.pipe.to("cuda")

    def generate(self, task_id: str, prompt: str, img_size=512):
        assert len(prompt), self.logger.error("prompt parameter cannot be empty")
        result = self.pipe(prompt, height=img_size, width=img_size).images[0]
        s3_client = S3Client.remote()
        result = ray.get(s3_client.upload_file.remote(result, "ray-results", f"{task_id}.png"))
        self.logger.info(f"ImageToImage for taskId {task_id} result {result}")
        return result


@ray.remote(num_gpus=1)
class StableDiffusionXLTextToImage:
    def __init__(self):
        import torch
        from diffusers import StableDiffusionXLPipeline
        self.logger = logging.getLogger(__name__)

        model_id = "stabilityai/stable-diffusion-xl-base-1.0"
        self.pipe = StableDiffusionXLPipeline.from_pretrained(
            model_id,
            torch_dtype=torch.float16,
            variant="fp16",
            use_safetensors=True
        )
        self.pipe = self.pipe.to("cuda")

    def generate(self, task_id: str, prompt: str, img_size=512):
        assert len(prompt), self.logger.error("prompt parameter cannot be empty")
        result = self.pipe(prompt, height=img_size, width=img_size).images[0]
        s3_client = S3Client.remote()
        result = ray.get(s3_client.upload_file.remote(result, "ray-results", f"{task_id}.png"))
        self.logger.info(f"ImageToImage for taskId {task_id} result {result}")
        return result
