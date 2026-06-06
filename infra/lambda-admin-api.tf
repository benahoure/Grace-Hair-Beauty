module "admin_api" {
  #checkov:skip=CKV_TF_1:Terraform Registry module is pinned by immutable semantic version; commit hashes are not supported for registry source syntax
  source  = "terraform-aws-modules/lambda/aws"
  version = "8.0.1"

  function_name = local.admin_lambda_name
  description   = "Grace Hair Beauty admin API"
  handler       = "admin_api.handler.lambda_handler"
  runtime       = "python3.14"
  architectures = ["arm64"]
  memory_size   = var.lambda_memory_admin
  timeout       = var.lambda_timeout

  create_package         = false
  local_existing_package = local.admin_api_zip

  environment_variables = {
    LOG_LEVEL                         = var.log_level
    ENVIRONMENT                       = var.env
    ALLOWED_ORIGIN                    = var.allowed_origin
    TABLE_SERVICES                    = aws_dynamodb_table.services.name
    TABLE_APPOINTMENTS                = aws_dynamodb_table.appointments.name
    TABLE_PORTFOLIO                   = aws_dynamodb_table.portfolio.name
    TABLE_REVIEWS                     = aws_dynamodb_table.reviews.name
    TABLE_CONTACT_MESSAGES            = aws_dynamodb_table.contact_messages.name
    TABLE_BUSINESS_SETTINGS           = aws_dynamodb_table.business_settings.name
    TABLE_AUDIT_LOG                   = aws_dynamodb_table.admin_audit_log.name
    TABLE_IDEMPOTENCY                 = aws_dynamodb_table.idempotency.name
    ASSETS_BUCKET                     = aws_s3_bucket.assets.bucket
    COGNITO_USER_POOL_ID              = aws_cognito_user_pool.this.id
    CLOUDFRONT_DIST_ID                = aws_cloudfront_distribution.frontend.id
    BUSINESS_SETTINGS_DISTRIBUTION_ID = aws_cloudfront_distribution.frontend.id
    JWKS_URL                          = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.this.id}/.well-known/jwks.json"
    KMS_KEY_ID                        = aws_kms_key.data.arn
    CDN_BASE_URL                      = "https://cdn.${var.domain_name}"
    STRIPE_SECRET_KEY_SSM             = aws_ssm_parameter.stripe_secret_key.name
    ZOHO_SMTP_USER_SSM                = aws_ssm_parameter.zoho_smtp_user.name
    ZOHO_SMTP_PASSWORD_SSM            = aws_ssm_parameter.zoho_smtp_password.name
    ZOHO_ADMIN_EMAILS_SSM             = aws_ssm_parameter.zoho_admin_emails.name
  }

  attach_policy_statements = true
  policy_statements = {
    dynamo_all = {
      effect    = "Allow"
      actions   = ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem", "dynamodb:DeleteItem", "dynamodb:Query", "dynamodb:Scan"]
      resources = concat(local.dynamodb_table_arns, local.dynamodb_index_arns)
    }
    kms_data_key = {
      effect    = "Allow"
      actions   = ["kms:Decrypt", "kms:Encrypt", "kms:GenerateDataKey"]
      resources = [aws_kms_key.data.arn]
    }
    s3_objects = {
      effect    = "Allow"
      actions   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
      resources = ["${aws_s3_bucket.assets.arn}/*"]
    }
    s3_list = {
      effect    = "Allow"
      actions   = ["s3:ListBucket"]
      resources = [aws_s3_bucket.assets.arn]
    }
    cloudfront_invalidate = {
      effect    = "Allow"
      actions   = ["cloudfront:CreateInvalidation"]
      resources = [aws_cloudfront_distribution.frontend.arn]
    }
    cognito_manage = {
      effect    = "Allow"
      actions   = ["cognito-idp:ListUsers", "cognito-idp:AdminGetUser", "cognito-idp:AdminAddUserToGroup"]
      resources = [aws_cognito_user_pool.this.arn]
    }
    ssm_stripe = {
      effect    = "Allow"
      actions   = ["ssm:GetParameter", "ssm:GetParameters"]
      resources = [
        aws_ssm_parameter.stripe_secret_key.arn,
        aws_ssm_parameter.zoho_smtp_user.arn,
        aws_ssm_parameter.zoho_smtp_password.arn,
        aws_ssm_parameter.zoho_admin_emails.arn,
      ]
    }
    xray = {
      effect    = "Allow"
      actions   = ["xray:PutTraceSegments", "xray:PutTelemetryRecords"]
      resources = ["*"]
    }
  }

  cloudwatch_logs_retention_in_days = var.log_retention_days
  tracing_mode                      = "Active"
  reserved_concurrent_executions    = var.admin_api_reserved_concurrent_executions

  create_current_version_allowed_triggers = false

  allowed_triggers = {
    api_gateway = {
      service    = "apigateway"
      source_arn = "${aws_apigatewayv2_api.this.execution_arn}/*/*"
    }
  }
}
