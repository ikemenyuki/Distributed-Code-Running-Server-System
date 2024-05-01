# Deploy Distributed Code Running Server System in Production



## Set up

1. Create a new project in GCP
2. Enable Compute VM, Kubernetes, Filestore, Memorystore APIs



## Create Instances

1. Create a Filestore Instance

2. Create a Memorystore Instance

3. Create a Kubernetes cluster with Filestore CSI

   ```cloud shell
   gcloud container clusters create CLUSTER_NAME \
       --addons=GcpFilestoreCsiDriver \
       --cluster-version=1.2.1
   ```



## Mount Filestore to Cluster

Clone this repo in GCP cloud shell, and execute below command. Make sure you edit the csi configurations and storage capacity in the 2 .yaml files.

```cloud shell
cd infra
gcloud container clusters get-credentials $cluster-name --location=$region
kubectl apply -f filestore-pv.yaml
kubectl apply -f filestore-pvc.yaml
```



## Deploy Services

### Allocate Static IP

First, allocate 4 static IP address for the load balancer of frontend, middleware, llm-agent and scheduler.

```cloud shell
  gcloud compute addresses create frontend/middleware/llm/scheduler \
      --global \
      --ip-version IPV4
  gcloud compute addresses describe frontend/middleware/llm/scheduler
```

Then, modify the `loadBalancerIP` field in all 4 service.yaml to reflect above.

### Deploy Frontend

```cloud shell
cd infra
gcloud container clusters get-credentials $cluster-name --location=$region
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml
```

### Deploy Middleware

```cloud shell
cd infra
gcloud container clusters get-credentials $cluster-name --location=$region
kubectl apply -f middleware-deployment.yaml
kubectl apply -f middleware-service.yaml
```

### Deploy LLM Agent

```cloud shell
cd infra
gcloud container clusters get-credentials $cluster-name --location=$region
kubectl apply -f llm-deployment.yaml
kubectl apply -f llm-service.yaml
```

### Deploy Scheduler

First, change the `REDIS_HOSTNAME` field in `scheduler/config.py` to reflect your actual Memorystore Instance.

Then, execute below command.

```cloud shell
cd infra
gcloud container clusters get-credentials $cluster-name --location=$region
kubectl apply -f scheduler-service-account.yaml
kubectl apply -f scheduler-role.yaml
kubectl apply -f scheduler-role-binding.yaml
kubectl apply -f scheduler-deployment.yaml
kubectl apply -f scheduler-service.yaml
```



