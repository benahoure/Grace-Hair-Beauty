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
- Terraform state bootstrap has already been completed.
- SES domain identity is verified.
- SES production access has been approved.
- GitHub repository has an AWS OIDC IAM role for production deployment.
- GitHub production environment requires manual approval.
- Production admin inbox is monitored: `ghbeauty24@gmail.com`.
- Production Cognito admin user process is ready.

## Recommended GitHub Actions Secrets and Variables

Use GitHub environment variables/secrets rather than committing production-specific values.

Recommended production variables:

- `AWS_REGION=us-east-1`
- `AWS_ROLE_TO_ASSUME=<prod-github-actions-oidc-role-arn>`
- `VITE_API_BASE_URL=https://api.gracehairsbeauty.com`
- `VITE_CDN_BASE_URL=https://cdn.gracehairsbeauty.com`
- `VITE_COGNITO_DOMAIN=auth.gracehairsbeauty.com`

Values discovered after Terraform apply:

- `VITE_COGNITO_USER_POOL_ID`
- `VITE_COGNITO_CLIENT_ID`
- frontend bucket name
- CloudFront frontend distribution ID

Do not store long-lived AWS access keys in GitHub.

## Workflow 1: Infrastructure

Trigger:

- Pull requests touching `infra/**`.
- Manual dispatch for production apply.

Recommended behavior:

```text
checkout
configure AWS credentials through OIDC
terraform init -backend-config=backend/prod.tfbackend -reconfigure
terraform fmt -check -recursive
terraform validate
terraform plan -var-file=env/prod.tfvars -out prod.tfplan
upload/show plan
wait for protected environment approval
terraform apply prod.tfplan
```

Production infra apply should not run automatically on every push.

## Workflow 2: Backend

Trigger:

- Changes under `lambdas/**`.
- Manual dispatch.

Recommended behavior:

```text
checkout
set up Python 3.14
install requirements-dev.txt
run ruff
run mypy
run pytest
run security scans if enabled
build public-api.zip and admin-api.zip
configure AWS credentials through OIDC
terraform init -backend-config=backend/prod.tfbackend -reconfigure
terraform plan -var-file=env/prod.tfvars -out prod-backend.tfplan
wait for protected environment approval
terraform apply prod-backend.tfplan
```

Current Terraform expects local artifacts:

- `lambdas/dist/public-api.zip`
- `lambdas/dist/admin-api.zip`

For a stronger production setup, build immutable artifacts in CI and upload them to an S3 artifact bucket keyed by Git SHA, then have Terraform deploy those S3 artifact keys.

## Workflow 3: Frontend

Trigger:

- Changes under `apps/web/**`.
- Manual dispatch.

Recommended behavior:

```text
checkout
set up Node
npm ci
npm run lint
npm test
build with production VITE_* variables
configure AWS credentials through OIDC
aws s3 sync apps/web/dist s3://gracehairsbeauty-prod-frontend --delete --exclude ".DS_Store"
aws cloudfront create-invalidation --distribution-id <prod-frontend-distribution-id> --paths "/*"
```

This is the path that prevents manual frontend uploads to S3 after every website change.

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
