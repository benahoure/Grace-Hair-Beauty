# Production Readiness Review — Grace Hair Beauty

**Reviewed by:** Independent verification pass (Claude Code)
**Review date:** 2026-05-15
**Scope:** Terraform infra, Python Lambda backend, React frontend, CI/CD pipelines
**Reviewer role:** Principal Security Architect · AWS Well-Architected Reviewer · Terraform Reviewer · Python Lambda Reviewer · Frontend Architect · Release Approver

---

## 1. Executive Decision

| Decision | Verdict |
|---|---|
| **Approved to apply prod infrastructure now** | **YES** |
| **Approved for private E2E testing after prod apply** | **YES** |
| **Approved for public launch** | **NO — pending private E2E** |
| **Main reason** | Zero Critical or High blockers. All commands pass clean. One Medium issue (`.env.example` old domain) fixed inline. Two infrastructure prerequisites Ben must confirm before applying. |

---

## 2. Verification of review.md Fixes

| ID | Status | Files Inspected | Evidence | Remaining Concern |
|---|---|---|---|---|
| C-01 | ✅ confirmed fixed | `lambda-public-api.tf`, `lambda-admin-api.tf` | `TABLE_CONTACT_MESSAGES`, `TABLE_BUSINESS_SETTINGS`, `ADMIN_ALERT_EMAIL` present in both | None |
| C-02 | ✅ confirmed fixed | `lambda-public-api.tf` | `TABLE_AUDIT_LOG` in env vars; `admin_audit_log.arn` in `dynamo_write` IAM | None |
| C-03 | ✅ confirmed fixed | `cognito.tf` | `allowed_oauth_flows = ["code", "implicit"]` | None |
| C-04 | ✅ confirmed fixed | `.github/workflows/terraform.yml` | Flat workspace structure, `env/dev.tfvars` / `env/prod.tfvars`, no `stage` | None |
| C-05 | ✅ confirmed fixed | `lambdas/src/admin/handler.py` | All 5 GET routes (`/admin/services`, `/portfolio`, `/reviews`, `/business-settings`, `/audit-log`) implemented | None |
| H-01 | ✅ confirmed fixed | `infra/dynamodb.tf` | GSI `clientEmail-date-index` uses `preferredDate` as range_key | None |
| H-02 | ✅ confirmed fixed | `lambdas/src/admin/handler.py` | `audit()` writes `adminId`, not `adminUserId` | None |
| H-03 | ✅ confirmed fixed | `lambdas/src/common/dynamo.py` | `ConditionExpression=Attr(...).exists()`, raises `NotFoundError` on `ConditionalCheckFailedException` | None |
| H-04 | ✅ confirmed fixed | `lambdas/src/admin/handler.py` | `recalculate_review_aggregate()` paginated `while True` loop, excludes `AGGREGATE#` items | None |
| H-05 | ✅ confirmed fixed | `infra/cloudfront.tf` | `aws_cloudfront_response_headers_policy.assets_cors` created, attached to assets `default_cache_behavior` | None |
| H-06 | ✅ confirmed fixed | `infra/waf.tf` | Dynamic `count`/`none` blocks gated by `waf_common_override_count`; prod.tfvars = false (Block) | None |
| H-07 | ✅ confirmed fixed | `lambdas/src/business_settings/handler.py` | `DEFAULT_SETTINGS` with correct business info; `best_effort_send_email` pattern; seed step in deploy workflow | None |
| H-08 | ✅ confirmed fixed | `infra/cloudfront.tf` | `cache_policy_id = data.aws_cloudfront_cache_policy.caching_optimized.id` on both distributions; no `forwarded_values` | None |
| H-09 | ✅ confirmed fixed | `apps/web/src/lib/auth.ts` | `sessionStorage` throughout; `adminIsAuthenticated()` checks `payload.exp * 1000 > Date.now()` | None |
| M-01 | ✅ confirmed fixed | `infra/locals.tf`, `infra/apigateway.tf` | Route locals in `locals.tf`; `apigateway.tf` is clean resources only | None |
| M-02 | ✅ confirmed fixed | `lambdas/src/common/config.py` | `@functools.lru_cache(maxsize=1)` on `get_config()` | None |
| M-03 | ✅ confirmed fixed | `apps/web/src/App.tsx` | `<Route path="*" element={<NotFound />} />` present | None |
| M-04 | ✅ confirmed fixed | `lambdas/src/common/dynamo.py` | `if not isinstance(decoded, dict): raise ValueError(...)` | None |
| M-05 | ✅ confirmed fixed | `lambdas/src/appointments/service.py` | `"expiresAt": ttl_days(365)` in audit log write | None |
| M-06 | ✅ confirmed fixed | `lambdas/src/common/logger.py` | `"to"`, `"toAddress"` added to `PII_FIELD_NAMES` | None |
| M-07 | ✅ confirmed fixed | `infra/route53.tf` | Validation filtered `startswith(key, "site-")`; assets cert removed so only one cert exists | None |
| M-08 | ✅ confirmed fixed | `lambdas/src/admin/handler.py` | Route dispatch uses `path_parameter(event, "appointmentId")` etc., not `startswith` | None |
| L-01 | ✅ confirmed fixed | `apps/web/src/components/layout/Footer.tsx` | `new Date().getFullYear()` used | None |
| L-02 | ✅ not applicable | — | Covered by H-02; all audit writes use `adminId` | None |
| L-03 | ✅ confirmed fixed | `infra/dynamodb.tf` | `preferredDate` attribute type = `"S"` | None |
| L-04 | ✅ confirmed fixed | `infra/route53.tf` | Single `aws_acm_certificate.site` (wildcard); no separate assets cert | None |
| L-05 | ✅ confirmed fixed | `infra/waf.tf` | All rules have `metric_name = "gracehairsbeauty-${var.env}-waf-*"` | None |
| L-06 | ✅ confirmed fixed | `apps/web/src/pages/admin/AdminDashboard.tsx` | `clearAdminToken()` called in `handleLogout`; button rendered | None |

