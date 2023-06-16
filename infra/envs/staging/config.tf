provider "aws" {
  region = var.region
}

terraform {
  backend "s3" {}
}
