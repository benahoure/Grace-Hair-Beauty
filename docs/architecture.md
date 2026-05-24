# Architecture

Grace Hair Beauty uses a static React frontend on private S3 behind CloudFront OAC. Public and admin APIs run on API Gateway HTTP API with Python Lambda handlers. DynamoDB stores services, appointments, portfolio metadata, reviews, contact messages, business settings, and admin audit logs.

Admin routes are protected by Cognito JWT authorizer configuration and in-code `admins` group enforcement. Public routes do not require auth.

The hero is code-generated React Three Fiber geometry on capable desktop browsers. Mobile, reduced-motion, low-performance devices, and WebGL failure paths use the CSS/Framer Motion fallback so text and CTAs render immediately.

Data flow:

- Frontend calls `GET /business-settings` for all contact details.
- Booking and contact forms use Zod client validation, then Pydantic backend validation.
- Appointment and contact PII is encrypted before DynamoDB storage.
- SES sends best-effort notifications; failed SES sends are logged without failing saved requests.
- Admin mutations write `AdminAuditLog`.

Terraform uses a flat single-root layout in `infra/` with environment-specific variable files in `infra/env/dev.tfvars` and `infra/env/prod.tfvars`.
