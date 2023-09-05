import logging
import uuid

from fastapi import FastAPI, UploadFile
from fastapi.responses import Response
from ray import serve
from ray.util.state import get_task
from ray.util.state import summarize_tasks

from actors.sd_img_to_img import StableDiffusionImageToImage
from actors.sd_text_to_img import StableDiffusionXLTextToImage, StableDiffusionV2Text2Img
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
