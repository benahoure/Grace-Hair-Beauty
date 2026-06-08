# Production Deployment Guide

Production deployments for Grace Hair Beauty should use GitHub Actions with AWS OIDC and environment approval. Do not deploy production from a local machine during normal operations.

## Target Environment

- Website: `https://gracehairsbeauty.com`
- API: `https://gracehairsbeauty.com/api` (routed through CloudFront — no separate api. subdomain)
- CDN: `https://cdn.gracehairsbeauty.com`
- Cognito hosted UI: `https://auth.gracehairsbeauty.com`
- Terraform vars: `infra/env/prod.tfvars`
- Terraform backend: `infra/backend/prod.tfbackend`

## Production Strategy

Production should be split into three CI/CD concerns:

1. Infrastructure workflow for `infra/**`.
2. Backend workflow for `lambdas/**`.
3. Frontend workflow for `apps/web/**`.

Use GitHub Actions OIDC instead of static AWS keys. Production applies should require a protected GitHub environment approval.

## Required AWS/GitHub Prerequisites

- Route 53 hosted zone exists for `gracehairsbeauty.com`.
- Terraform state bootstrap has already been completed (runs once per AWS account — if dev is already deployed, the state bucket `gracehairsbeauty-tfstatefiles` and lock table `gracehairsbeauty-tflock` already exist; do not run bootstrap again).
- **Dev Terraform must be applied before prod.** `infra/github-actions.tf` creates the AWS OIDC provider when `create_oidc_provider = true` (the default). `infra/env/prod.tfvars` sets `create_oidc_provider = false` and references the existing provider. If you run prod apply before dev apply, it will fail because the OIDC provider does not exist yet.
- SES domain identity is verified.
- SES production access has been approved.
- GitHub production environment requires manual approval (see GitHub Actions Workflows section below).
- Production admin inbox is monitored: `info@gracehairsbeauty.com`.
- Production Cognito admin user created after Terraform apply.

## Recommended GitHub Actions Secrets and Variables

Use GitHub environment variables/secrets rather than committing production-specific values.

Recommended production variables:

- `AWS_REGION=us-east-1`
- `AWS_ROLE_TO_ASSUME=<prod-github-actions-oidc-role-arn>`
- `VITE_API_BASE_URL=https://gracehairsbeauty.com/api`
- `VITE_CDN_BASE_URL=https://cdn.gracehairsbeauty.com`
- `VITE_COGNITO_DOMAIN=auth.gracehairsbeauty.com`

Values discovered after Terraform apply:

- `VITE_COGNITO_USER_POOL_ID`
- `VITE_COGNITO_CLIENT_ID`
- frontend bucket name
- CloudFront frontend distribution ID

Do not store long-lived AWS access keys in GitHub.

## GitHub Actions Workflows

Three workflow files exist at `.github/workflows/`. They use AWS OIDC — no static AWS keys stored in GitHub.

### Workflow 1: Infrastructure (`deploy-infra.yml`)

- **Trigger:** Manual dispatch only (GitHub Actions tab → Run workflow).
- **Behavior:** Plan → upload plan artifact → wait for environment approval → apply.
- **Use when:** `.tf` files change (new table, WAF rule update, CloudFront config, etc.).
- Production infra never auto-deploys on push.

### Workflow 2: Backend (`deploy-backend.yml`)

- **Trigger:** Push to `main` touching `lambdas/**`, or manual dispatch.
- **Behavior:** ruff → mypy → pytest → security scan → build zips → deploy dev → wait for prod approval → deploy prod.
- Lambda-only apply uses `-target=module.public_api -target=module.admin_api` to avoid touching unrelated infra.

### Workflow 3: Frontend (`deploy-frontend.yml`)

- **Trigger:** Push to `main` touching `apps/web/**`, or manual dispatch.
- **Behavior:** lint → test → build with env-specific `VITE_*` vars → S3 sync → CloudFront invalidation → wait for prod approval → repeat for prod.

### One-Time GitHub Setup

Create two environments at **Settings → Environments**:

**`development` environment:**

| Type | Name | Value |
|------|------|-------|
| Variable | `AWS_ROLE_TO_ASSUME` | ARN from `terraform output github_actions_role_arn` (dev apply) |
| Variable | `VITE_COGNITO_USER_POOL_ID` | `us-east-1_aDuZYaKEh` |
| Variable | `VITE_COGNITO_CLIENT_ID` | `6sd3bcpitr8tc8622i8fa695mp` |
| Variable | `CLOUDFRONT_DISTRIBUTION_ID` | `E1K2KEE846NSKL` |
| Variable | `VITE_GOOGLE_REVIEW_URL` | your Google review URL |
| Secret | `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_51Tce2A...` |

