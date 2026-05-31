# Environment Variables

Frontend public values:

```bash
VITE_API_BASE_URL=https://api.gracehairsbeauty.com
VITE_COGNITO_USER_POOL_ID=us-east-1_EXAMPLE
VITE_COGNITO_CLIENT_ID=exampleclientid
VITE_COGNITO_DOMAIN=gracehairsbeauty-prod-auth.auth.us-east-1.amazoncognito.com
VITE_CDN_BASE_URL=https://cdn.gracehairsbeauty.com
```

Lambda values are injected by Terraform:

```bash
ENVIRONMENT=prod
TABLE_SERVICES=gracehairsbeauty-prod-services
TABLE_APPOINTMENTS=gracehairsbeauty-prod-appointments
TABLE_PORTFOLIO=gracehairsbeauty-prod-portfolio
TABLE_REVIEWS=gracehairsbeauty-prod-reviews
TABLE_CONTACT_MESSAGES=gracehairsbeauty-prod-contact-messages
TABLE_BUSINESS_SETTINGS=gracehairsbeauty-prod-business-settings
TABLE_AUDIT_LOG=gracehairsbeauty-prod-audit-log
ALLOWED_ORIGIN=https://gracehairsbeauty.com
ASSETS_BUCKET=gracehairsbeauty-prod-assets
CDN_BASE_URL=https://cdn.gracehairsbeauty.com
SES_SENDER_EMAIL=no-reply@gracehairsbeauty.com
ADMIN_ALERT_EMAIL=plbahoure2993@gmail.com
KMS_KEY_ID=arn:aws:kms:...
BUSINESS_SETTINGS_DISTRIBUTION_ID=...
```

No AWS credentials belong in `.env` files. Lambda uses execution roles.
