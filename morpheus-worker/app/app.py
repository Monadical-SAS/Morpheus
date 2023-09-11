import logging

from fastapi import FastAPI, UploadFile, Depends
from fastapi.responses import Response
from ray import serve
from ray.util.state import get_task
from ray.util.state import summarize_tasks

from app.actors.sd_controlnet import StableDiffusionControlnet
from app.actors.sd_img_to_img import StableDiffusionImageToImage
from app.actors.sd_inpainting import StableDiffusionInpainting
from app.actors.sd_pix_to_pix import StableDiffusionPixToPix
from app.actors.sd_text_to_img import StableDiffusionText2Img
from app.actors.sd_upscaling import StableDiffusionUpscaling
from app.schemas.schemas import Prompt

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

    @app.post("/text2img")
    async def generate_text2img(self, prompt: Prompt):
        try:
            print("prompt", prompt)
            self.logger.info(f"StableDiffusionV2Text2Img.generate: prompt: {prompt}")
            stable = StableDiffusionText2Img.remote(
                pipeline=prompt.pipeline,
                scheduler=prompt.scheduler,
                model_id=prompt.model_id,
            )
            stable.generate.remote(prompt=prompt)
            return Response(content=prompt.task_id)
        except Exception as e:
            self.logger.error(f"Error in generate_text2img {e}")
            return Response(content=e)

    @app.post("/img2img")
    async def generate_img2_img(
            self,
            image: UploadFile,
            prompt: Prompt = Depends(),
    ):
        try:
            stable = StableDiffusionImageToImage.remote(
                piepline=prompt.pipeline,
                scheduler=prompt.scheduler,
                model_id=prompt.model_id,
            )
            image = await image.read()
            stable.generate.remote(prompt=prompt, image=image)
            return Response(content=prompt.task_id)
        except Exception as e:
            self.logger.error(f"Error in generate_img2_img {e}")
            return Response(content=e)

    @app.post("/pix2pix")
    async def generate_img2_img(
            self,
            image: UploadFile,
            prompt: Prompt = Depends(),
    ):
        try:
            stable = StableDiffusionPixToPix.remote(
                piepline=prompt.pipeline,
                scheduler=prompt.scheduler,
                model_id=prompt.model_id,
            )
            image = await image.read()
            stable.generate.remote(prompt=prompt, image=image)
            return Response(content=prompt.task_id)
        except Exception as e:
            self.logger.error(f"Error in generate_pix2pix {e}")
            return Response(content=e)

    @app.post("/upscaling")
    async def generate_img2_img(
            self,
            image: UploadFile,
            prompt: Prompt = Depends(),
    ):
        try:
            stable = StableDiffusionUpscaling.remote(
                piepline=prompt.pipeline,
                scheduler=prompt.scheduler,
                model_id=prompt.model_id,
            )
            image = await image.read()
            stable.generate.remote(prompt=prompt, image=image)
            return Response(content=prompt.task_id)
        except Exception as e:
            self.logger.error(f"Error in generate_upscaling {e}")
            return Response(content=e)

    @app.post("/inpainting")
    async def generate_img2_img(
            self,
            image: UploadFile,
            mask: UploadFile,
            prompt: Prompt = Depends(),
    ):
        try:
            stable = StableDiffusionInpainting.remote(
                piepline=prompt.pipeline,
                scheduler=prompt.scheduler,
                model_id=prompt.model_id,
            )
            image = await image.read()
            mask = await mask.read()
            stable.generate.remote(prompt=prompt, image=image, mask=mask)
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
            stable = StableDiffusionControlnet.remote()
            image = await image.read()
            stable.generate.remote(prompt=prompt, image=image)
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
