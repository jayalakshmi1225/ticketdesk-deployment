# 1. S3 Bucket for File Attachments
resource "aws_s3_bucket" "attachments" {
  bucket        = "${var.app_name}-attachments-${random_id.bucket_suffix.hex}"
  force_destroy = true

  tags = {
    Name = "${var.app_name}-attachments"
  }
}

# 2. CORS Policy allowing browser presigned uploads
resource "aws_s3_bucket_cors_configuration" "attachments" {
  bucket = aws_s3_bucket.attachments.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["*"]
    max_age_seconds = 3000
  }
}

# 3. Block Public Access (Presigned URLs grant temporary access)
resource "aws_s3_bucket_public_access_block" "attachments" {
  bucket = aws_s3_bucket.attachments.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
