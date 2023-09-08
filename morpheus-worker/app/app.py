import logging
import uuid

from app.actors.sd_controlnet import StableDiffusionControlnet
from app.actors.sd_img_to_img import StableDiffusionImageToImage
from app.actors.sd_inpainting import StableDiffusionInpainting
from app.actors.sd_pix_to_pix import StableDiffusionPixToPix
from app.actors.sd_text_to_img import StableDiffusionXLTextToImage, StableDiffusionV2Text2Img
from app.actors.sd_upscaling import StableDiffusionUpscaling
from app.schemas.schemas import Prompt
from fastapi import FastAPI, UploadFile
from fastapi.responses import Response
from ray import serve
from ray.util.state import get_task
from ray.util.state import summarize_tasks

app = FastAPI()


@serve.deployment(num_replicas=1, route_prefix="/")
@serve.ingress(app)
class APIIngress:
    def __init__(self) -> None:
        self.logger = logging.getLogger(__name__)

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

    @app.post("/text2img_xl")
    async def generate_text2img_xl(self, prompt: Prompt):
        try:
            assert len(prompt.prompt), "prompt parameter cannot be empty"
            task_uuid = str(uuid.uuid4())
            stable = StableDiffusionXLTextToImage.remote(scheduler=prompt.scheduler)
            stable.generate.remote(prompt=prompt)
            return Response(content=task_uuid)
        except Exception as e:
            self.logger.error(f"Error in generate_text2img_xl {e}")
            return Response(content=e)

    @app.post("/text2img")
    async def generate_text2img(self, prompt: Prompt):
        try:
            assert len(prompt.prompt), "prompt parameter cannot be empty"
            task_uuid = str(uuid.uuid4())
            stable = StableDiffusionV2Text2Img.remote(scheduler=prompt.scheduler)
            stable.generate.remote(task_uuid, prompt.prompt, prompt.img_size)
            return Response(content=task_uuid)
        except Exception as e:
            self.logger.error(f"Error in generate_text2img {e}")
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
            self.logger.error(f"Error in generate_img2_img {e}")
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
            self.logger.error(f"Error in generate_pix2pix {e}")
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
            self.logger.error(f"Error in generate_upscaling {e}")
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
            self.logger.error(f"Error in generate_inpainting {e}")
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
            self.logger.error(f"Error in generate_controlnet {e}")
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
