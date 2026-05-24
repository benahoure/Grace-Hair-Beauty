module "public_api" {
  #checkov:skip=CKV_TF_1:Terraform Registry module is pinned by immutable semantic version; commit hashes are not supported for registry source syntax
  source  = "terraform-aws-modules/lambda/aws"
  version = "8.0.1"

  function_name = local.public_lambda_name
  description   = "Grace Hair Beauty public API"
  handler       = "public_api.handler.lambda_handler"
  runtime       = "python3.13"
  architectures = ["arm64"]
  memory_size   = var.lambda_memory_public
  timeout       = var.lambda_timeout

  create_package         = false
  local_existing_package = local.public_api_zip

  environment_variables = {
    LOG_LEVEL               = var.log_level
    ENVIRONMENT             = var.env
    ALLOWED_ORIGIN          = var.allowed_origin
    TABLE_SERVICES          = aws_dynamodb_table.services.name
    TABLE_PORTFOLIO         = aws_dynamodb_table.portfolio.name
    TABLE_REVIEWS           = aws_dynamodb_table.reviews.name
    TABLE_BUSINESS_SETTINGS = aws_dynamodb_table.business_settings.name
    TABLE_APPOINTMENTS      = aws_dynamodb_table.appointments.name
    TABLE_CONTACT_MESSAGES  = aws_dynamodb_table.contact_messages.name
    TABLE_AUDIT_LOG         = aws_dynamodb_table.admin_audit_log.name
    TABLE_IDEMPOTENCY       = aws_dynamodb_table.idempotency.name
    SES_SENDER_EMAIL        = var.ses_sender_email
    ADMIN_ALERT_EMAIL       = var.admin_alert_email
    KMS_KEY_ID              = aws_kms_key.data.arn
    CDN_BASE_URL            = "https://cdn.${var.domain_name}"
  }

  attach_policy_statements = true
  policy_statements = {
    dynamo_read = {
      effect    = "Allow"
      actions   = ["dynamodb:GetItem", "dynamodb:Query", "dynamodb:Scan"]
      resources = local.public_read_table_arns
    }
    dynamo_write = {
      effect  = "Allow"
      actions = ["dynamodb:PutItem"]
      resources = [
        aws_dynamodb_table.appointments.arn,
        aws_dynamodb_table.contact_messages.arn,
        aws_dynamodb_table.reviews.arn,
        aws_dynamodb_table.admin_audit_log.arn,
      ]
    }
    kms_encrypt_pii = {
      effect    = "Allow"
      actions   = ["kms:Encrypt"]
      resources = [aws_kms_key.data.arn]
    }
    dynamo_idempotency = {
      effect    = "Allow"
      actions   = ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem", "dynamodb:DeleteItem"]
      resources = [aws_dynamodb_table.idempotency.arn]
    }
    ses_send = {
      effect    = "Allow"
      actions   = ["ses:SendEmail"]
      resources = ["*"]
      conditions = {
        from_address = {
          test     = "StringEquals"
          variable = "ses:FromAddress"
          values   = [var.ses_sender_email]
        }
      }
    }
    xray = {
      effect    = "Allow"
      actions   = ["xray:PutTraceSegments", "xray:PutTelemetryRecords"]
      resources = ["*"]
    }
  }

  cloudwatch_logs_retention_in_days = var.log_retention_days
  tracing_mode                      = "Active"
  reserved_concurrent_executions    = 50

  allowed_triggers = {
    api_gateway = {
      service    = "apigateway"
      source_arn = "${aws_apigatewayv2_api.this.execution_arn}/*/*"
    }
  }
}
