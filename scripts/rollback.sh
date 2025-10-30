#!/usr/bin/env bash

SERVICE=$1  # image-service, catalogue-service, stats-service, or frontend

if [ -z "$SERVICE" ]; then
    echo "Usage: ./scripts/rollback.sh <service-name>"
    exit 1
fi

set -e

echo "Rollback init @ $SERVICE..."

echo "Rollout history:"
kubectl rollout history deployment/$SERVICE

echo "Rolling back to previous version..."
kubectl rollout undo deployment/$SERVICE

echo "Watching rollback status..."
kubectl rollout status deployment/$SERVICE

echo ""
echo "Rollback Complete."
echo ""
echo "Pods:"
kubectl get pods -l app=$SERVICE