provider "aws" {
  region = var.region
}

provider "helm" {
  kubernetes {
    config_path = var.kubeconfig_path
  }
}
