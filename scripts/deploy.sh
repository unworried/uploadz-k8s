#!/usr/bin/env bash

PROJECT_ID="infs3208-475305"
CLUSTER_NAME="uploadz-cluster"
ZONE="us-east1"

NUM_NODES=2
MACHINE_TYPE="e2-small"
DISK_SIZE=30

# set -e

echo "Deploying..."

echo "Creating GKE cluster"
gcloud container clusters create $CLUSTER_NAME \
    --zone $ZONE \
    --num-nodes $NUM_NODES \
    --machine-type $MACHINE_TYPE \
    --disk-size $DISK_SIZE \
    --no-enable-autoupgrade \
    --no-enable-autorepair \
    --preemptible \
    --project $PROJECT_ID

echo "Gathering credentials..."
gcloud container clusters get-credentials uploadz-cluster --zone $ZONE --project $PROJECT_ID

echo "Building docker images..."
docker build -t gcr.io/$PROJECT_ID/image-service:v1 ./image-service
docker build -t gcr.io/$PROJECT_ID/catalogue-service:v1 ./catalogue-service
docker build -t gcr.io/$PROJECT_ID/stats-service:v1 ./stats-service
docker build -t gcr.io/$PROJECT_ID/frontend:v1 ./frontend

echo "Pushing docker images..."
docker push gcr.io/$PROJECT_ID/image-service:v1
docker push gcr.io/$PROJECT_ID/catalogue-service:v1
docker push gcr.io/$PROJECT_ID/stats-service:v1
docker push gcr.io/$PROJECT_ID/frontend:v1

echo "Deploying to k8s..."
kubectl apply -f k8s/postgres.yaml
sleep 30
kubectl apply -f k8s/image-service.yaml
kubectl apply -f k8s/catalogue-service.yaml
kubectl apply -f k8s/stats-service.yaml
kubectl apply -f k8s/frontend.yaml

echo "Waiting on pod startup..."
kubectl wait --for=condition=ready pod --all --timeout=300s || echo "Pods taking longer then expected..."

echo ""
echo "Deployment Complete."
echo ""
echo "Pods:"
kubectl get pods
echo ""
echo "Services:"
kubectl get services
echo ""
echo "External IP:"
kubectl get service frontend
