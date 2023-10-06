from celery import Celery, current_app
from celery.exceptions import NotRegistered
from kombu import Exchange, Queue

from app.config import get_settings

settings = get_settings()

# define queue names
default_queue_name = settings.celery_default_queue
default_exchange_name = settings.celery_default_queue
default_routing_key = settings.celery_default_queue

stable_diffusion_queue_name = settings.celery_stable_diffusion_queue
stable_diffusion_exchange_name = settings.celery_stable_diffusion_queue
stable_diffusion_routing_key = settings.celery_stable_diffusion_queue

magicprompt_queue_name = settings.celery_magic_prompt_queue
magicprompt_exchange_name = settings.celery_magic_prompt_queue
magicprompt_routing_key = settings.celery_magic_prompt_queue
worker_prefetch_multiplier = settings.celery_worker_prefetch_multiplier

# get all task modules
task_modules = ["app.celery.tasks.stable_diffusion"]

app = Celery(__name__)
app.conf.broker_url = settings.celery_broker_url
app.conf.result_backend = settings.celery_result_backend

# define exchanges
default_exchange = Exchange(default_exchange_name, type="direct")
stable_diffusion_exchange = Exchange(stable_diffusion_exchange_name, type="direct")

# define queues
default_queue = Queue(default_queue_name, default_exchange_name, routing_key=default_routing_key)

stable_diffusion_queue = Queue(
    stable_diffusion_queue_name,
    stable_diffusion_exchange,
    routing_key=stable_diffusion_routing_key,
)

magicprompt_queue = Queue(
    magicprompt_queue_name,
    magicprompt_exchange_name,
    routing_key=magicprompt_routing_key,
)

# set the task queues
app.conf.task_queues = (default_queue, stable_diffusion_queue, magicprompt_queue)

# set the task routes
app.conf.task_routes = {
    "app.celery.tasks.stable_diffusion.*": {"queue": stable_diffusion_queue_name},
    "app.celery.tasks.magic_prompt.*": {"queue": magicprompt_queue_name},
}

app.conf.task_default_queue = default_queue_name
app.conf.task_default_exchange = default_exchange_name
app.conf.task_default_routing_key = default_routing_key

app.conf.task_serializer = "pickle"
app.conf.result_serializer = "pickle"
app.conf.accept_content = ["application/json", "application/x-python-serialize"]
app.autodiscover_tasks(task_modules)

app.conf.worker_prefetch_multiplier = worker_prefetch_multiplier


# Check if there are active workers reading from the desired queue
def is_queue_active(queue_name, task_name):
    inspector = current_app.control.inspect()
    print(f"SD {app.tasks.keys()=} {inspector=}")

    try:
        registered_task_names = app.tasks.keys()
        active_workers = inspector.active_queues().values()
        for worker_queues in active_workers:
            for queue in worker_queues:
                if queue["name"] == queue_name and task_name in registered_task_names:
                    return True
    except NotRegistered:
        return False

    return False
