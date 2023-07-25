import ray
import uuid
import time
from fastapi import FastAPI
from fastapi.responses import Response
from ray import serve


app = FastAPI()

@ray.remote
def image(prompt, task_uuid):
    task_id = ray.get_runtime_context().get_task_id()
    print(f"task: {task_id}")
    print(f"Morpheus task: {task_uuid}")
    print(f"Generating image: {prompt}")
    time.sleep(60)
  

@serve.deployment(num_replicas=1, route_prefix="/")
@serve.ingress(app)
class APIIngress:
    def __init__(self) -> None:
        print("Initializing")

    @app.get(
        "/imagine"
    )
    async def generate(self, prompt: str, img_size: int = 512):
        assert len(prompt), "prompt parameter cannot be empty"
        task_uuid = str(uuid.uuid4())
        task = image.remote(prompt, task_uuid)
        print(str(task))
        return Response(content=task_uuid)


deployment = APIIngress.bind()