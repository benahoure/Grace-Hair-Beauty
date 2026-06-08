# Development Deployment Guide

This guide brings up the `dev` Grace Hair Beauty environment manually. Use it before production so DNS, SES, API, Lambda, DynamoDB, Cognito, CloudFront, and the frontend deployment path can be verified safely.

## Target Environment

- Website: `https://dev.gracehairsbeauty.com`
- API: `https://dev.gracehairsbeauty.com/api` (routed through CloudFront — no separate api. subdomain)
- CDN: `https://cdn.dev.gracehairsbeauty.com`
- Cognito hosted UI: `https://auth.dev.gracehairsbeauty.com`
- Terraform vars: `infra/env/dev.tfvars`
- Terraform backend: `infra/backend/dev.tfbackend`

## Prerequisites

- AWS CLI authenticated to the target AWS account.
- Terraform `>= 1.9.8`.
- Python `3.14`.
- Node.js and npm.
- Route 53 hosted zone exists for `gracehairsbeauty.com`.
- SES sender domain/email can be verified.
- Local working tree reviewed before deployment.

Recommended shell setup:

```bash
export AWS_PROFILE=<your-dev-profile>
export AWS_REGION=us-east-1
```

## 1. Bootstrap Terraform State

Run this once per AWS account. The bootstrap stack creates:

- S3 state bucket: `gracehairsbeauty-tfstate`
- DynamoDB lock table: `gracehairsbeauty-tflock`

Use `-chdir` to avoid accidentally initializing the main infra backend too early:

```bash
terraform -chdir=infra/bootstrap init
terraform -chdir=infra/bootstrap plan -out bootstrap.tfplan
terraform -chdir=infra/bootstrap apply bootstrap.tfplan
```

Do not use the main `infra/backend/*.tfbackend` files for the bootstrap stack. Bootstrap should use local state first because it creates the remote state resources.

## 2. Build Lambda Packages

Terraform currently deploys local Lambda zip files from `lambdas/dist`.

```bash
cd lambdas
python3 -m venv .venv
source .venv/bin/activate
python --version # expected: Python 3.14.x
pip install -r requirements-dev.txt

make lint
make test
PYTHON=python make build

ls -lh dist/public-api.zip dist/admin-api.zip
cd ..
```

Expected artifacts:

- `lambdas/dist/public-api.zip`
- `lambdas/dist/admin-api.zip`

## 3. Plan Dev Infrastructure

```bash
cd infra
terraform init -backend-config=backend/dev.tfbackend -reconfigure
terraform fmt -recursive
terraform validate
terraform plan -var-file=env/dev.tfvars -out dev.tfplan
```

Review the plan before applying. Confirm it is creating only dev resources and that domains use `dev.gracehairsbeauty.com`.

## 4. Apply Dev Infrastructure

```bash
terraform apply dev.tfplan
```

After apply, capture outputs:

```bash
terraform output
```

Important outputs:

- `frontend_bucket_name`
- `assets_bucket_name`
- `api_endpoint`
- `cognito_user_pool_id`
- `cognito_client_id`
- `frontend_distribution_domain`
- `assets_distribution_domain`

The custom domains may need time to propagate and CloudFront may take several minutes to deploy.

## 5. Verify DNS and SES

Terraform creates Route 53 records for:

- `dev.gracehairsbeauty.com`
- `api.dev.gracehairsbeauty.com`
- `cdn.dev.gracehairsbeauty.com`
- `auth.dev.gracehairsbeauty.com`
- ACM validation
- SES DKIM/SPF/DMARC

SES starts in sandbox mode unless production access has already been granted. In sandbox mode, messages can only be sent to verified recipients.

## 6. Seed Dev Data

Run the seed script after DynamoDB tables exist:

```bash
cd ../lambdas

TABLE_SERVICES=gracehairsbeauty-dev-services \
TABLE_BUSINESS_SETTINGS=gracehairsbeauty-dev-business-settings \
TABLE_PORTFOLIO=gracehairsbeauty-dev-portfolio \
TABLE_REVIEWS=gracehairsbeauty-dev-reviews \
CDN_BASE_URL=https://cdn.dev.gracehairsbeauty.com \
python3 scripts/seed_data.py

cd ..
```

