#!/usr/bin/env bash

PROJECT_ID="infs3208-475305"
CLUSTER_NAME="uploadz-cluster"
ZONE="us-east1"

set -e

echo "Begining teardown..."

gcloud container clusters delete $CLUSTER_NAME \
    --zone $ZONE \
    --project $PROJECT_ID \
    --quiet

echo "Teardown Complete."