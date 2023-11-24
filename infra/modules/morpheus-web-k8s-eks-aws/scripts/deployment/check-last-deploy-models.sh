#!/bin/bash

file_path="/opt/last-deploy.txt"

# Get the current timestamp and calculate the timestamp for 15 minutes ago
current_timestamp=$(date +%s)
minutes_ago=$((current_timestamp - 1020))

# Get the timestamp from the file (assuming it's stored as a Unix timestamp)
file_timestamp=$(cat "$file_path")

# Compare timestamps
if [ "$file_timestamp" -lt "$minutes_ago" ]; then
    echo "Last model sync out of range. Syncing"
    deploy-models.sh   
fi
