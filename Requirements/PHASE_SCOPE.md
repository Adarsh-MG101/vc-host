# PHASE_SCOPE

This phase split is directly derived from the source requirement docs.

## Phase 1: Platform Baseline
- Nx web + api workspace readiness.
- Env/config files for database, auth, SMTP, storage.
- Core middleware (`auth`, `tenantScope`).

## Phase 2: Authentication and Identity
- Superadmin login flow (env seeded account).
- Organization register/login/logout flows.
- Profile and password management.

## Phase 3: Superadmin Features
- Overview dashboard metrics.
- Organizations list/create/edit/activate/deactivate.
- Global admin activity and CSV export.

## Phase 4: Organization Operations
- Dashboard stats.
- Template management (upload/list/edit/delete).
- Certificate lifecycle (single and bulk).
- Roles and users management.
- Organization activity and CSV export.

## Phase 5: Verification and Delivery
- QR and manual ID verification path.
- SMTP certificate delivery.
- Verification endpoint hardening and UX states.

## Phase 6: Hardening
- Security controls: validation, CORS, rate limits, token safety.
- Deployment controls: process manager, HTTPS, monitoring.
- Test implementation from source checklist (unit/integration/manual).

## Phase 7: Extended Enhancements
- Advanced RBAC
- analytics
- template marketplace
- API access/webhooks
- revocation
- template visual designer
- i18n, mobile, blockchain (optional)
