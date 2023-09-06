import logging
import uuid

from fastapi import FastAPI, UploadFile
from fastapi.responses import Response
from ray import serve
from ray.util.state import get_task
from ray.util.state import summarize_tasks

from actors.sd_controlnet import StableDiffusionControlnet
from actors.sd_img_to_img import StableDiffusionImageToImage
from actors.sd_inpainting import StableDiffusionInpainting
from actors.sd_pix_to_pix import StableDiffusionPixToPix
from actors.sd_text_to_img import StableDiffusionXLTextToImage, StableDiffusionV2Text2Img
from actors.sd_upscaling import StableDiffusionUpscaling
from schemas.schemas import PromptRequest

app = FastAPI()
logger = logging.getLogger(__name__)


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
            stable.generate.remote(task_uuid, prompt.prompt, prompt.img_size)
            return Response(content=task_uuid)
        except Exception as e:
            return Response(content=e)

    @app.post("/text2img")
    async def generate_text2img(self, prompt: PromptRequest):
        try:
            assert len(prompt.prompt), "prompt parameter cannot be empty"
            task_uuid = str(uuid.uuid4())
            stable = StableDiffusionV2Text2Img.remote()
            stable.generate.remote(task_uuid, prompt.prompt, prompt.img_size)
            return Response(content=task_uuid)
        except Exception as e:
            return Response(content=e)

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
            stable.generate.remote(task_uuid, prompt, image)
            return Response(content=task_uuid)
        except Exception as e:
            return Response(content=e)

    @app.post("/pix2pix")
    async def generate_img2_img(
            self,
            prompt: str,
            image: UploadFile,
    ):
        try:
            assert len(prompt), "prompt parameter cannot be empty"
            task_uuid = str(uuid.uuid4())
            stable = StableDiffusionPixToPix.remote()
            image = await image.read()
            stable.generate.remote(task_uuid, prompt, image)
            return Response(content=task_uuid)
        except Exception as e:
            return Response(content=e)

    @app.post("/upscaling")
    async def generate_img2_img(
            self,
            prompt: str,
            image: UploadFile,
    ):
        try:
            assert len(prompt), "prompt parameter cannot be empty"
            task_uuid = str(uuid.uuid4())
            stable = StableDiffusionUpscaling.remote()
            image = await image.read()
            stable.generate.remote(task_uuid, prompt, image)
            return Response(content=task_uuid)
        except Exception as e:
            return Response(content=e)

    @app.post("/inpainting")
    async def generate_img2_img(
            self,
            prompt: str,
            image: UploadFile,
            mask: UploadFile,
    ):
        try:
            assert len(prompt), "prompt parameter cannot be empty"
            task_uuid = str(uuid.uuid4())
            stable = StableDiffusionInpainting.remote()
            image = await image.read()
            mask = await mask.read()
            stable.generate.remote(task_uuid, prompt, image, mask)
            return Response(content=task_uuid)
        except Exception as e:
            return Response(content=e)

    @app.post("/controlnet")
    async def generate_img2_img(
            self,
            prompt: str,
            image: UploadFile,
    ):
        try:
            assert len(prompt), "prompt parameter cannot be empty"
            task_uuid = str(uuid.uuid4())
            stable = StableDiffusionControlnet.remote()
            image = await image.read()
            stable.generate.remote(task_uuid, prompt, image)
            return Response(content=task_uuid)
        except Exception as e:
            return Response(content=e)

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
