# Deployment instructions

Please note that these instructions are for when you want to host the microservices on a k8s cluster. For local development purposes there is a more lightweight way to run. For example, to run rick, you do `yarn nx serve rick`. (make sure you specify the environment variables in the .env file before you do this)

Our backend currently consists of 8 microservices each running with their own lean container image.

To build each of those, open Dockerfile, find the name of the stage and use them with docker build `--target`. For example to build princess we do:

```
docker build -t example.com/my/registry/princess_prod:latest . --target=princess_prod
```

Next, ensure these tagged images are pushed to a private container registry.

```
docker push example.com/my/registry/princess_prod:latest .
```

Next, [configure](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/) the k8s cluster to be able to pull from the private registry.

Open the following deployment YAML files
```
./k8s/princess/mainnet/10-princess-deployment.yaml
./k8s/rick/mainnet/30-rick-deployment.yaml
./k8s/anton/mainnet/10-anton-deployment.yaml
./k8s/bristle/mainnet/10-bristle-deployment.yaml
./k8s/fluffy/mainnet/30-fluffy-deployment.yaml
./k8s/kafo/mainnet/10-kafo-deployment.yaml
./k8s/morty/mainnet/10-morty-deployment.yaml
./k8s/gandalf/mainnet/30-gandalf-deployment.yaml
```

and change the `imagePullSecrets` in them to match the name of your private registry dockerconfig you configured in the step above. 

Also take note of the environment variables inside the deployment files and adjust them as needed.

Also go through the opaque secret references inside these files. You will need to set these k8s secrets on your cluster (not included in this repo) as needed. 

For example, the following k8s opaque secret called "rick-env-secrets" is used both by rick and kafo deployments. So we create the following YAML file and apply it on the cluster first:

```
apiVersion: v1
kind: Secret
metadata:
  name: rick-env-secrets
type: Opaque
data:
  INFURA_API_KEY: [REDACTED]
  ETHERSCAN_API_KEY: [REDACTED]
  ALCHEMY_API_KEY: [REDACTED]
  MORALIS_API_KEY: [REDACTED]
```

Once all the opaque secrets are configured in the cluster,

`kubectl apply -f` the yaml files inside `./k8s/*/mainnet/*.yaml` (please only apply the ones inside the mainnet folder for now). You can also use the below command:

```
find . -type f -path "./k8s/*/mainnet/*-deployment.yaml" -exec kubectl apply -f {} \;
```

# Notes on configuring ingress

There will be just one entrypoint (IPv4) "princess" that routes requests to the underlying services. To do that, we need to first install the nginx ingress controller in the cluster and in the case of Google Cloud, also 'promote' the external IP assigned to our ingresses to a static IP. 

- Install the nginx ingress controller in the cluster (GKE specific docs: https://kubernetes.github.io/ingress-nginx/deploy/#gce-gke)

- Assuming all other k8s resources are created in the cluster, ensure the `k8s/princess/nginx-princess-ingress.yaml` manifest is also applied.

- Get the ephemeral external IP for the ingress from `kubectl get ingress` and instruct GCP (using gcloud CLI) to promote it to a static IP by running:

```
gcloud compute addresses create princess-backend --addresses PUT_THE_EPHEMERAL_EXTERNAL_IP_ADDRESS_HERE --region europe-west1
```