Important: verify service and portfolio image URLs before launch. The frontend mock data uses local `/services/*.webp` assets, while DynamoDB records should point to files available through the CDN.

## 7. Build the Frontend for Dev

`VITE_COGNITO_DOMAIN` should be the domain only, without `https://`.

```bash
cd apps/web

VITE_API_BASE_URL=https://dev.gracehairsbeauty.com/api \
VITE_CDN_BASE_URL=https://cdn.dev.gracehairsbeauty.com \
VITE_COGNITO_USER_POOL_ID=<dev-user-pool-id> \
VITE_COGNITO_CLIENT_ID=<dev-client-id> \
VITE_COGNITO_DOMAIN=auth.dev.gracehairsbeauty.com \
npm run build

cd ../..
```

## 8. Upload Frontend to S3

```bash
aws s3 sync apps/web/dist s3://gracehairsbeauty-dev-frontend --delete --exclude ".DS_Store" --exclude "*/.DS_Store"
aws s3 sync apps/web/dist/services s3://gracehairsbeauty-dev-assets/services --delete --exclude ".DS_Store" --exclude "*/.DS_Store"
aws s3 sync apps/web/dist/products s3://gracehairsbeauty-dev-assets/products --delete --exclude ".DS_Store" --exclude "*/.DS_Store"
```

Then invalidate CloudFront. If the distribution IDs are not in Terraform outputs yet, retrieve them from the AWS Console or CLI.

```bash
aws cloudfront create-invalidation \
  --distribution-id <dev-frontend-distribution-id> \
  --paths "/*"

aws cloudfront create-invalidation \
  --distribution-id <dev-assets-distribution-id> \
  --paths "/services/*" "/products/*"
```

## 9. Smoke Test Dev

```bash
curl --fail https://dev.gracehairsbeauty.com/api/services
curl --fail https://dev.gracehairsbeauty.com/api/business-settings
curl --fail https://dev.gracehairsbeauty.com/api/reviews
curl --fail https://dev.gracehairsbeauty.com
```

Manual checks:

- Homepage loads with final approved hero.
- Services load from API.
- Portfolio has records and images.
- Booking form submits to `POST /appointments`.
- Contact form submits to `POST /contact`.
- Review form submits to `POST /reviews` and remains pending.
- Admin login redirects to Cognito.
- Admin APIs reject unauthenticated requests.
- Mobile navigation and sticky booking bar work.
- No broken images in browser console.

## 10. Create Dev Admin User

Create a Cognito user in the dev user pool, then add it to the `admins` group.

Example:

```bash
aws cognito-idp admin-create-user \
  --user-pool-id <dev-user-pool-id> \
  --username <admin-email> \
  --user-attributes Name=email,Value=<admin-email> Name=email_verified,Value=true

aws cognito-idp admin-add-user-to-group \
  --user-pool-id <dev-user-pool-id> \
  --username <admin-email> \
  --group-name admins
```

## 11. Dev Rollback

Frontend rollback:

- Re-sync a previous `apps/web/dist` build if available.
- Or redeploy from a previous Git commit.
- Invalidate CloudFront.

Lambda rollback:

- Rebuild zips from a known-good commit.
- Run `terraform plan` and `terraform apply` against dev.

Infrastructure rollback:

- Use Terraform state and a reviewed reverse change.
- Do not edit AWS resources manually unless there is an incident.

## Dev Deployment Checklist

- Terraform state bootstrap completed.
- Lambda packages built.
- `terraform validate` passed.
- Dev plan reviewed.
- Dev apply completed.
- Seed data loaded.
- Frontend built with dev environment variables.
- Frontend synced to private S3 bucket.
- CloudFront invalidation completed.
- Smoke tests passed.
- Admin user created and added to `admins`.
- SES sandbox/production behavior understood.
- Portfolio/service CDN images verified.
