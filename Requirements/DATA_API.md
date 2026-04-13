# DATA_API

Strict sync source:
- API endpoint catalog from `DEVELOPER_REQUIREMENTS_SOURCE.md`

## 1) Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

## 2) Superadmin
- `GET /api/superadmin/organizations`
- `POST /api/superadmin/organizations`
- `PUT /api/superadmin/organizations/:id`
- `GET /api/superadmin/stats`
- `GET /api/superadmin/activity`
- `GET /api/superadmin/activity/export`

## 3) Organization Core
- `GET /api/organization/dashboard`
- `GET /api/organization/profile`
- `PUT /api/organization/profile`
- `PUT /api/organization/profile/password`

## 4) Templates
- `GET /api/organization/templates`
- `POST /api/organization/templates`
- `DELETE /api/organization/templates/:id`

Template upload contract:
- multipart form with template file and name
- validate docx and size limit
- extract placeholders
- generate thumbnail
- persist metadata

## 5) Certificates
- `POST /api/organization/documents/generate`
- `POST /api/organization/documents/bulk-generate`
- `GET /api/organization/documents`
- `POST /api/organization/documents/:id/send-email`

Single generate request body (minimum):
- `templateId`
- `data` object
- `sendEmail` boolean (optional)
- recipient metadata when sending

Bulk generate request body:
- multipart file (csv/xlsx)
- `templateId`
- optional send settings

## 6) Roles and Users
Roles:
- `GET /api/organization/roles`
- `POST /api/organization/roles`
- `PUT /api/organization/roles/:roleId`
- `DELETE /api/organization/roles/:roleId`

Users:
- `GET /api/organization/users`
- `POST /api/organization/users`
- `PUT /api/organization/users/:userId/role`
- `PUT /api/organization/users/:userId/status`

## 7) Activity
- `GET /api/organization/activity`
- `GET /api/organization/activity/export`

## 8) Verification (Public)
- `GET /api/verify/:certificateId`

Valid response:
- `valid: true`
- certificate summary fields

Invalid response:
- `valid: false`
- not found message

## 9) Authorization Rules
- superadmin endpoints: superadmin only
- organization endpoints: authenticated org user + tenant scope
- verify endpoint: public

Expected error semantics:
- `401` unauthenticated
- `403` unauthorized
- `404` not found

## 10) Email Events
Email triggers:
- owner welcome on organization creation
- certificate email on user action
- optional password reset email

SMTP config is environment-driven as defined in source requirements.
