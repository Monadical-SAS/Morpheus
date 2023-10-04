from celery import Celery
from kombu import Exchange, Queue

from app.config import get_settings

settings = get_settings()

# define queue names
default_queue_name = settings.celery_default_queue
default_exchange_name = settings.celery_default_queue
default_routing_key = settings.celery_default_queue

magicprompt_queue_name = settings.celery_magic_prompt_queue
magicprompt_exchange_name = settings.celery_magic_prompt_queue
magicprompt_routing_key = settings.celery_magic_prompt_queue

# get all task modules
task_modules = ["app.celery.tasks.magic_prompt"]

app = Celery(__name__)
app.conf.broker_url = settings.celery_broker_url
app.conf.result_backend = settings.celery_result_backend

# define exchanges
default_exchange = Exchange(default_exchange_name, type="direct")
magicprompt_exchange = Exchange(magicprompt_exchange_name, type="direct")

# define queues
default_queue = Queue(default_queue_name, default_exchange_name, routing_key=default_routing_key)

magicprompt_queue = Queue(
    magicprompt_queue_name,
    magicprompt_exchange,
    routing_key=magicprompt_routing_key,
)

# set the task queues
app.conf.task_queues = (default_queue, magicprompt_queue)

# set the task routes
app.conf.task_routes = {
    "app.celery.tasks.magic_prompt.*": {"queue": magicprompt_queue_name},
}

app.conf.task_default_queue = default_queue_name
app.conf.task_default_exchange = default_exchange
app.conf.task_default_routing_key = default_routing_key

app.conf.task_serializer = "pickle"
app.conf.result_serializer = "pickle"
app.conf.accept_content = ["application/json", "application/x-python-serialize"]
app.autodiscover_tasks(task_modules)
