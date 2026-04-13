# ARCHITECTURE

Strict sync source:
- `FOLDER_STRUCTURE_SOURCE.md`
- Architecture/stack sections from `DEVELOPER_REQUIREMENTS_SOURCE.md`

## 1) Stack
Backend:
- Node.js + Express
- MongoDB + Mongoose
- JWT auth
- bcrypt password hashing
- docxtemplater, puppeteer, pdf-lib, qrcode
- Nodemailer SMTP
- AWS S3 (or local fallback)

Frontend:
- Next.js 16 + React 19
- Tailwind CSS
- Axios
- React hooks state model

## 2) Backend Folder Structure (target)
```text
api/
  config/
    index.js
    env.config.js
    cors.config.js
    mongodb.config.js
    smtp.config.js
    s3.config.js
    admin.config.js
  controllers/
    auth/auth.controller.js
    superadmin/organization.controller.js
    organization/
      profile.controller.js
      settings.controller.js
      member.controller.js
      template.controller.js
      document.controller.js
      ai.controller.js
      onlyoffice.controller.js
    ai/ai.controller.js
  middleware/
    auth.js
    tenantScope.js
  models/
    User.js
    Organization.js
    Template.js
    Document.js
    Activity.js
    OrgOtp.js
  routes/
    index.js
    auth/index.js
    auth/auth.routes.js
    superadmin/index.js
    superadmin/organization.routes.js
    organization/index.js
    organization/profile.routes.js
    organization/settings.routes.js
    organization/member.routes.js
    organization/template.routes.js
    organization/document.routes.js
    organization/ai.routes.js
    organization/onlyoffice.routes.js
  services/
    mail.service.js
    s3.service.js
    template.service.js
  tests/
    runTests.js
    cases/login.test.js
    cases/registration.test.js
  index.js
  validate-oo.js
```

## 3) Frontend Folder Structure (target)
```text
web/src/
  app/
    layout.js
    globals.css
    page.js
    auth/login/page.js
    auth/register/page.js
    superadmin/layout.js
    superadmin/overview/page.js
    superadmin/organizations/page.js
    organization/layout.js
    organization/page.js
    organization/profile/page.js
    organization/security/page.js
    organization/settings/page.js
    organization/team/page.js
    organization/activity/page.js
    organization/templates/page.js
    organization/templates/edit/[id]/page.js
    organization/existing-templates/page.js
    organization/generate/page.js
    organization/bulk-generate/page.js
    organization/documents/page.js
    verify/[id]/page.js
  components/
  context/
  hooks/
  services/
  utils/
```

## 4) Runtime Boundaries
- Superadmin endpoints are global and bypass tenant filter but remain role-protected.
- Organization endpoints require both auth and tenant scope.
- Verify endpoint is public and read-only.
- File subsystem supports local disk and S3.

## 5) Key Cross-Cutting Modules
- `auth.js` for JWT validation and principal population.
- `tenantScope.js` for organization data isolation.
- Mail service for welcome/certificate emails.
- Template service for placeholder extraction and rendering flow.
