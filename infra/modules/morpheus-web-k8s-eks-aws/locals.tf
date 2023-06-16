locals {
  cluster_name                   = "${var.cluster_name_prefix}-${random_integer.suffix.result}"
  cluster_version                = var.cluster_version
  db_identifier                  = "${var.db_identifier}-${random_integer.suffix.result}"
  db_subnet_group_name           = "morpheus-subnet-group-${random_integer.suffix.result}"
  db_security_group_name         = "morpheus-db-security-group-${random_integer.suffix.result}"
  vpc_name                       = "${var.vpc_name}-${random_integer.suffix.result}"
  self_managed_web_iam_role_name = "${var.self_managed_web_iam_role_name}-${random_integer.suffix.result}"
  self_managed_gpu_iam_role_name = "${var.self_managed_gpu_iam_role_name}-${random_integer.suffix.result}"
  s3_deployment_bucket_name      = "${var.s3_deployment_bucket_name}-${var.env}-${random_integer.suffix.result}"
  s3_models_bucket_name          = "${var.s3_models_bucket_name}-${var.env}-${random_integer.suffix.result}"
  s3_results_bucket_name         = "${var.s3_results_bucket_name}-${var.env}-${random_integer.suffix.result}"
  cluster_ssh_key                = "${var.cluster_ssh_key_name}-${random_integer.suffix.result}"
  cloudwatch_namespace_name      = "morpheus-${random_integer.suffix.result}"
  scale_up_policy_name            = "morpheus-scale-up-policy-${random_integer.suffix.result}"
  scale_down_policy_name          = "morpheus-scale-down-policy-${random_integer.suffix.result}"
  scale_up_alarm_name            = "morpheus-scale-up-alarm-${random_integer.suffix.result}"
  scale_down_alarm_name          = "morpheus-scale-down-alarm-${random_integer.suffix.result}"
  db_creds = jsondecode(
    data.aws_secretsmanager_secret_version.creds.secret_string
  )
}