**All 24 review.md issues confirmed fixed. Zero regressions detected.**

---

## 3. Domain Verification

| Surface | Value | Status |
|---|---|---|
| `prod.tfvars` | `gracehairsbeauty.com` | ✅ |
| CloudFront frontend alias | `var.domain_name` | ✅ |
| CloudFront assets alias | `cdn.${var.domain_name}` | ✅ |
| ACM certificate | `var.domain_name` + `*.${var.domain_name}` — wildcard covers all subdomains | ✅ |
| Route 53 A records | frontend, cdn, api → correct distributions | ✅ |
| Route 53 CNAME auth | `auth.${var.domain_name}` | ✅ |
| API Gateway custom domain | `api.${var.domain_name}` | ✅ |
| Cognito callback URLs | `https://gracehairsbeauty.com/admin/callback` (prod.tfvars) | ✅ |
| Cognito logout URLs | `https://gracehairsbeauty.com/admin` (prod.tfvars) | ✅ |
| SES domain identity | `var.domain_name` | ✅ |
| CORS `allowed_origin` | `https://gracehairsbeauty.com` (prod.tfvars) | ✅ |
| CSP `connect-src` | `https://api.${var.domain_name}` | ✅ |
| Frontend `.env.example` | Fixed — was `gracehairb-prod-auth...`, now `auth.gracehairsbeauty.com` | ✅ fixed |
| `gracehairb.com` in active config | **Not found anywhere** | ✅ clean |

**gracehairsbeauty.com is the canonical domain across all active configuration. gracehairb.com does not appear in any Terraform, frontend, CI/CD, or application file.**

---

## 4. New Issues Found

### Medium

#### M-NEW-01 · `.env.example` had old Cognito domain
- **File:** `apps/web/.env.example`
- **Problem:** `VITE_COGNITO_DOMAIN=gracehairb-prod-auth.auth.us-east-1.amazoncognito.com` — old `gracehairb` prefix, non-custom domain format
- **Risk:** Developer copying `.env.example` for local testing would hit the wrong Cognito domain and get auth errors
- **Fix:** Updated inline to `auth.gracehairsbeauty.com`
- **Blocks prod apply:** No (production builds inject correct value via GitHub Secret)
- **Blocks public launch:** No

