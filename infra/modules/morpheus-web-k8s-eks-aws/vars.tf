variable "cluster_name_prefix" {
  default = "morpheus-cluster"
}

variable "cluster_version" {
  default = "1.24"
}

variable "cluster_ssh_key_name" {
  default = "morpheus-cluster-key"
}

variable "cluster_ssh_key_pem_name" {
  default = "morpheus-key.pem"
}

variable "self_managed_web_node_group_name" {
  default = "self-mng-web"
}

variable "self_managed_web_node_min_size" {
  default = 1
}

variable "self_managed_web_node_max_size" {
  default = 2
}

variable "self_managed_web_node_desired_size" {
  default = 1
}

variable "self_managed_web_iam_role_name" {
  default = "self-managed-node-group-web"
}

variable "self_managed_web_nodes_instance_type" {
  default = "t3.medium"
}

variable "self_managed_head_node_group_name" {
  default = "self-mng-head"
}

variable "self_managed_head_node_min_size" {
  default = 1
}

variable "self_managed_head_node_max_size" {
  default = 2
}

variable "self_managed_head_node_desired_size" {
  default = 2
}

variable "self_managed_head_iam_role_name" {
  default = "self-managed-node-group-head"
}

variable "self_managed_head_nodes_instance_type" {
  default = "t3.xlarge"
}

variable "self_managed_head_nodes_ami" {
  default = "ami-014a830d5fade0c04"
}

variable "eks_managed_service_node_group_name" {
  default = "eks-mng-services"
}

variable "eks_managed_services_iam_role_name" {
  default = "eks-managed-node-group-services"
}

variable "eks_managed_service_nodes_instance_type" {
  default = "t3.small"
}

variable "self_managed_web_nodes_ami" {
  default = "ami-014a830d5fade0c04"
}

variable "self_managed_gpu_adv_node_group_name" {
  default = "self-mng-gpu-adv"
}

variable "self_managed_gpu_adv_node_min_size" {
  default = 0
}

variable "self_managed_gpu_adv_node_max_size" {
  default = 2
}

variable "self_managed_gpu_adv_node_desired_size" {
  default = 0
}

variable "self_managed_gpu_adv_nodes_instance_type" {
  default = "g4dn.xlarge"
}

variable "self_managed_gpu_adv_nodes_ami" {
  default = "ami-0ae1369165269f8f8"
}

variable "self_managed_gpu_adv_nodes_device_name" {
  default = "/dev/sdh"
}

variable "self_managed_gpu_adv_nodes_device_size" {
  default = 20
}

variable "self_managed_gpu_adv_iam_role_name" {
  default = "self-managed-node-group-gpu-adv"
}

variable "self_managed_gpu_adv_node_warm_pool_min_size" {
  default = 2
}

variable "self_managed_gpu_adv_node_warm_pool_max_group_prepared_capacity" {
  default = 4
}

variable "vpc_name" {
  default = "morpheus-vpc"
}

variable "vpc_cidr" {
  default = "10.0.0.0/16"
}

variable "vpc_public_subnets" {
  default = ["10.0.3.0/24", "10.0.4.0/24"]
}

variable "vpc_private_subnets" {
  default = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "db_name" {
  default = "morpheus"
}

variable "db_identifier" {
  default = "morpheus"
}

variable "db_instance_class" {
  default = "db.t3.micro"
}

variable "db_allocated_storage" {
  default = 5
}

variable "db_engine" {
  default = "postgres"
}

variable "db_engine_version" {
  default = "14.5"
}

variable "db_password_secret_manager_name" {
  default = "morpheus"
}

variable "s3_results_bucket_name" {
  default = "morpheus-results"
}

variable "s3_models_bucket_name" {
  default = "morpheus-models-sd"
}

variable "s3_deployment_bucket_name" {
  default = "morpheus-deployment"
}

variable "ingress_body_size" {
  default = "5m"
}

variable "env" {
  default = "dev"
}

variable "client_hostname" { 
  default = "morpheus-client.com"
}

variable "api_hostname" {
  default = "morpheus-api.com"
}

variable "scale_up_adv_queue_threshold" {
  default = "4"
}

variable "scale_up_adv_period" {
  default = "10"
}

variable "scale_up_adv_evaluation_period" {
  default = "2"
}

variable "scale_up_adv_scaling_adjustment" {
  default = 2
}

variable "scale_up_adv_cooldown" {
  default = "120"
}

variable "scale_down_adv_queue_threshold" {
  default = "4"
}

variable "scale_down_adv_period" {
  default = "60"
}

variable "scale_down_adv_evaluation_period" {
  default = "60"
}

variable "scale_down_adv_scaling_adjustment" {
  default = -1
}

variable "create_aws_auth_configmap" {
  default = true
}

variable "manage_aws_auth_configmap" {
  default = true
}
