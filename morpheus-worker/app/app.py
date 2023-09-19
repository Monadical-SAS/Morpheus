import logging
import uuid

from app.handlers.model_handler import ModelHandler
from app.handlers.text_model_handler import TextModelHandler
from app.integrations.db_client import DBClient
from app.models.schemas import GenerationRequest, TextGenerationRequest, CategoryEnum, ModelRequest, TextCategoryEnum
from fastapi import FastAPI, UploadFile, Depends
from fastapi.responses import Response
from ray import serve
from ray.util.state import get_task
from ray.util.state import list_nodes

app = FastAPI()


@serve.deployment(num_replicas=1, route_prefix="/")
@serve.ingress(app)
class APIIngress:
    def __init__(self) -> None:
        self.logger = logging.getLogger("ray")
        self.db_client = DBClient()
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
    async def generate_text2img(
            self,
            request: GenerationRequest = Depends()
    ):
        try:
            self.logger.info(f"StableDiffusionText2Img.generate: request: {request}")
            request.task_id = str(uuid.uuid4())
            model_request = ModelRequest(**request.dict())
            handler = ModelHandler.remote(endpoint=CategoryEnum.TEXT_TO_IMAGE)
            handler.handle_generation.remote(request=model_request)
            return Response(content=model_request.task_id)
        except Exception as e:
            self.logger.error(f"Error in generate_text2img {e}")
            return Response(content=e)

    @app.post(f"/{CategoryEnum.IMAGE_TO_IMAGE}")
    async def generate_img2img(
            self,
            image: UploadFile,
            request: GenerationRequest = Depends(),
    ):
        try:
            self.logger.info(f"StableDiffusionImg2Img.generate: request: {request}")
            request.task_id = str(uuid.uuid4())
            model_request = ModelRequest(**request.dict())
            model_request.image = await image.read()
            handler = ModelHandler.remote(endpoint=CategoryEnum.IMAGE_TO_IMAGE)
            handler.handle_generation.remote(request=model_request)
            return Response(content=model_request.task_id)
        except Exception as e:
            self.logger.error(f"Error in generate_img2_img {e}")
            return Response(content=e)

    @app.post(f"/{CategoryEnum.PIX_TO_PIX}")
    async def generate_pix2pix(
            self,
            image: UploadFile,
            request: GenerationRequest = Depends(),
    ):
        try:
            self.logger.info(f"StableDiffusionPix2Pix.generate: request: {request}")
            request.task_id = str(uuid.uuid4())
            model_request = ModelRequest(**request.dict())
            model_request.image = await image.read()
            handler = ModelHandler.remote(endpoint=CategoryEnum.PIX_TO_PIX)
            handler.handle_generation.remote(request=model_request)
            return Response(content=model_request.task_id)
        except Exception as e:
            self.logger.error(f"Error in generate_pix2pix {e}")
            return Response(content=e)

    @app.post(f"/{CategoryEnum.UPSCALING}")
    async def generate_upscaling(
            self,
            image: UploadFile,
            request: GenerationRequest = Depends(),
    ):
        try:
            self.logger.info(f"StableDiffusionUpscaling.generate: request: {request}")
            request.task_id = str(uuid.uuid4())
            model_request = ModelRequest(**request.dict())
            model_request.image = await image.read()
            handler = ModelHandler.remote(endpoint=CategoryEnum.UPSCALING)
            handler.handle_generation.remote(request=model_request)
            return Response(content=model_request.task_id)
        except Exception as e:
            self.logger.error(f"Error in generate_upscaling {e}")
            return Response(content=e)

    @app.post(f"/{CategoryEnum.INPAINTING}")
    async def generate_inpainting(
            self,
            image: UploadFile,
            mask: UploadFile,
            request: GenerationRequest = Depends(),
    ):
        try:
            self.logger.info(f"StableDiffusionInpainting.generate: request: {request}")
            request.task_id = str(uuid.uuid4())
            model_request = ModelRequest(**request.dict())
            model_request.image = await image.read()
            model_request.mask = await mask.read()
            handler = ModelHandler.remote(endpoint=CategoryEnum.INPAINTING)
            handler.handle_generation.remote(request=model_request)
            return Response(content=model_request.task_id)
        except Exception as e:
            self.logger.error(f"Error in generate_inpainting {e}")
            return Response(content=e)

    @app.post(f"/{TextCategoryEnum.MAGIC_PROMPT}")
    async def generate_inpainting(
            self,
            request: TextGenerationRequest = Depends(),
    ):
        try:
            self.logger.info(f"StableDiffusionMagicPrompt.generate: request: {request}")
            request.task_id = str(uuid.uuid4())
            handler = TextModelHandler.remote(endpoint=TextCategoryEnum.MAGIC_PROMPT)
            handler.handle_generation.remote(request=request)
            return Response(content=request.task_id)
        except Exception as e:
            self.logger.error(f"Error in generate_inpainting {e}")
            return Response(content=e)

    @app.get("/task")
    async def task_status(self, task_id: str):
        task = get_task(task_id)
        return Response(content=task.state)

    @app.get("/pending-tasks")
    async def pending_tasks(self):
        self.logger.info(f"Getting pending tasks")
        pending = self.db_client.count_pending_generations()
        return pending

    @app.get("/worker-number")
    async def worker_number(self):
        self.logger.info(f"Getting number of workers")
        try:
            nodes = list_nodes(filters=[("state", "=", "ALIVE"), ("is_head_node", "=", "False")])
            num_workers = len(nodes)
            print("Getting num of workers ...")
            return num_workers
        except:
            return 1

    @app.get("/last-tasks")
    async def last_tasks(self):
        self.logger.info(f"Getting last tasks")
        try:
            tasks = self.db_client.get_last_tasks()
            return tasks
        except Exception as e:
            return Response(content=e)


deployment = APIIngress.bind()
