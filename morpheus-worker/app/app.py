import logging
import uuid
from typing import Any
import os
import io
import boto3
from fastapi import FastAPI, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel
import ray
from ray import serve
from ray.util.state import get_task
from ray.util.state import summarize_tasks
from io import BytesIO
from PIL import Image

app = FastAPI()
logger = logging.getLogger(__name__)


class PromptRequest(BaseModel):
    prompt: str
    img_size: int = 512


@ray.remote
class S3Client:
    def __init__(self) -> None:
        self.AWS_ACCESS_KEY_ID = ""
        self.AWS_SECRET_ACCESS_KEY = ""
        self.IMAGES_BUCKET = os.environ.get("IMAGES_BUCKET")

        self.s3 = boto3.client(
            "s3",
            aws_access_key_id=self.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=self.AWS_SECRET_ACCESS_KEY,
        )

    def upload_file(self, file: Any, folder_name: str, file_name: str):
        img_byte_arr = BytesIO()
        file.save(img_byte_arr, format="png")
        img_byte_arr = img_byte_arr.getvalue()
        key = f"{folder_name}/{file_name}"
        try:
            self.s3.put_object(
                Body=img_byte_arr,
                Bucket="morpheus-results-staging-253",
                Key=key,
            )
            return f"https://{self.IMAGES_BUCKET}.s3.amazonaws.com/{key}.png"
        except Exception as e:
            logger.error("Error uploading file")
            logger.error(e)


@ray.remote(num_gpus=1)
class StableDiffusionXLTextToImage:
    def __init__(self):
        import torch
        from diffusers import StableDiffusionXLPipeline

        model_id = "stabilityai/stable-diffusion-xl-base-1.0"

        self.pipe = StableDiffusionXLPipeline.from_pretrained(
            model_id,
            torch_dtype=torch.float16,
            variant="fp16",
            use_safetensors=True
        )
        self.pipe = self.pipe.to("cuda")

    def generate(self, task_id: str, prompt: str, img_size=512):
        assert len(prompt), "prompt parameter cannot be empty"
        result = self.pipe(prompt, height=img_size, width=img_size).images[0]
        s3_client = S3Client.remote()
        result = ray.get(s3_client.upload_file.remote(result, "ray-results", f"{task_id}.png"))
        print(f"result {result}")
        logger.info(f"Image uploaded to S3")


@ray.remote(num_gpus=1)
class StableDiffusionV2Text2Img:
    def __init__(self):
        import torch
        from diffusers import StableDiffusionXLPipeline

        model_id = "stabilityai/stable-diffusion-xl-base-1.0"

        self.pipe = StableDiffusionXLPipeline.from_pretrained(
            model_id,
            torch_dtype=torch.float16,
            variant="fp16",
            use_safetensors=True
        )
        self.pipe = self.pipe.to("cuda")

    def generate(self, task_id: str, prompt: str, img_size=512):
        assert len(prompt), "prompt parameter cannot be empty"
        result = self.pipe(prompt, height=img_size, width=img_size).images[0]
        s3_client = S3Client.remote()
        result = ray.get(s3_client.upload_file.remote(result, "ray-results", f"{task_id}.png"))
        print(f"result {result}")
        logger.info(f"Image uploaded to S3")


@ray.remote(num_gpus=1)
class StableDiffusionImageToImage:
    def __init__(self):
        import torch
        from diffusers import EulerDiscreteScheduler, StableDiffusionImg2ImgPipeline

        model_id = "stabilityai/stable-diffusion-2"
        scheduler = EulerDiscreteScheduler.from_pretrained(
            model_id, subfolder="scheduler"
        )
        self.pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
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
        logger.info(f"Image uploaded to S3")


@serve.deployment(num_replicas=1, route_prefix="/")
@serve.ingress(app)
class APIIngress:
    def __init__(self) -> None:
        print("Initializing")
        self.task_types = [
            "PENDING_OBJ_STORE_MEM_AVAIL",
            "PENDING_NODE_ASSIGNMENT",
            "SUBMITTED_TO_WORKER",
            "PENDING_ARGS_FETCH",
            "SUBMITTED_TO_WORKER"
        ]

    @app.get("/")
    async def root(self):
        return "Hello from Morpheus Ray"

    @app.post("/imagine")
    async def generate_imagine(self, prompt: PromptRequest):
        try:
            assert len(prompt.prompt), "prompt parameter cannot be empty"
            task_uuid = str(uuid.uuid4())
            stable = StableDiffusionXLTextToImage.remote()
            task = stable.generate.remote(task_uuid, prompt.prompt, prompt.img_size)
            print(str(task))
            return Response(content=task_uuid)
        except Exception as e:
            print(e)
            return e

    @app.post("/text2img")
    async def generate_text2img(self, prompt: PromptRequest):
        try:
            assert len(prompt.prompt), "prompt parameter cannot be empty"
            task_uuid = str(uuid.uuid4())
            stable = StableDiffusionV2Text2Img.remote()
            task = stable.generate.remote(task_uuid, prompt.prompt, prompt.img_size)
            print(str(task))
            return Response(content=task_uuid)
        except Exception as e:
            print(e)
            return e

    @app.post("/img2img")
    async def generate_img2_img(
            self,
            prompt: str,
            image: UploadFile,
    ):
        try:
            assert len(prompt), "prompt parameter cannot be empty"
            task_uuid = str(uuid.uuid4())
            stable = StableDiffusionImageToImage.remote()
            image = await image.read()
            task = stable.generate.remote(task_uuid, prompt, image)
            print(str(task))
            return Response(content=task_uuid)
        except Exception as e:
            print(e)
            return e

    @app.get("/task")
    async def task_status(self, task_id: str):
        task = get_task(task_id)
        return Response(content=task.state)

    @app.get("/pending-tasks")
    async def pending_tasks(self):
        summary = summarize_tasks()
        pending = 0
        if "cluster" in summary and "summary" in summary["cluster"]:
            tasks = summary["cluster"]["summary"]
            for key in tasks:
                task = tasks[key]
                if task["type"] == "NORMAL_TASK":
                    for task_type in task["state_counts"]:
                        if task_type in self.task_types:
                            pending += task["state_counts"][task_type]
        return pending


deployment = APIIngress.bind()
