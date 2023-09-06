import io

import ray
from PIL import Image
from app.actors.s3_client import S3Client


@ray.remote(num_gpus=1)
class StableDiffusionPixToPix:
    def __init__(self):
        import torch
        from diffusers import EulerDiscreteScheduler, StableDiffusionInstructPix2PixPipeline

        model_id = "timbrooks/instruct-pix2pix"
        scheduler = EulerDiscreteScheduler.from_pretrained(
            model_id, subfolder="scheduler"
        )
        self.pipe = StableDiffusionInstructPix2PixPipeline.from_pretrained(
            model_id, scheduler=scheduler, revision="fp16", torch_dtype=torch.float16
        )
        self.pipe = self.pipe.to("cuda")

    def generate(self, task_id: str, prompt: str, base_image: any):
        assert len(prompt), "prompt parameter cannot be empty"
        image = Image.open(io.BytesIO(base_image))
        result = self.pipe(prompt, image=image).images[0]
        s3_client = S3Client.remote()
        result = ray.get(s3_client.upload_file.remote(result, "ray-results", f"{task_id}.png"))
        print(f"result {result}")
        print(f"Image uploaded to S3")
