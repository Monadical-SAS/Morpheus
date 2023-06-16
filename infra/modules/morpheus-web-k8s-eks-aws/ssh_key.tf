resource "tls_private_key" "pk" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "cluster_key" {
  key_name   = local.cluster_ssh_key
  public_key = tls_private_key.pk.public_key_openssh

  provisioner "local-exec" {
    command = "echo '${tls_private_key.pk.private_key_pem}' > ./${var.cluster_ssh_key_pem_name}"
  }

  tags = {
    env = var.env
  }
}
