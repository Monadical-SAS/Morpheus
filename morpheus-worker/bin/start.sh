#!/bin/bash
set -e

# Start Ray head node. Does not block — returns once the cluster is ready.
ray start --head --num-gpus 1 --resources="{\"WorkerCpu\": 1}" --dashboard-host 0.0.0.0

# Deploy the Ray Serve application and block until the container is stopped.
# serve run connects to the already-running cluster, deploys the app from
# models.yaml, and keeps the process alive (no separate deployer needed).
cd /opt && serve run /opt/models.yaml
