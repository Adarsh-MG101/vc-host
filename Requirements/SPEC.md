# SPEC

This document is a strict structured sync of these source files:
- `DEVELOPER_REQUIREMENTS_SOURCE.md`
- `FEATURE_OVERVIEW_SOURCE.md`
- `FOLDER_STRUCTURE_SOURCE.md`

When conflicts appear, `DEVELOPER_REQUIREMENTS_SOURCE.md` is authoritative.

## 1) Product Definition
VerifyCerts is a multi-tenant platform for certificate lifecycle management:
- template upload and placeholder extraction
- certificate generation (single and bulk)
- SMTP delivery
- public verification by QR or certificate ID

## 2) Roles and Access

### Superadmin
- Login: yes
- Registration: no
- Forgot password: no
- Scope: all organizations
- Core pages:
  - `/superadmin/overview`
  - `/superadmin/organizations`
  - `/superadmin/activity`

### Organization Owner
- Login/register/forgot password: yes
- Full organization access including roles/users.

### Organization Admin
- Login/register/forgot password: yes
- Template/certificate operations and role assignment by policy.

### Organization Member
- Login/register/forgot password: yes
- View-first access; create/edit/delete based on granted permissions.

### Public Verifier
- No login.
- Verifies certificates via `/verify` flow.

## 3) Functional Modules

## 3.1 Superadmin Module
- Overview dashboard with platform counters and recent activity.
- Organizations management table (search/filter/sort).
- Create org with owner account and welcome email.
- Activate/deactivate organization status.
- Global activity logs with CSV export.

## 3.2 Organization Dashboard
Route: `/organization/dashboard`
- Stats cards: templates, total certs, monthly certs, recent activity.
- Quick actions to templates and generation.
- Recent certificates list.

## 3.3 Profile
Route: `/organization/profile`
- Name update.
- Email/role/org view.
- Password change (current/new/confirm).

## 3.4 Templates
Route: `/organization/templates`
- Upload DOCX and template name.
- Auto-detect placeholders `{{...}}`.
- Special placeholders: `QR_CODE`, `CERTIFICATE_ID`, `DATE`.
- Thumbnail generation and storage.
- Template listing with view/edit/delete/search/filter/status toggle.

## 3.5 Certificates
Route: `/organization/certificates`
- Single generation tab:
  - choose template
  - dynamic form fields
  - PDF generation
  - optional SMTP send after generate
- Bulk generation tab:
  - CSV/Excel upload
  - column mapping
  - row preview
  - progress tracking
  - ZIP output
  - optional bulk send
- Certificates table:
  - view/download/send/delete
  - copy verification link
  - filter and bulk actions

## 3.6 Roles and Users
Route: `/organization/roles`
- Create/edit/delete custom roles.
- Permission checklist model.
- Create users, assign roles, change status.

## 3.7 Organization Activity
Route: `/organization/activity`
- View and filter organization events.
- Export CSV.

## 3.8 Public Verification
Route: `/verify` and ID-based verify route.
- QR-based and manual ID verification.
- Valid response shows issued-to, issuer, date, and ID.
- Invalid response shows not found/invalid state.

## 4) RBAC Matrix (from source)
| Capability | Superadmin | Owner | Admin | Member |
|---|---|---|---|---|
| Manage organizations | Yes | No | No | No |
| View superadmin activity | Yes | No | No | No |
| Organization dashboard/profile | No | Yes | Yes | Yes |
| Upload/edit/delete templates | No | Yes | Yes | No |
| Generate/send/delete certificates | No | Yes | Yes | No |
| Create roles / assign users | No | Yes | Yes | No |
| View organization activity | No | Yes | Yes | Conditional |

## 5) Security Requirements
- Password hashing (bcrypt).
- JWT authentication.
- Tenant filter on organization queries.
- File upload restrictions for DOCX and max-size checks.
- Input validation and sanitization.
- CORS restrictions.
- Rate limiting on sensitive endpoints.

## 6) Environment Requirements
Server env must include at least:
- `PORT`, `NODE_ENV`
- `MONGODB_URI`
- `JWT_SECRET`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET_NAME`, `AWS_REGION` (optional)
- `FRONTEND_URL`

Client env must include:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_APP_URL`

## 7) Non-Functional and Delivery
- Production deployment on HTTPS with process management and monitoring.
- Database auth and backup strategy.
- Storage abstraction for local/S3.
- Unit/integration/manual test requirements as defined in source.

## 8) Future Scope (Phase 2+)
- Advanced RBAC management UI.
- Certificate analytics and tracking.
- Template marketplace.
- Public API/webhooks.
- Certificate revocation.
- Template visual designer.
- Mobile and multilingual support.
- Optional blockchain hash anchoring.
