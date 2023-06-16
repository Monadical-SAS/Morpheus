resource "aws_db_subnet_group" "default" {
  name       = local.db_subnet_group_name
  subnet_ids = module.vpc.private_subnets

  tags = {
    Name = "Morpheus db subnet group"
    env  = var.env
  }
}

resource "aws_db_instance" "db_postgres" {
  identifier             = local.db_identifier
  instance_class         = var.db_instance_class
  allocated_storage      = var.db_allocated_storage
  engine                 = var.db_engine
  engine_version         = var.db_engine_version
  skip_final_snapshot    = true
  db_name                = var.db_name
  vpc_security_group_ids = [aws_security_group.db_postgres.id]
  username               = local.db_creds.username
  password               = local.db_creds.password
  db_subnet_group_name   = aws_db_subnet_group.default.name

  tags = {
    env = var.env
  }
}

resource "aws_security_group" "db_postgres" {
  name   = local.db_security_group_name
  vpc_id = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion.id, module.eks.node_security_group_id]
  }

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
  }

  tags = {
    env = var.env
  }
}