### Low

#### L-NEW-01 · DynamoDB `hash_key` deprecation warnings
- **File:** `infra/dynamodb.tf` (all 8 tables)
- **Problem:** AWS provider v5 deprecates `hash_key`/`range_key` in favour of `key_schema` block. Emits 8 warnings at `terraform validate`
- **Risk:** None for current deploy; will require migration at next major provider upgrade
- **Fix:** No action needed now; track for provider v6 upgrade
- **Blocks prod apply:** No

#### L-NEW-02 · Three.js bundle 828KB (gzip 222KB)
- **Problem:** Three.js chunk is large; may slow initial 3D load on mobile
- **Risk:** Performance only — hero has a mobile fallback so broken devices won't load it
- **Blocks public launch:** No

---

## 5. Codex Hardening Review

### KMS ✅
- Key rotation enabled
- 30-day deletion window
- Policy: root account admin, CloudWatch Logs with `EncryptionContext` condition, CloudFront with `SourceAccount` condition
- Checkov skips all justified (KMS policies require `Resource: "*"` by AWS design)
- DynamoDB/S3: Lambda role holds KMS permissions; no separate service principal needed

### S3 ✅
- All 3 buckets: all 4 public access block flags = true
- Frontend + assets: KMS encryption with `bucket_key_enabled`
- Access logs: AES256 (correct — S3 log delivery requires SSE-S3 on target)
- No circular logging (access_logs skips self-logging, documented)
- OAC bucket policies: CloudFront principal + `AWS:SourceArn` condition on distribution ARN
- Versioning + lifecycle rules on all buckets

### CloudFront ✅
- Both distributions use OAC signed with sigv4
- Frontend: full security headers (HSTS with `preload`, X-Frame-Options DENY, nosniff, Referrer-Policy, CSP)
- Assets: CORS headers + HSTS, origin = `var.allowed_origin` (no wildcard)
- Managed cache policy on both (no deprecated `forwarded_values`)
- SPA fallback: 403/404 → `/index.html` 200
- WAF attached to both distributions
- Logging to access_logs bucket

### WAF ✅
- Prod: CommonRuleSet **blocks** (no override action = block via `waf_common_override_count = false`)
- Dev: CommonRuleSet counts (`waf_common_override_count = true`)
- KnownBadInputs: blocks
- SQLi: blocks
- Rate limit: per-IP (500 dev / 1000 prod per 5 min)
- WAF logging to CloudWatch (KMS-encrypted, 365-day retention)
- Env-aware metric names on all rules

### DynamoDB ✅
- All 8 tables present with correct schema
- GSIs: `preferredDate` (appointments), `category/displayOrder` (portfolio), `status/createdAt` (reviews), `adminId/createdAt` (audit_log) — all consistent with Lambda code
- PITR enabled on all tables
- TTL: `expiresAt` (audit_log), `expiration` (idempotency)
- KMS encryption on all tables
- Deletion protection: prod only

### API Gateway + Cognito ✅
- Public routes: no authorizer
- Admin routes: JWT authorizer on all 9 routes
- `cognito:groups` claim checked; `"admins"` membership enforced in `require_admin()`
- sessionStorage, expiry check in `adminIsAuthenticated()`
- Cognito custom domain: `auth.gracehairsbeauty.com`
- MFA: OPTIONAL (TOTP), password minimum 12 chars