**`production` environment** (enable **Required reviewers** — add yourself as a required reviewer):

| Type | Name | Value |
|------|------|-------|
| Variable | `AWS_ROLE_TO_ASSUME` | ARN from `terraform output github_actions_role_arn` (prod apply) |
| Variable | `VITE_COGNITO_USER_POOL_ID` | from prod Terraform output |
| Variable | `VITE_COGNITO_CLIENT_ID` | from prod Terraform output |
| Variable | `CLOUDFRONT_DISTRIBUTION_ID` | from prod Terraform output |
| Variable | `VITE_GOOGLE_REVIEW_URL` | your Google review URL |
| Secret | `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` (after Stripe live mode setup) |

## Post-Apply: Update SSM Secrets

After Terraform apply, the SSM parameters contain `REPLACE_ME` placeholders. Update them with real values:

```bash
aws ssm put-parameter \
  --name "/gracehairsbeauty/prod/stripe/secret-key" \
  --value "sk_live_..." \
  --type SecureString --overwrite --region us-east-1

aws ssm put-parameter \
  --name "/gracehairsbeauty/prod/stripe/webhook-secret" \
  --value "whsec_..." \
  --type SecureString --overwrite --region us-east-1

aws ssm put-parameter \
  --name "/gracehairsbeauty/prod/zoho-smtp-password" \
  --value "your-zoho-app-password" \
  --type SecureString --overwrite --region us-east-1
```

## Post-Apply: Create Prod Admin User

```bash
aws cognito-idp admin-create-user \
  --user-pool-id <prod-user-pool-id> \
  --username info@gracehairsbeauty.com \
  --user-attributes Name=email,Value=info@gracehairsbeauty.com Name=email_verified,Value=true \
  --region us-east-1

aws cognito-idp admin-add-user-to-group \
  --user-pool-id <prod-user-pool-id> \
  --username info@gracehairsbeauty.com \
  --group-name admins \
  --region us-east-1
```

Cognito emails a temporary password to `info@gracehairsbeauty.com`. First login at `https://auth.gracehairsbeauty.com` forces a password change.

## Production Data Seed

Seed production only after infrastructure exists and before public launch.

```bash
TABLE_SERVICES=gracehairsbeauty-prod-services \
TABLE_BUSINESS_SETTINGS=gracehairsbeauty-prod-business-settings \
TABLE_REVIEWS=gracehairsbeauty-prod-reviews \
CDN_BASE_URL=https://cdn.gracehairsbeauty.com \
python lambdas/scripts/seed_data.py
```

Production seeding should be controlled and idempotent where possible. Do not seed fake testimonials.

## Production Launch Checklist

- Dev environment has already passed smoke testing.
- Production Terraform plan reviewed.
- SES production access approved.
- DKIM/SPF/DMARC records verified.
- Cognito admin user created and added to `admins`.
- Business settings verified.
- Service records verified.
- Portfolio records verified.
- Portfolio/service images are available from `https://cdn.gracehairsbeauty.com`.
- Frontend built with production API/Cognito/CDN variables.
- API smoke tests pass.
- Booking/contact/review submissions create records.
- SES failures do not lose saved records.
- CloudWatch alarms exist.
- Alarm action SNS topic is configured if notifications are required.
- WAF/API Gateway protection decision documented.

## Production Smoke Tests

```bash
curl --fail https://gracehairsbeauty.com/api/services
curl --fail https://gracehairsbeauty.com/api/business-settings
curl --fail https://gracehairsbeauty.com/api/reviews
curl --fail https://gracehairsbeauty.com
```

Manual checks:

- Homepage loads correctly.
- Mobile and desktop navigation work.
- Booking flow works.
- Contact flow works.
- Reviews submit as pending.
- Admin login works through Cognito.
- Admin APIs require authentication.
- CloudFront serves over HTTPS.
- No public S3 bucket access.
- Browser console has no broken image or API errors.

## Rollback Strategy

Frontend rollback:

- Re-run the frontend deployment workflow for a previous commit.
- Or sync a known-good build artifact and invalidate CloudFront.

Backend rollback:

- Re-run backend deployment for a previous commit.
- If using S3 artifacts later, redeploy a previous Git SHA artifact.

Infrastructure rollback:

- Revert the infrastructure change in Git.
- Run a reviewed Terraform plan through the protected production workflow.

## Cost Guardrails

This architecture should stay modest for low traffic, but monitor:

- WAF fixed monthly cost.
- KMS customer-managed keys.
- CloudWatch logs and alarms.
- CloudFront invalidation volume.
- API Gateway request volume.
- DynamoDB on-demand usage.

For this expected traffic profile, GitHub Actions deployment automation is preferred over manual uploads, and it does not require always-on servers.
