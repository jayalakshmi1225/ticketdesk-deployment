variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "ap-south-2"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.20.0/24"]
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "ticketdesk"
}

variable "container_port" {
  description = "Port exposed by the Spring Boot container"
  type        = number
  default     = 8080
}

variable "container_image" {
  description = "Docker image URI in ECR"
  type        = string
  default     = "379563252342.dkr.ecr.ap-south-2.amazonaws.com/ticketdesk:ec78414"
}

variable "db_name" {
  description = "RDS MySQL database name"
  type        = string
  default     = "ticketdesk"
}

variable "db_username" {
  description = "RDS MySQL master username"
  type        = string
  default     = "ticketdesk_admin"
}

variable "alarm_email" {
  description = "Email address for CloudWatch alarm notifications"
  type        = string
  default     = "admin@example.com"
}
