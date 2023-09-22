#!/bin/bash
ray start --head --num-gpus 1 --resources="{\"WorkerCpu\": 1}" --dashboard-host 0.0.0.0 --block
