terraform {
  required_version = ">= 1.9.8"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "tfstate" {
  #checkov:skip=CKV_AWS_18:Terraform state bootstrap bucket access is restricted to CI/IAM roles; CloudTrail covers API access audit
  #checkov:skip=CKV_AWS_144:Cross-region replication is a cost/complexity tradeoff for this small single-region deployment
  #checkov:skip=CKV2_AWS_62:Event notifications are not required for Terraform state storage
  bucket        = "gracehairsbeauty-tfstatefiles"
  force_destroy = false
}

resource "aws_kms_key" "tfstate" {
  #checkov:skip=CKV2_AWS_64:Bootstrap key policy is intentionally minimal so account IAM can administer Terraform state encryption
  description             = "Grace Hair Beauty Terraform state encryption key"
  deletion_window_in_days = 30
  enable_key_rotation     = true
}

resource "aws_kms_alias" "tfstate" {
  name          = "alias/gracehairsbeauty-tfstatefiles"
  target_key_id = aws_kms_key.tfstate.key_id
}

resource "aws_s3_bucket_versioning" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.tfstate.arn
      sse_algorithm     = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "tfstate" {
  bucket                  = aws_s3_bucket.tfstate.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  rule {
    id     = "expire-noncurrent-state"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = 180
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

resource "aws_dynamodb_table" "tflock" {
  #checkov:skip=CKV_AWS_28:Terraform lock table stores ephemeral lock rows only; no application or customer data is stored
  name         = "gracehairsbeauty-tflock"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.tfstate.arn
  }
}
