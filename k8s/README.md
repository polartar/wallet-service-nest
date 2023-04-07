# Notes on configuring ingress

There will be just one entrypoint (IPv4) "princess" that routes requests to the underlying mainnet/testnet services based on the presence of a header. To do that, we need to first install the nginx ingress controller in the cluster and in the case of Google Cloud, also 'promote' the external IP assigned to our ingresses to a static IP. 

- Install the nginx ingress controller in the cluster (GKE specific docs: https://kubernetes.github.io/ingress-nginx/deploy/#gce-gke)

- Assuming all other k8s resources are created in the cluster, ensure the `k8s/princess/nginx-princess-ingress.yaml` manifest is also applied.

- Get the ephemeral external IP for the ingress from `kubectl get ingress` and instruct GCP (using gcloud CLI) to promote it to a static IP by running:

```
gcloud compute addresses create princess-backend --addresses THE_IP_ADDRESS --region europe-west1
```