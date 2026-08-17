output "alb_dns_name" {
  description = "Public DNS name of the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront Distribution"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "cloudfront_url" {
  description = "Full HTTPS URL of the CloudFront Application entrypoint"
  value       = "https://${aws_cloudfront_distribution.main.domain_name}"
}

output "rds_endpoint" {
  description = "Endpoint of the RDS MySQL instance"
  value       = aws_db_instance.main.endpoint
}

output "s3_frontend_bucket" {
  description = "S3 bucket hosting the static React frontend"
  value       = aws_s3_bucket.frontend.id
}

output "s3_attachments_bucket" {
  description = "S3 bucket for storing user attachments and thumbnails"
  value       = aws_s3_bucket.attachments.id
}

output "lambda_thumbnail_function" {
  description = "AWS Lambda function name for generating thumbnails"
  value       = aws_lambda_function.thumbnail.function_name
}

output "cloudwatch_log_group" {
  description = "CloudWatch log group for ECS application logs"
  value       = aws_cloudwatch_log_group.ecs.name
}

output "sns_alert_topic_arn" {
  description = "ARN of the SNS topic for CloudWatch alarms"
  value       = aws_sns_topic.alerts.arn
}
