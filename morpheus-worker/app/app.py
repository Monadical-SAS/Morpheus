import logging

from fastapi import FastAPI, UploadFile, Depends
from fastapi.responses import Response
from ray import serve
from ray.util.state import get_task
from ray.util.state import summarize_tasks

from app.schemas.schemas import Prompt, CategoryEnum
from app.services.models_handler import ModelsHandler

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

    @app.post(f"/{CategoryEnum.TEXT_TO_IMAGE}")
    async def generate_text2img(self, prompt: Prompt):
        try:
            self.logger.info(f"StableDiffusionText2Img.generate: prompt: {prompt}")
            handler = ModelsHandler.remote(endpoint=CategoryEnum.TEXT_TO_IMAGE)
            handler.handle_generation.remote(prompt=prompt)
            return Response(content=prompt.task_id)
        except Exception as e:
            self.logger.error(f"Error in generate_text2img {e}")
            return Response(content=e)

    @app.post(f"/{CategoryEnum.IMAGE_TO_IMAGE}")
    async def generate_img2_img(
            self,
            image: UploadFile,
            prompt: Prompt = Depends(),
    ):
        try:
            self.logger.info(f"StableDiffusionImg2Img.generate: prompt: {prompt}")
            prompt.image = await image.read()
            handler = ModelsHandler.remote(endpoint=CategoryEnum.IMAGE_TO_IMAGE)
            handler.handle_generation.remote(prompt=prompt)
            return Response(content=prompt.task_id)
        except Exception as e:
            self.logger.error(f"Error in generate_img2_img {e}")
            return Response(content=e)

    @app.post(f"/{CategoryEnum.PIX_TO_PIX}")
    async def generate_pix2pix(
            self,
            image: UploadFile,
            prompt: Prompt = Depends(),
    ):
        try:
            self.logger.info(f"StableDiffusionPix2Pix.generate: prompt: {prompt}")
            prompt.image = await image.read()
            handler = ModelsHandler.remote(endpoint=CategoryEnum.PIX_TO_PIX)
            handler.handle_generation.remote(prompt=prompt)
            return Response(content=prompt.task_id)
        except Exception as e:
            self.logger.error(f"Error in generate_pix2pix {e}")
            return Response(content=e)

    @app.post(f"/{CategoryEnum.UPSCALING}")
    async def generate_upscaling(
            self,
            image: UploadFile,
            prompt: Prompt = Depends(),
    ):
        try:
            self.logger.info(f"StableDiffusionUpscaling.generate: prompt: {prompt}")
            prompt.image = await image.read()
            handler = ModelsHandler.remote(endpoint=CategoryEnum.UPSCALING)
            handler.handle_generation.remote(prompt=prompt)
            return Response(content=prompt.task_id)
        except Exception as e:
            self.logger.error(f"Error in generate_upscaling {e}")
            return Response(content=e)

    @app.post(f"/{CategoryEnum.INPAINTING}")
    async def generate_inpainting(
            self,
            image: UploadFile,
            mask: UploadFile,
            prompt: Prompt = Depends(),
    ):
        try:
            self.logger.info(f"StableDiffusionInpainting.generate: prompt: {prompt}")
            prompt.image = await image.read()
            prompt.mask = await mask.read()
            handler = ModelsHandler.remote(endpoint=CategoryEnum.INPAINTING)
            handler.handle_generation.remote(prompt=prompt)
            return Response(content=prompt.task_id)
        except Exception as e:
            self.logger.error(f"Error in generate_inpainting {e}")
            return Response(content=e)

    @app.post("/controlnet")
    async def generate_img2_img(
            self,
            image: UploadFile,
            prompt: Prompt = Depends(),
    ):
        try:
            self.logger.info(f"StableDiffusionControlnet.generate: prompt: {prompt}")
            prompt.image = await image.read()
            handler = ModelsHandler.remote(endpoint="text2img")
            handler.handle_generation.remote(prompt=prompt)
            return Response(content=prompt.task_id)
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
