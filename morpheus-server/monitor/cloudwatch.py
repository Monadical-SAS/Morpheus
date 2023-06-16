import os
import sys
import time

import boto3
import redis

currentdir = os.path.dirname(os.path.realpath(__file__))
parentdir = os.path.dirname(currentdir)
sys.path.append(parentdir)

CLOUDWATCH_REGION = os.getenv("CLOUDWATCH_REGION", "us-east-1")
CLOUDWATCH_NAMESPACE = os.getenv("CLOUDWATCH_NAMESPACE", "morpheus")
BROKER_REDIS_HOST = os.getenv("BROKER_REDIS_HOST", "redis")
BROKER_REDIS_PORT = os.getenv("BROKER_REDIS_PORT", "6379")
BROKER_REDIS_QUEUE = os.getenv("BROKER_REDIS_QUEUE", "stable_diffusion")
DIFFUSION_WORKER_NAME = os.getenv("DIFFUSION_WORKER_NAME", "morpheus-worker-diffusion")


def cloudwatch_metric():
    from app.celery.workers.stable_diffusion_app import app

    pending_tasks_count = 0

    redis_client = redis.Redis(host=BROKER_REDIS_HOST, port=int(BROKER_REDIS_PORT))
    pending_tasks_count = redis_client.llen(BROKER_REDIS_QUEUE)

    num_workers = 0
    count_workers_in_scheduled = False

    try:
        workers = app.control.inspect().reserved().keys()
        if workers is not None:
            for worker in workers:
                if DIFFUSION_WORKER_NAME in worker:
                    print("Inspecting reserved in:" + worker)
                    tasks = app.control.inspect().reserved()[worker]
                    pending_tasks_count += len(tasks)
                    num_workers += 1
        else:
            print("Reserved is None ...")
            count_workers_in_scheduled = True
    except Exception as e:
        print("Exception in reserved:" + str(e))

    try:
        workers = app.control.inspect().scheduled().keys()
        if workers is not None:
            for worker in workers:
                if DIFFUSION_WORKER_NAME in worker:
                    print("Inspecting scheduled in:" + worker)
                    tasks = app.control.inspect().scheduled()[worker]
                    pending_tasks_count += len(tasks)
                    if count_workers_in_scheduled:
                        num_workers += 1
        else:
            print("Scheduled is None ...")
    except Exception as e:
        print("Exception in scheduled:" + str(e))
    
    if num_workers != 0:
        metric = pending_tasks_count / num_workers
        cloudwatch = boto3.client("cloudwatch", region_name=CLOUDWATCH_REGION)
        cloudwatch.put_metric_data(
            Namespace=CLOUDWATCH_NAMESPACE,
            MetricData=[{"MetricName": "avg-queue-size", "Timestamp": time.time(), "Value": metric, "Unit": "Count"}],
        )
        return True
    return False

while True:
    try:
        result = cloudwatch_metric()
        if result:
            print("Metric was sent to cloudwatch correctly")
        else:
            print("Metric wasn't sent to cloudwatch correctly")
    except Exception as e:
        print("Error sending the metric:" + str(e))
    time.sleep(30)
