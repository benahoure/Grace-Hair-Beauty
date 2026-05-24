# Deployment Guide

## 1. Bootstrap Terraform State

Create a private S3 bucket named `gracehairsbeauty-tfstate` and a DynamoDB lock table named `gracehairsbeauty-tflock` with `LockID` as the string hash key.

## 2. Configure AWS DNS and Email

Ensure the Route 53 hosted zone for `gracehairsbeauty.com` exists. Terraform creates ACM validation records, SES verification, DKIM, and DMARC records.

SES starts in sandbox mode. Request SES production access before launch.

## 3. Terraform

```bash
cd infra
terraform init
terraform plan -var-file=env/dev.tfvars
terraform apply
```

Repeat for `prod` with `-var-file=env/prod.tfvars`. Production should be applied through GitHub Actions with environment approval.

## 4. Backend

Build a single Lambda artifact from `lambdas`:

```bash
make build
cd dist
zip -r ../lambda.zip .
```

Upload through `deploy-backend.yml` or update functions with the AWS CLI.

## 5. Seed Data

Run `lambdas/scripts/seed_data.py` with table environment variables from Terraform outputs.

## 6. Frontend

Set Vite variables for API, CDN, and Cognito. Build and sync `apps/web/dist` to the private frontend bucket, then invalidate CloudFront.

## 7. Smoke Tests

```bash
curl --fail https://api.gracehairsbeauty.com/services
curl --fail https://api.gracehairsbeauty.com/business-settings
```
