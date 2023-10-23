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

  create_aws_auth_configmap = var.create_aws_auth_configmap
  manage_aws_auth_configmap = var.manage_aws_auth_configmap

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

  self_managed_node_groups = {
    self-managed-web = {
      name            = var.self_managed_web_node_group_name
      use_name_prefix = true

      key_name = aws_key_pair.cluster_key.key_name

      bootstrap_extra_args = "--kubelet-extra-args '--node-labels=morpheus-type=web' --container-runtime 'containerd'"

      # Uncomment to enable web node logs in cloudwatch
      # post_bootstrap_user_data = <<-EOT
      #  DEPLOYMENT_BUCKET="${local.s3_deployment_bucket_name}"
      #  CLOUDWATCH_ETC_FOLDER="/etc/morpheus"
      #  CLOUDWATCH_ETC_FILENAME="morpheus-cloudwatch-web-agent-config.json"
      #  mkdir -p "$CLOUDWATCH_ETC_FOLDER"
      #  aws s3 cp s3://$DEPLOYMENT_BUCKET/$CLOUDWATCH_ETC_FILENAME "$CLOUDWATCH_ETC_FOLDER"
      #  sudo yum install -y amazon-cloudwatch-agent
      #  ./opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:$CLOUDWATCH_ETC_FOLDER/$CLOUDWATCH_ETC_FILENAME
      # EOT

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

    self-managed-head = {
      name            = var.self_managed_head_node_group_name
      use_name_prefix = true

      key_name = aws_key_pair.cluster_key.key_name

      bootstrap_extra_args = "--kubelet-extra-args '--node-labels=morpheus-type=worker-head' --container-runtime 'containerd'"

      subnet_ids = module.vpc.private_subnets

      min_size     = var.self_managed_head_node_min_size
      max_size     = var.self_managed_head_node_max_size
      desired_size = var.self_managed_head_node_desired_size
      ami_id       = var.self_managed_head_nodes_ami

      force_update_version = true
      instance_type        = var.self_managed_head_nodes_instance_type

      metadata_options = {
        http_endpoint               = "enabled"
        http_tokens                 = "required"
        http_put_response_hop_limit = 2
        instance_metadata_tags      = "disabled"
      }

      create_iam_role          = true
      iam_role_name            = local.self_managed_head_iam_role_name
      iam_role_use_name_prefix = false
      iam_role_description     = "Self managed node group head"
      iam_role_additional_policies = [
        "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess",
        "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
      ]
      labels = {
        morpheus-type = "worker-head"
      }
    }

    self-managed-gpu-adv = {
      name            = var.self_managed_gpu_adv_node_group_name
      use_name_prefix = true

      key_name = aws_key_pair.cluster_key.key_name

      bootstrap_extra_args = "--kubelet-extra-args '--node-labels=morpheus-type=gpu-adv'"

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
        aws s3 cp s3://$DEPLOYMENT_BUCKET/check-last-deploy-models.sh /bin/
        chmod +x /bin/deploy-models.sh
        chmod +x /bin/check-last-deploy-models.sh
        echo "PATH=/usr/bin:/bin:/usr/local/bin" > /etc/cron.d/morpheus
        echo "*/15 * * * * root deploy-models.sh" >> /etc/cron.d/morpheus
        echo "*/2 * * * * root check-last-deploy-models.sh" >> /etc/cron.d/morpheus
        mkdir -p "$CLOUDWATCH_ETC_FOLDER"
        aws s3 cp s3://$DEPLOYMENT_BUCKET/$CLOUDWATCH_ETC_FILENAME "$CLOUDWATCH_ETC_FOLDER"
        sudo yum install -y amazon-cloudwatch-agent
        ./opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:$CLOUDWATCH_ETC_FOLDER/$CLOUDWATCH_ETC_FILENAME
        sudo deploy-models.sh
      EOT

      block_device_mappings = {
        xvda = {
          device_name = var.self_managed_gpu_adv_nodes_device_name
          ebs = {
            volume_size           = var.self_managed_gpu_adv_nodes_device_size
            volume_type           = "gp3"
            iops                  = 3000
            delete_on_termination = true
          }
        }
      }

      subnet_ids = module.vpc.private_subnets

      min_size     = var.self_managed_gpu_adv_node_min_size
      max_size     = var.self_managed_gpu_adv_node_max_size
      desired_size = var.self_managed_gpu_adv_node_desired_size
      ami_id       = var.self_managed_gpu_adv_nodes_ami

      warm_pool = {
        pool_state                  = "Stopped"
        min_size                    = var.self_managed_gpu_adv_node_warm_pool_min_size
        max_group_prepared_capacity = var.self_managed_gpu_adv_node_warm_pool_max_group_prepared_capacity
      }

      instance_type = var.self_managed_gpu_adv_nodes_instance_type

      metadata_options = {
        http_endpoint               = "enabled"
        http_tokens                 = "required"
        http_put_response_hop_limit = 2
        instance_metadata_tags      = "disabled"
      }

      create_iam_role          = true
      iam_role_name            = local.self_managed_gpu_adv_iam_role_name
      iam_role_use_name_prefix = false
      iam_role_description     = "Self managed node group gpu advanced"
      iam_role_additional_policies = [
        "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess",
        "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
      ]
    }
  }
}

resource "aws_cloudwatch_metric_alarm" "scale_up_adv" {
  alarm_description   = "Queue size alarm to scale up"
  alarm_actions       = [aws_autoscaling_policy.scale_up_adv.arn]
  alarm_name          = local.scale_up_adv_alarm_name
  comparison_operator = "GreaterThanOrEqualToThreshold"
  namespace           = local.cloudwatch_namespace_name
  metric_name         = "avg-queue-size"
  threshold           = var.scale_up_adv_queue_threshold
  evaluation_periods  = var.scale_up_adv_evaluation_period
  period              = var.scale_up_adv_period
  statistic           = "Average"
}

resource "aws_autoscaling_policy" "scale_up_adv" {
  autoscaling_group_name = module.eks.self_managed_node_groups["self-managed-gpu-adv"]["autoscaling_group_name"]
  name                   = local.scale_up_adv_policy_name
  policy_type            = "SimpleScaling"
  adjustment_type        = "ChangeInCapacity"
  cooldown               = var.scale_up_adv_cooldown
  scaling_adjustment     = var.scale_up_adv_scaling_adjustment
}

resource "aws_cloudwatch_metric_alarm" "scale_down_adv" {
  alarm_description   = "Queue size alarm to scale down"
  alarm_actions       = [aws_autoscaling_policy.scale_down_adv.arn]
  alarm_name          = local.scale_down_adv_alarm_name
  comparison_operator = "LessThanThreshold"
  namespace           = local.cloudwatch_namespace_name
  metric_name         = "avg-queue-size"
  threshold           = var.scale_down_adv_queue_threshold
  evaluation_periods  = var.scale_down_adv_evaluation_period
  period              = var.scale_down_adv_period
  statistic           = "Average"
}

resource "aws_autoscaling_policy" "scale_down_adv" {
  autoscaling_group_name = module.eks.self_managed_node_groups["self-managed-gpu-adv"]["autoscaling_group_name"]
  name                   = local.scale_down_adv_policy_name
  policy_type            = "SimpleScaling"
  adjustment_type        = "ChangeInCapacity"
  scaling_adjustment     = var.scale_down_adv_scaling_adjustment
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
