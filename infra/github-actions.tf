
# [ GitHub Actions Workflow ] ----(1) Requests OIDC Token----> [ GitHub OIDC Provider ]
#          ^                                                            |
#
#          | (4) Issues Temp Security Credentials                       | (2) Generates JWT Signed Token
#          v                                                            v
# [ AWS IAM (Role Assumption) ] <---(3) Validates Token & Claims --------+
#
# 1. GitHub Actions workflow initiates and requests an OIDC token for authentication.
# 2. GitHub generates a JWT signed token containing claims about the workflow, repository, and environment.
# 3. AWS IAM validates the token's signature and claims against the configured OIDC provider and trust policy.
# 4. Upon successful validation, AWS IAM issues temporary security credentials to the GitHub Actions workflow, allowing it to interact with AWS resources securely without long-term credentials.


variable "create_oidc_provider" {
  description = "Create GitHub Actions OIDC provider. Only one exists per AWS account — set false after first env is deployed."
  type        = bool
  default     = true
}

resource "aws_iam_openid_connect_provider" "github_actions" {
  count           = var.create_oidc_provider ? 1 : 0
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

data "aws_iam_openid_connect_provider" "github_actions" {
  count = var.create_oidc_provider ? 0 : 1
  url   = "https://token.actions.githubusercontent.com"
}

locals {
  oidc_provider_arn = var.create_oidc_provider ? (
    aws_iam_openid_connect_provider.github_actions[0].arn
  ) : (
    data.aws_iam_openid_connect_provider.github_actions[0].arn
  )
}

resource "aws_iam_role" "github_actions" {
  name        = "gracehairsbeauty-${var.env}-github-actions"
  description = "Assumed by GitHub Actions for ${var.env} deployments"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = local.oidc_provider_arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }
        StringLike = {
          "token.actions.githubusercontent.com:sub" = "repo:benahoure/Grace-Hair-Beauty:*"
        }
      }
    }]
  })
}

# Terraform manages KMS, IAM, Cognito, CloudFront, DynamoDB, Lambda, S3, WAF —
# AdministratorAccess is the practical choice for a Terraform deployment role.
resource "aws_iam_role_policy_attachment" "github_actions" {
  role       = aws_iam_role.github_actions.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

output "github_actions_role_arn" {
  description = "Paste this into the GitHub environment variable AWS_ROLE_TO_ASSUME"
  value       = aws_iam_role.github_actions.arn
}
