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

variable "self_managed_gpu_nodes_device_size" {
}

variable "self_managed_gpu_nodes_instance_type" {
  default = "g4dn.xlarge"
}

variable "self_managed_gpu_node_min_size" {
  default = 1
}

variable "self_managed_gpu_node_max_size" {
  default = 3
}

variable "self_managed_gpu_node_desired_size" {
  default = 1
}

variable "scale_up_queue_threshold" {
  default = "4"
}

variable "scale_up_period" {
  default = "30"
}

variable "scale_up_evaluation_period" {
  default = "2"
}

variable "scale_up_scaling_adjustment" {
  default = 2
}

variable "scale_down_queue_threshold" {
  default = "4"
}

variable "scale_down_period" {
  default = "60"
}

variable "scale_down_evaluation_period" {
  default = "60"
}

variable "scale_down_scaling_adjustment" {
  default = -1
}

variable "api_hostname" {
}

variable "client_hostname" {
}