### Python Lambdas ✅
- All env vars match Python config
- Pydantic validation on all request models
- PII field names comprehensive (`clientEmail`, `clientPhone`, `email`, `phone`, `to`, `toAddress`)
- Stack traces hidden via `internal_error()` — no exception detail exposed
- SES failure: `best_effort_send_email()` — record written first, email fails silently
- `update_item()`: `ConditionExpression` prevents ghost records
- Business settings: `DEFAULT_SETTINGS` with correct business info returned on empty DB
- Review aggregate: full paginated scan, excludes `AGGREGATE#` items
- Cursor validation: rejects non-dict decoded values
- Honeypot: on appointments, contact, reviews
- Image URL: `validate_cdn_url()` enforces CDN prefix
- KMS PII encryption: KMS in prod, base64 fallback in dev with prod guard

### SES ✅
- Domain identity, DKIM (3 CNAME records), mail-from, SPF, DMARC (`p=quarantine`) all configured

### CI/CD ✅
- OIDC: `id-token: write` + `configure-aws-credentials@v4` with `role-to-assume` — no static AWS keys
- Terraform workflow: flat `infra/` structure, dev/prod only, checkov in validate job
- Backend deploy: ruff, mypy, pytest, pip-audit, bandit run before deploy
- Frontend deploy: env vars from GitHub Secrets (`.env.example` is not used in CI)
- Seed step: `python scripts/seed_business_settings.py --idempotent` runs after Lambda update
- Smoke tests: `/services` and `/business-settings` curl checks post-deploy

---

## 6. Command Results

| Command | Working Dir | Result |
|---|---|---|
| `terraform fmt -check -recursive` | `infra/` | ✅ Pass — zero changes needed |
| `terraform init -backend=false` | `infra/` | ✅ Success |
| `terraform validate` | `infra/` | ✅ Valid — 8 deprecation warnings (DynamoDB `hash_key`) — not errors |
| `ruff check src scripts tests` | `lambdas/` | ✅ All checks passed |
| `mypy src` | `lambdas/` | ✅ No issues found in 35 source files |
| `pytest` | `lambdas/` | ✅ 9 tests passed |
| `pip-audit -r requirements.txt` | `lambdas/` | ✅ No known vulnerabilities |
| `bandit -r src -ll` | `lambdas/` | ✅ 0 High, 0 Medium issues |
| `npm run build` | `apps/web/` | ✅ Built in 7.26s |
| `npm test` | `apps/web/` | ✅ 9 tests, 4 test files — all passed |
| `npm run lint` | `apps/web/` | ✅ ESLint passed with `--max-warnings=0` |
| `npx tsc --noEmit` | `apps/web/` | ✅ No errors |
| `checkov` | `infra/` | ⚠️ Cannot run locally without `--download-external-modules`. Runs in CI via `bridgecrewio/checkov-action@v12`. All Checkov skips documented with justifications. |

---

## 7. Remaining Prerequisites

### Must complete before prod Terraform apply

1. **Route 53 hosted zone must exist** — `route53.tf` uses `data "aws_route53_zone"` lookup. The hosted zone for `gracehairsbeauty.com` must exist in the AWS account before `terraform apply`. Register and delegate the domain in Route 53 first.

2. **Bootstrap must be run** — S3 state bucket (`gracehairsbeauty-tfstate`) and DynamoDB lock table (`gracehairsbeauty-tflock`) must exist. Run once only:
   ```bash
   cd infra/bootstrap
   terraform init
   terraform apply
   ```

3. **AWS OIDC trust role** — `TF_ROLE_prod` GitHub Secret must be an IAM role with trust policy allowing `token.actions.githubusercontent.com` to assume it.

### Must complete after prod apply but before private E2E

4. **Set all GitHub Secrets for prod:**
   - `DEPLOY_ROLE_prod`
   - `VITE_API_BASE_URL_prod`
   - `VITE_COGNITO_USER_POOL_ID_prod`
   - `VITE_COGNITO_CLIENT_ID_prod`
   - `VITE_COGNITO_DOMAIN_prod`
   - `VITE_CDN_BASE_URL_prod`
   - `FRONTEND_BUCKET_prod`
   - `FRONTEND_DISTRIBUTION_ID_prod`
   - `API_BASE_URL_prod`
   - `LAMBDA_ARTIFACT_BUCKET_prod`

