# Grace Hair Beauty

Production monorepo for Grace Hair Beauty, an Indianapolis salon focused on African braiding, protective styling, natural hair care, sew-ins, silk press, men styles, kids styles, and family beauty services.

## Tech Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, React Router, Framer Motion, Three.js, React Three Fiber, Zod, Vitest.
- Backend: Python 3.13 Lambda, Pydantic v2, AWS Lambda Powertools, boto3, DynamoDB, SES, Cognito JWT auth.
- Infrastructure: Terraform, S3 private buckets, CloudFront OAC, WAF, Route 53, ACM, API Gateway HTTP API, DynamoDB, Cognito, SES, CloudWatch, GitHub Actions OIDC.

## Local Setup

```bash
cd apps/web
npm install
npm run dev
```

The frontend uses documented mock data only when `VITE_API_BASE_URL` is not set. Production must set the API URL.

```bash
cd lambdas
python3.13 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
pytest
```

## Commands

Frontend:

```bash
cd apps/web
npm run lint
npm test
npm run build
```

Backend:

```bash
cd lambdas
ruff check src tests
mypy src
pytest
pip-audit -r requirements.txt
bandit -r src -ll
make build
```

Terraform:

```bash
cd infra
terraform fmt -recursive
terraform init
terraform validate
terraform plan -var-file=env/dev.tfvars
```

## Deployment Summary

1. Bootstrap the Terraform state bucket `gracehairsbeauty-tfstatefiles` and lock table `gracehairsbeauty-tflock`.
2. Configure GitHub Actions OIDC roles and repository secrets listed in `docs/deployment-guide.md`.
3. Run Terraform for `dev`, then `prod`.
4. Deploy backend artifact with `deploy-backend.yml`.
5. Seed data with `lambdas/scripts/seed_data.py`.
6. Deploy frontend with `deploy-frontend.yml`.

## AWS Prerequisites

- Route 53 hosted zone for `gracehairsbeauty.com`.
- SES domain verification, DKIM, SPF, and DMARC.
- SES production access before launch. SES sandbox can only send to verified recipients.
- GitHub Actions OIDC IAM roles for each environment.
- A Cognito admin user added to the `admins` group.

## Cognito Admin Creation

Create the user in the AWS Console or CLI, then add the user to the `admins` group in the environment user pool. Admin APIs also check group membership in application code.

## Business Settings

Business contact details are read from `GET /business-settings` and seeded into DynamoDB. Update them through `/admin/settings` or `PATCH /admin/business-settings`.

## Logo Assets

Logo files live in `apps/web/public/brand/` and must be true transparent exports with an alpha channel (RGBA mode). They must not contain a visible checkerboard background baked into the pixels.

| File | Used in |
|---|---|
| `logo-primary-transparent.webp` | Header (tablet/desktop), OG image |
| `logo-light.webp` | Footer, mobile nav overlay |
| `logo-mark.webp` | Header icon (mobile), favicon, apple-touch-icon |

**Validate before committing new assets:**

```bash
python3 -c "from PIL import Image; img = Image.open('apps/web/public/brand/logo-primary-transparent.webp'); print(img.mode)"
# Expected output: RGBA
```

If assets are exported with a checkerboard background baked in, place the source PNGs in `script/brand-source/` and run:

```bash
python3 script/fix_logo_transparency.py
```

## Portfolio Images

Upload optimized WebP files to the private assets bucket under `/portfolio/` and `/portfolio/thumbs/`, then create metadata in `/admin/portfolio`. Admin image URLs must start with the configured CDN domain.

## Seeding

```bash
cd lambdas
TABLE_SERVICES=gracehairsbeauty-dev-services \
TABLE_BUSINESS_SETTINGS=gracehairsbeauty-dev-business-settings \
TABLE_REVIEWS=gracehairsbeauty-dev-reviews \
CDN_BASE_URL=https://cdn.dev.gracehairsbeauty.com \
python scripts/seed_data.py
```

The seed includes canonical BusinessSettings, service records, and an empty approved review aggregate. It does not create invented testimonials.
