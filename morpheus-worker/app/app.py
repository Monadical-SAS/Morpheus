import uuid
from typing import Any

import boto3
from fastapi import FastAPI
from fastapi.responses import Response
from pydantic import BaseModel
from pydantic_settings import BaseSettings
from ray import serve
from ray.util.state import get_task
from ray.util.state import summarize_tasks

app = FastAPI()


class Settings(BaseSettings):
    aws_access_key_id: str
    aws_secret_access_key: str
    images_bucket: int = 50


settings = Settings()


class PromptRequest(BaseModel):
    prompt: str
    img_size: int = 512


@ray.remote(num_cpus=1)
class S3Client:
    def __init__(self) -> None:
        self.AWS_ACCESS_KEY_ID = settings.aws_access_key_id
        self.AWS_SECRET_ACCESS_KEY = settings.aws_secret_access_key
        self.IMAGES_BUCKET = settings.images_bucket

        self.s3 = boto3.client(
            "s3",
            aws_access_key_id=self.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=self.AWS_SECRET_ACCESS_KEY,
        )

    def upload_file(self, file: Any, folder_name: str, file_name: str):
        key = f"{folder_name}/{file_name}"
        try:
            self.s3.upload_fileobj(
                Fileobj=file,
                Bucket=self.IMAGES_BUCKET,
                Key=key
            )
            return f"https://{self.IMAGES_BUCKET}/{key}"
        except Exception as e:
            print("Error uploading the file to AWS S3")
            print(e)


@ray.remote(num_gpus=1)
def image(prompt, task_uuid):
    task_id = ray.get_runtime_context().get_task_id()
    print(f"task: {task_id}")
    print(f"Morpheus task: {task_uuid}")
    print(f"Generating image: {prompt}")
    time.sleep(60)


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

    def generate(self, prompt: str, img_size=512):
        assert len(prompt), "prompt parameter cannot be empty"
        result = self.pipe(prompt, height=img_size, width=img_size).images[0]
        s3_client = S3Client.remote()
        url = s3_client.upload_file.remote(result, "ray-results", f"{prompt}.png")
        print(f"Image URL: {url}")
        return image


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

    @app.post("/imagine")
    async def generate(self, prompt: PromptRequest):
        try:
            assert len(prompt.prompt), "prompt parameter cannot be empty"
            task_uuid = str(uuid.uuid4())
            stable = StableDiffusionXLTextToImage.remote()
            task = stable.generate.remote(prompt.prompt, prompt.img_size)
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
