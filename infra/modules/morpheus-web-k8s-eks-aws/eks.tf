module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "18.26.6"

  tags = {
    env = var.env
  }

  cluster_name    = local.cluster_name
  cluster_version = local.cluster_version

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  create_aws_auth_configmap = true
  manage_aws_auth_configmap = true

  node_security_group_additional_rules = {
    ingress_bastion = {
      description     = "Ingress"
      protocol        = "-1"
      from_port       = 22
      to_port         = 22
      type            = "ingress"
      security_groups = [aws_security_group.bastion.id]
    }
    ingress_postgres = {
      description      = "Ingress"
      protocol         = "-1"
      from_port        = 5432
      to_port          = 5432
      type             = "ingress"
      cidr_blocks      = ["0.0.0.0/0"]
      ipv6_cidr_blocks = ["::/0"]
    }
    egress_all = {
      description      = "Node all egress"
      protocol         = "-1"
      from_port        = 0
      to_port          = 0
      type             = "egress"
      cidr_blocks      = ["0.0.0.0/0"]
      ipv6_cidr_blocks = ["::/0"]
    }
  }

  eks_managed_node_groups = {

    eks-managed-services = {
      name            = "eks-mng-services"
      use_name_prefix = true

      subnet_ids = module.vpc.private_subnets

      min_size     = 1
      max_size     = 2
      desired_size = 1

      force_update_version = true
      instance_types       = [var.self_managed_service_nodes_instance_type]

      metadata_options = {
        http_endpoint               = "enabled"
        http_tokens                 = "required"
        http_put_response_hop_limit = 2
        instance_metadata_tags      = "disabled"
      }

      create_iam_role          = true
      iam_role_name            = "eks-managed-node-group-services"
      iam_role_use_name_prefix = false
      iam_role_description     = "EKS managed node group services"
      labels = {
        morpheus-type = "svc"
      }
    }
  }

  self_managed_node_groups = {
    self-managed-web = {
      name            = var.self_managed_web_node_group_name
      use_name_prefix = true

      key_name = aws_key_pair.cluster_key.key_name

      bootstrap_extra_args = "--kubelet-extra-args '--node-labels=morpheus-type=web'"

      subnet_ids = module.vpc.private_subnets

      min_size     = var.self_managed_web_node_min_size
      max_size     = var.self_managed_web_node_max_size
      desired_size = var.self_managed_web_node_desired_size
      ami_id       = var.self_managed_web_nodes_ami

      force_update_version = true
      instance_type        = var.self_managed_web_nodes_instance_type

      metadata_options = {
        http_endpoint               = "enabled"
        http_tokens                 = "required"
        http_put_response_hop_limit = 2
        instance_metadata_tags      = "disabled"
      }

      create_iam_role          = true
      iam_role_name            = local.self_managed_web_iam_role_name
      iam_role_use_name_prefix = false
      iam_role_description     = "Self managed node group web"
      iam_role_additional_policies = [
        "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess",
        "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
      ]
      labels = {
        morpheus-type = "web"
      }
    }

    self-managed-gpu = {
      name            = var.self_managed_gpu_node_group_name
      use_name_prefix = true

      key_name = aws_key_pair.cluster_key.key_name

      bootstrap_extra_args = "--kubelet-extra-args '--node-labels=morpheus-type=gpu'"

      post_bootstrap_user_data = <<-EOT
        MODEL_DISK="sdh"
        MOUNT_POINT="/opt/data"
        DEPLOYMENT_BUCKET="${local.s3_deployment_bucket_name}"
        CLOUDWATCH_ETC_FOLDER="/etc/morpheus"
        CLOUDWATCH_ETC_FILENAME="morpheus-cloudwatch-agent-config.json"
        mkdir "$MOUNT_POINT"
        DEV_DIR=$(ls /dev)
        mkfs -t xfs "/dev/$MODEL_DISK"
        DISK_UUID=$(blkid "/dev/$MODEL_DISK" -s UUID -o value)
        echo "UUID=$DISK_UUID  $MOUNT_POINT  xfs  defaults,nofail  0  2" >> /etc/fstab
        mount "$MOUNT_POINT"
        aws s3 cp s3://$DEPLOYMENT_BUCKET/deploy-models.sh /bin/
        chmod +x /bin/deploy-models.sh
        sudo deploy-models.sh
        echo "PATH=/usr/bin:/bin:/usr/local/bin" > /etc/cron.d/morpheus
        echo "0 * * * * root deploy-models.sh" >> /etc/cron.d/morpheus
        mkdir -p "$CLOUDWATCH_ETC_FOLDER"
        aws s3 cp s3://$DEPLOYMENT_BUCKET/$CLOUDWATCH_ETC_FILENAME "$CLOUDWATCH_ETC_FOLDER"
        sudo yum install -y amazon-cloudwatch-agent
        ./opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:$CLOUDWATCH_ETC_FOLDER/$CLOUDWATCH_ETC_FILENAME
      EOT

      block_device_mappings = {
        xvda = {
          device_name = var.self_managed_gpu_nodes_device_name
          ebs = {
            volume_size           = var.self_managed_gpu_nodes_device_size
            volume_type           = "gp3"
            iops                  = 3000
            delete_on_termination = true
          }
        }
      }

      subnet_ids = module.vpc.private_subnets

      min_size     = var.self_managed_gpu_node_min_size
      max_size     = var.self_managed_gpu_node_max_size
      desired_size = var.self_managed_gpu_node_desired_size
      ami_id       = var.self_managed_gpu_nodes_ami

      instance_type = var.self_managed_gpu_nodes_instance_type

      metadata_options = {
        http_endpoint               = "enabled"
        http_tokens                 = "required"
        http_put_response_hop_limit = 2
        instance_metadata_tags      = "disabled"
      }

      create_iam_role          = true
      iam_role_name            = local.self_managed_gpu_iam_role_name
      iam_role_use_name_prefix = false
      iam_role_description     = "Self managed node group gpu"
      iam_role_additional_policies = [
        "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess",
        "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
      ]
    }
  }
}

