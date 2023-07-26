import ray
import uuid
import time
from fastapi import FastAPI
from fastapi.responses import Response
from ray.util.state import get_task
from ray.util.state import summarize_tasks
from ray import serve


app = FastAPI()

@ray.remote(num_gpus=1)
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
        self.task_types = [
            "PENDING_OBJ_STORE_MEM_AVAIL",
            "PENDING_NODE_ASSIGNMENT",
            "SUBMITTED_TO_WORKER",
            "PENDING_ARGS_FETCH",
            "SUBMITTED_TO_WORKER"
        ]

    @app.get("/imagine")
    async def generate(self, prompt: str, img_size: int = 512):
        assert len(prompt), "prompt parameter cannot be empty"
        task_uuid = str(uuid.uuid4())
        task = image.remote(prompt, task_uuid)
        print(str(task))
        return Response(content=task_uuid)
    
    # https://docs.ray.io/en/latest/ray-observability/user-guides/cli-sdk.html#state-api-overview-ref
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