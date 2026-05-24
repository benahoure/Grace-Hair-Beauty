variable "aws_region" {
  description = "AWS region for regional resources."
  type        = string
  default     = "us-east-1"
}

variable "env" {
  description = "Deployment environment. Must be dev or prod."
  type        = string

  validation {
    condition     = contains(["dev", "prod"], var.env)
    error_message = "env must be dev or prod."
  }
}

variable "domain_name" {
  description = "Fully qualified site domain for this environment."
  type        = string
}

variable "hosted_zone_name" {
  description = "Existing Route 53 hosted zone name to use for DNS records."
  type        = string
}

variable "lambda_memory_public" {
  description = "Memory size in MB for the public API Lambda."
  type        = number
}

variable "lambda_memory_admin" {
  description = "Memory size in MB for the admin API Lambda."
  type        = number
}

variable "lambda_timeout" {
  description = "Lambda timeout in seconds. Keep below API Gateway's 30 second limit."
  type        = number
  default     = 29
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days."
  type        = number
  default     = 30
}

variable "waf_rate_limit" {
  description = "WAF rate limit per five-minute window per IP."
  type        = number
}

variable "waf_common_override_count" {
  description = "Whether the WAF Common Rule Set should run in count mode instead of block mode."
  type        = bool
}

variable "log_level" {
  description = "Lambda application log level."
  type        = string
}

variable "cognito_callback_urls" {
  description = "Allowed Cognito OAuth callback URLs."
  type        = list(string)
}

variable "cognito_logout_urls" {
  description = "Allowed Cognito logout URLs."
  type        = list(string)
}

variable "ses_sender_email" {
  description = "Verified sender email address used by SES."
  type        = string
}

variable "allowed_origin" {
  description = "Allowed browser origin for CORS."
  type        = string
}
