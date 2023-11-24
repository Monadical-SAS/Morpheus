variable "env" {
  default     = "staging"
}

variable "region" {
}

variable "AWS_ACCESS_KEY" {
}

variable "AWS_SECRET_KEY" {
}

variable "ACCOUNT_ID" {
}

variable "db_password_secret_manager_name" {
}

variable "db_allocated_storage" {
}

variable "vpc_cidr" {
}

variable "vpc_public_subnets" {
}

variable "vpc_private_subnets" {
}

variable "eks_managed_service_node_group_name" {
  default = "eks-mng-services"
}

variable "eks_managed_services_iam_role_name" {
  default = "eks-managed-node-group-services"
}

variable "self_managed_web_node_group_name" {
  default = "self-mng-web"
}

variable "self_managed_web_iam_role_name" {
  default = "self-managed-node-group-web"
}

variable "self_managed_gpu_adv_nodes_device_size" {
}

variable "self_managed_gpu_adv_nodes_instance_type" {
  default = "g4dn.xlarge"
}

variable "self_managed_gpu_adv_node_min_size" {
  default = 0
}

variable "self_managed_gpu_adv_node_max_size" {
  default = 2
}

variable "self_managed_gpu_adv_node_desired_size" {
  default = 1
}

variable "self_managed_gpu_adv_iam_role_name" {
  default = "self-managed-node-group-gpu-adv"
}

variable "self_managed_gpu_adv_node_group_name" {
  default = "self-mng-gpu-adv"
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

variable "api_hostname" {
}

variable "client_hostname" {
}

variable "create_aws_auth_configmap" {
  default = true
}

variable "manage_aws_auth_configmap" {
  default = true
}

variable "self_managed_gpu_adv_node_warm_pool_min_size" {
  default = 2
}

variable "self_managed_gpu_adv_node_warm_pool_max_group_prepared_capacity" {
  default = 4
}

variable "scale_up_adv_queue_threshold" {
  default = "4"
}

variable "scale_up_adv_period" {
  default = "30"
}

variable "scale_up_adv_evaluation_period" {
  default = "2"
}

variable "scale_up_adv_scaling_adjustment" {
  default = 2
}

variable "scale_down_adv_queue_threshold" {
  default = "4"
}

variable "scale_down_adv_period" {
  default = "60"
}

variable "scale_down_adv_scaling_adjustment" {
  default = -1
}

variable "scale_down_adv_evaluation_period" {
  default = "60"
}
