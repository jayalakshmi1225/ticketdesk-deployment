# 1. Random Database Password
resource "random_password" "db_password" {
  length           = 20
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# 2. Random JWT Secret Key
resource "random_password" "jwt_secret" {
  length  = 64
  special = false
}

# 3. AWS Secrets Manager Secret for DB Credentials
resource "aws_secretsmanager_secret" "db_secret" {
  name                    = "${var.app_name}-db-credentials"
  recovery_window_in_days = 0

  tags = {
    Name = "${var.app_name}-db-credentials"
  }
}

resource "aws_secretsmanager_secret_version" "db_secret_ver" {
  secret_id = aws_secretsmanager_secret.db_secret.id
  secret_string = jsonencode({
    username = var.db_username
    password = random_password.db_password.result
  })
}

# 4. Systems Manager Parameter Store
resource "aws_ssm_parameter" "db_host" {
  name  = "/${var.app_name}/db_host"
  type  = "String"
  value = aws_db_instance.main.address

  tags = {
    Name = "${var.app_name}-db-host"
  }
}

resource "aws_ssm_parameter" "db_port" {
  name  = "/${var.app_name}/db_port"
  type  = "String"
  value = "3306"

  tags = {
    Name = "${var.app_name}-db-port"
  }
}

resource "aws_ssm_parameter" "db_name" {
  name  = "/${var.app_name}/db_name"
  type  = "String"
  value = var.db_name

  tags = {
    Name = "${var.app_name}-db-name"
  }
}

resource "aws_ssm_parameter" "db_user" {
  name  = "/${var.app_name}/db_user"
  type  = "String"
  value = var.db_username

  tags = {
    Name = "${var.app_name}-db-user"
  }
}

resource "aws_ssm_parameter" "jwt_secret" {
  name  = "/${var.app_name}/jwt_secret"
  type  = "SecureString"
  value = random_password.jwt_secret.result

  tags = {
    Name = "${var.app_name}-jwt-secret"
  }
}
