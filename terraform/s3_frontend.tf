# 1. Random Suffix for Unique Bucket Naming
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# 2. S3 Bucket for Static Frontend
resource "aws_s3_bucket" "frontend" {
  bucket        = "${var.app_name}-frontend-${random_id.bucket_suffix.hex}"
  force_destroy = true

  tags = {
    Name = "${var.app_name}-frontend"
  }
}

# 3. Block All Public Access to S3 Bucket
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# 4. CloudFront Origin Access Control (OAC)
resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "${var.app_name}-oac"
  description                       = "Origin Access Control for TicketDesk S3 Frontend"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# 5. S3 Bucket Policy allowing CloudFront OAC
resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipalReadOnly"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.frontend.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.main.arn
          }
        }
      }
    ]
  })
}
