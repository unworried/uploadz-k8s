#!/usr/bin/env bash

PROJECT_ID="infs3208-475305"
SERVICE=$1  # image-service, catalogue-service, stats-service, or frontend
NEW_VERSION=$2

if [ -z "$SERVICE" ] || [ -z "$NEW_VERSION" ]; then
    echo "Usage: ./scripts/rolling-update.sh <service-name> <version>"
    exit 1
fi

set -e

echo "Rollout for $SERVICE, updating to $NEW_VERSION..."

echo "Building $SERVICE:$NEW_VERSION..."
docker build -t gcr.io/$PROJECT_ID/$SERVICE:$NEW_VERSION ./$SERVICE

echo "Pushing $SERVICE:$NEW_VERSION..."
docker push gcr.io/$PROJECT_ID/$SERVICE:$NEW_VERSION

echo "Updating k8s deployment..."
kubectl set image deployment/$SERVICE \
    $SERVICE=gcr.io/$PROJECT_ID/$SERVICE:$NEW_VERSION

echo "Watching rollout status..."
kubectl rollout status deployment/$SERVICE

echo ""
echo "Rollout Complete."
echo ""
echo "Pods:"
kubectl get pods -l app=$SERVICE