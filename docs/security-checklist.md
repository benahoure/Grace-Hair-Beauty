# Security Checklist

- S3 buckets use Block Public Access and CloudFront OAC.
- CloudFront enforces HTTPS and security headers.
- WAF managed rules and rate limits are enabled.
- API CORS allows only the configured site origin.
- Admin APIs require Cognito JWT and `admins` group membership.
- Cognito self-signup is disabled.
- Lambda roles are per function and scoped to table/resource ARNs.
- X-Ray uses `Resource: "*"` because AWS requires it.
- No AWS keys or secrets are stored in frontend code.
- Contact details come from BusinessSettings.
- Pydantic validates all write requests.
- Honeypot fields protect appointment, contact, and review forms.
- PII fields are redacted in logs.
- PII values are encrypted before DynamoDB storage.
- SES DKIM and DMARC records are managed in Terraform.
- GitHub Actions uses OIDC, not static AWS keys.
- CI runs npm audit, pip-audit, bandit, and Checkov.
