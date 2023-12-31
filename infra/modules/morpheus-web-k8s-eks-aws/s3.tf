resource "aws_s3_bucket" "results" {
  bucket = local.s3_results_bucket_name

  tags = {
    Name = "Results bucket"
    env  = "${var.env}"
  }
}

resource "aws_s3_bucket_acl" "results_acl" {
    bucket = aws_s3_bucket.results.id
    acl    = "public-read"
    depends_on = [aws_s3_bucket_ownership_controls.s3_bucket_acl_ownership]
}

resource "aws_s3_bucket_ownership_controls" "s3_bucket_acl_ownership" {
  bucket = aws_s3_bucket.results.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
  depends_on = [aws_s3_bucket_public_access_block.results_public_access_block]
}

resource "aws_s3_bucket_public_access_block" "results_public_access_block" {
  bucket = aws_s3_bucket.results.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_cors_configuration" "results_bucket_cors" {
  bucket = aws_s3_bucket.results.id

  cors_rule {
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
    allowed_headers = ["*"]
    expose_headers  = ["Content-Disposition"]
  }
}

resource "aws_s3_bucket_policy" "results_bucket_public_policy" {
  bucket = aws_s3_bucket.results.id
  policy = data.aws_iam_policy_document.result_public_access_policy_document.json
}

data "aws_iam_policy_document" "result_public_access_policy_document" {
  statement {

    sid    = "PublicReadGetObject"
    effect = "Allow"

    principals {
      type        = "AWS"
      identifiers = ["*"]
    }

    actions = [
      "s3:GetObject"
    ]

    resources = [
      "arn:aws:s3:::${local.s3_results_bucket_name}/*",
    ]
  }
}


resource "aws_s3_bucket" "models" {
  bucket = local.s3_models_bucket_name

  tags = {
    Name = "Models bucket"
    env  = "${var.env}"
  }
}

resource "aws_s3_bucket" "deployment" {
  bucket = local.s3_deployment_bucket_name

  tags = {
    Name = "Deployment bucket"
    env  = "${var.env}"
  }
}

resource "aws_s3_object" "deploy_script" {
  bucket = aws_s3_bucket.deployment.id
  key    = "deploy-models.sh"
  source = "${path.module}/scripts/deployment/deploy-models.sh"
  depends_on = [
    local_file.deploy_models
  ]
}

resource "aws_s3_object" "check_sync_models_deploy_script" {
  bucket = aws_s3_bucket.deployment.id
  key    = "check-last-deploy-models.sh"
  source = "${path.module}/scripts/deployment/check-last-deploy-models.sh"
}

resource "local_file" "deploy_models" {
  content  = templatefile("${path.module}/scripts/deployment/deploy-models.tftpl", { bucket_name = local.s3_models_bucket_name })
  filename = "${path.module}/scripts/deployment/deploy-models.sh"
}

resource "aws_s3_object" "cloudwatch_config_file" {
  bucket = aws_s3_bucket.deployment.id
  key    = "morpheus-cloudwatch-agent-config.json"
  source = "${path.module}/scripts/deployment/morpheus-cloudwatch-agent-config.json"
  depends_on = [
    local_file.cloudwatch_config
  ]
}

resource "local_file" "cloudwatch_config" {
  content  = templatefile("${path.module}/scripts/deployment/morpheus-cloudwatch-agent-config.tftpl", { namespace_name = local.cloudwatch_namespace_name })
  filename = "${path.module}/scripts/deployment/morpheus-cloudwatch-agent-config.json"
}

resource "aws_s3_object" "cloudwatch_web_config_file" {
  bucket = aws_s3_bucket.deployment.id
  key    = "morpheus-cloudwatch-web-agent-config.json"
  source = "${path.module}/scripts/deployment/morpheus-cloudwatch-web-agent-config.json"
  depends_on = [
    local_file.cloudwatch_web_config
  ]
}

resource "local_file" "cloudwatch_web_config" {
  content  = templatefile("${path.module}/scripts/deployment/morpheus-cloudwatch-web-agent-config.tftpl", { namespace_name = local.cloudwatch_namespace_name })
  filename = "${path.module}/scripts/deployment/morpheus-cloudwatch-web-agent-config.json"
}