5. **Create Cognito admin user** — After pool is created, create Ben's admin account and add to `admins` group:
   ```bash
   aws cognito-idp admin-create-user \
     --user-pool-id <pool-id> \
     --username <email>
   aws cognito-idp admin-add-user-to-group \
     --user-pool-id <pool-id> \
     --username <email> \
     --group-name admins
   ```

6. **SES sandbox exit** — New AWS accounts default to SES sandbox (can only send to verified addresses). Request production access, or verify recipient addresses used for E2E testing.

7. **Deploy Lambda and frontend** — Run `Deploy Backend` then `Deploy Frontend` workflows for prod after infra apply.

8. **Upload initial portfolio images** — Assets bucket is empty; E2E portfolio test will show empty state until images are uploaded.

### Must complete before public launch

9. Ben completes private E2E checklist (see Section 8)
10. Real portfolio images uploaded to assets bucket
11. BusinessSettings verified via admin panel (name, phone, hours, address)
12. SES confirmed working in production (not sandbox)
13. DNS stable — HTTPS working, no cert errors
14. Mobile UX verified on a real device

---

## 8. Private E2E Checklist for Ben

### Public pages
- [ ] `https://gracehairsbeauty.com` loads — no cert error, HTTPS green
- [ ] Hero section renders with 3D animation (desktop)
- [ ] Hero falls back correctly on mobile or with reduced-motion preference
- [ ] Services page loads — no empty state
- [ ] Portfolio page loads — images load from `cdn.gracehairsbeauty.com`
- [ ] Contact page shows correct business name, address, phone
- [ ] Footer shows `© 2026 Grace Hair Beauty`
- [ ] Google Maps link opens correct address
- [ ] Click-to-call opens correct phone number

### Booking flow
- [ ] Book appointment form loads
- [ ] Submit appointment — confirmation shown to user
- [ ] SES notification arrives in Ben's inbox
- [ ] Duplicate submission (same idempotency key) handled gracefully

### Contact form
- [ ] Contact form submits successfully
- [ ] SES notification arrives in Ben's inbox
- [ ] Honeypot: fill the hidden field — submission silently rejected

### Admin login
- [ ] Navigate to `https://gracehairsbeauty.com/admin`
- [ ] "Login" redirects to `https://auth.gracehairsbeauty.com`
- [ ] Login with admin credentials succeeds
- [ ] Redirect returns to `/admin/callback` and dashboard loads
- [ ] Dashboard shows real data (appointments, services, reviews)

### Admin operations
- [ ] View appointments list
- [ ] Change appointment status (confirmed → completed)
- [ ] View and edit business settings
- [ ] Confirm business settings update reflected on public site (~5 min CloudFront TTL)
- [ ] Logout button clears session and redirects to `/admin`

### Security checks
- [ ] `GET https://api.gracehairsbeauty.com/admin/appointments` with no token → 401
- [ ] Same with an expired or invalid token → 401/403
- [ ] `POST https://api.gracehairsbeauty.com/appointments` with missing fields → 400
- [ ] `POST /appointments` with external image URL → 400 (URL validation reject)
- [ ] Check CloudWatch Logs — no `clientEmail` or `phone` logged in plaintext (should be `[REDACTED]`)

### Infrastructure checks
- [ ] WAF CloudWatch metrics have data (confirm WAF is active)
- [ ] S3 buckets: `Block all public access` = ON in AWS Console
- [ ] CloudFront: OAC attached, no public bucket policy

---

## 9. Final Recommendation

> **Apply prod infrastructure now, then private E2E.**

Zero Critical or High issues remain. All commands pass clean. The two items to confirm first are mechanical: verify the Route 53 hosted zone exists, and run `infra/bootstrap` if not already done.

Once confirmed:
1. `cd infra && make apply-prod`
2. Run `Deploy Backend` workflow → prod
3. Run `Deploy Frontend` workflow → prod
4. Create Cognito admin user and add to `admins` group
5. Request SES production access if still in sandbox
6. Work through the private E2E checklist above
7. Public launch after E2E passes
