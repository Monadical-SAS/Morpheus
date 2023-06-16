module "morpheus_eks_charts" {
  source = "../../modules/morpheus-eks-charts"
  kubeconfig_path = var.kubeconfig_path
  ingress_client_host = var.ingress_client_host
  ingress_api_host = var.ingress_api_host
  ingress_tls_secret_name = var.ingress_tls_secret_name
}
