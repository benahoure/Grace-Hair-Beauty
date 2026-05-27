# Deployment Guide

Grace Hair Beauty uses separate deployment paths for development and production.

- Development is deployed manually from a trusted local machine so the first AWS environment can be brought up carefully and smoke tested.
- Production should be deployed through GitHub Actions with AWS OIDC, environment approval, and repeatable build artifacts.

Use these guides:

- [Development Deployment](./dev-deployment-guide.md)
- [Production Deployment](./prod-deployment-guide.md)

Do not run `terraform apply` against production from a local machine unless there is an emergency and the change has already been reviewed.