resource "aws_cloudwatch_metric_alarm" "scale_up" {
  alarm_description   = "Queue size alarm to scale up"
  alarm_actions       = [aws_autoscaling_policy.scale_up.arn]
  alarm_name          = local.scale_up_alarm_name
  comparison_operator = "GreaterThanOrEqualToThreshold"
  namespace           = local.cloudwatch_namespace_name
  metric_name         = "avg-queue-size"
  threshold           = var.scale_up_queue_threshold
  evaluation_periods  = var.scale_up_evaluation_period
  period              = var.scale_up_period
  statistic           = "Average"
}

resource "aws_autoscaling_policy" "scale_up" {
  autoscaling_group_name = module.eks.self_managed_node_groups["self-managed-gpu"]["autoscaling_group_name"]
  name                   = local.scale_up_policy_name
  policy_type            = "SimpleScaling"
  adjustment_type        = "ChangeInCapacity"
  cooldown               = var.scale_up_cooldown
  scaling_adjustment     = var.scale_up_scaling_adjustment
}

resource "aws_cloudwatch_metric_alarm" "scale_down" {
  alarm_description   = "Queue size alarm to scale down"
  alarm_actions       = [aws_autoscaling_policy.scale_down.arn]
  alarm_name          = local.scale_down_alarm_name
  comparison_operator = "LessThanThreshold"
  namespace           = local.cloudwatch_namespace_name
  metric_name         = "avg-queue-size"
  threshold           = var.scale_down_queue_threshold
  evaluation_periods  = var.scale_down_evaluation_period
  period              = var.scale_down_period
  statistic           = "Average"
}

resource "aws_autoscaling_policy" "scale_down" {
  autoscaling_group_name = module.eks.self_managed_node_groups["self-managed-gpu"]["autoscaling_group_name"]
  name                   = local.scale_down_policy_name
  policy_type            = "SimpleScaling"
  adjustment_type        = "ChangeInCapacity"
  scaling_adjustment     = var.scale_down_scaling_adjustment
}

resource "aws_security_group" "bastion" {
  name   = "bastion-sg"
  vpc_id = module.vpc.vpc_id

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
  }

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
  }
}
