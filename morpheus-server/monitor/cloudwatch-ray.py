import os
import sys
import time

import boto3
import requests

currentdir = os.path.dirname(os.path.realpath(__file__))
parentdir = os.path.dirname(currentdir)
sys.path.append(parentdir)

CLOUDWATCH_REGION = os.getenv("CLOUDWATCH_REGION", "us-east-1")
CLOUDWATCH_NAMESPACE = os.getenv("CLOUDWATCH_NAMESPACE", "morpheus")
RAY_ENDPOINT = os.getenv("RAY_SERVICE_ENDPOINT", "ray-service")
PENDING_TASKS_RESOURCE = os.getenv("PENDING_TASKS_RESOURCE", "pending-tasks")
NUMBER_OF_WORKERS_RESOURCE = os.getenv("NUMBER_OF_WORKERS", "worker-number")


def cloudwatch_metric():

    pending_tasks_count = 0

    num_workers = 0

    try:
        response_worker_number = requests.get(f"{RAY_ENDPOINT}/{NUMBER_OF_WORKERS_RESOURCE}")
        if response_worker_number.status_code == 200:
            # Access the content of the response
            data = response_worker_number.text  # This will give you the response content as a string
            num_workers = int(data)
    except Exception as e:
        print("Exception in worker number:" + str(e))

    try:
        response_pending_tasks = requests.get(f"{RAY_ENDPOINT}/{PENDING_TASKS_RESOURCE}")
        if response_pending_tasks.status_code == 200:
            # Access the content of the response
            data = response_pending_tasks.text  # This will give you the response content as a string
            pending_tasks_count = int(data)
    except Exception as e:
        print("Exception in pending tasks:" + str(e))

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
    time.sleep(15)
