resource "aws_ssm_parameter" "stripe_secret_key" {
  name        = "/gracehairsbeauty/${var.env}/stripe/secret_key"
  type        = "SecureString"
  value       = "REPLACE_ME"
  description = "Stripe secret key for Grace Hair Beauty ${var.env}"
  key_id      = aws_kms_key.data.arn

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    Environment = var.env
    ManagedBy   = "terraform"
  }
}

resource "aws_ssm_parameter" "stripe_webhook_secret" {
  name        = "/gracehairsbeauty/${var.env}/stripe/webhook_secret"
  type        = "SecureString"
  value       = "REPLACE_ME"
  description = "Stripe webhook signing secret for Grace Hair Beauty ${var.env}"
  key_id      = aws_kms_key.data.arn

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    Environment = var.env
    ManagedBy   = "terraform"
  }
}

resource "aws_ssm_parameter" "zoho_smtp_user" {
  name        = "/gracehairsbeauty/${var.env}/zoho-smtp-user"
  type        = "SecureString"
  value       = "REPLACE_ME"
  description = "Zoho SMTP sender address for Grace Hair Beauty ${var.env}"
  key_id      = aws_kms_key.data.arn

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    Environment = var.env
    ManagedBy   = "terraform"
  }
}

resource "aws_ssm_parameter" "zoho_smtp_password" {
  name        = "/gracehairsbeauty/${var.env}/zoho-smtp-password"
  type        = "SecureString"
  value       = "REPLACE_ME"
  description = "Zoho SMTP app password for Grace Hair Beauty ${var.env}"
  key_id      = aws_kms_key.data.arn

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    Environment = var.env
    ManagedBy   = "terraform"
  }
}

resource "aws_ssm_parameter" "zoho_admin_emails" {
  name        = "/gracehairsbeauty/${var.env}/zoho-admin-emails"
  type        = "SecureString"
  value       = "REPLACE_ME"
  description = "Comma-separated admin alert email addresses for Grace Hair Beauty ${var.env}"
  key_id      = aws_kms_key.data.arn

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    Environment = var.env
    ManagedBy   = "terraform"
  }
}
