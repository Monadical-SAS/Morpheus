# Enabling the k8s dashboard

```bash
# Apply this manifest
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml

# Apply this manifest
kubectl apply -f ./infra/tools/k8s/user-dashboard.yaml

# Execute this k8s command
kubectl proxy

# Generate the dashboard token
kubectl -n kubernetes-dashboard create token admin-user

# Copy the generated token in this form:
http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/
```
