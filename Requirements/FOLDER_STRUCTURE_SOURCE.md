# VerifyCerts Folder Structure

This document shows the current project folder structure for both backend and frontend.

---

## Project Root

```text
VerifyCerts/
├── api/
└── web/
```

---

## Backend Structure (`api`)

```text
api/
├── config/
│   ├── index.js
│   ├── env.config.js
│   ├── cors.config.js
│   ├── mongodb.config.js
│   ├── smtp.config.js
│   ├── s3.config.js
│   └── admin.config.js
├── controllers/
│   ├── auth/
│   │   └── auth.controller.js
│   ├── superadmin/
│   │   └── organization.controller.js
│   ├── organization/
│   │   ├── profile.controller.js
│   │   ├── settings.controller.js
│   │   ├── member.controller.js
│   │   ├── template.controller.js
│   │   ├── document.controller.js
│   │   ├── ai.controller.js
│   │   └── onlyoffice.controller.js
│   └── ai/
│       └── ai.controller.js
├── middleware/
│   ├── auth.js
│   └── tenantScope.js
├── models/
│   ├── User.js
│   ├── Organization.js
│   ├── Template.js
│   ├── Document.js
│   ├── Activity.js
│   └── OrgOtp.js
├── routes/
│   ├── index.js
│   ├── auth/
│   │   ├── index.js
│   │   └── auth.routes.js
│   ├── superadmin/
│   │   ├── index.js
│   │   └── organization.routes.js
│   └── organization/
│       ├── index.js
│       ├── profile.routes.js
│       ├── settings.routes.js
│       ├── member.routes.js
│       ├── template.routes.js
│       ├── document.routes.js
│       ├── ai.routes.js
│       └── onlyoffice.routes.js
├── services/
│   ├── mail.service.js
│   ├── s3.service.js
│   └── template.service.js
├── tests/
│   ├── runTests.js
│   └── cases/
│       ├── login.test.js
│       └── registration.test.js
├── index.js
└── validate-oo.js
```

---

## Frontend Structure (`web/src`)

```text
web/src/
├── app/
│   ├── layout.js
│   ├── globals.css
│   ├── page.js
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.js
│   │   └── register/
│   │       └── page.js
│   ├── superadmin/
│   │   ├── layout.js
│   │   ├── overview/
│   │   │   └── page.js
│   │   └── organizations/
│   │       └── page.js
│   ├── organization/
│   │   ├── layout.js
│   │   ├── page.js
│   │   ├── profile/
│   │   │   └── page.js
│   │   ├── security/
│   │   │   └── page.js
│   │   ├── settings/
│   │   │   └── page.js
│   │   ├── team/
│   │   │   └── page.js
│   │   ├── activity/
│   │   │   └── page.js
│   │   ├── templates/
│   │   │   ├── page.js
│   │   │   └── edit/
│   │   │       └── [id]/
│   │   │           └── page.js
│   │   ├── existing-templates/
│   │   │   └── page.js
│   │   ├── generate/
│   │   │   └── page.js
│   │   ├── bulk-generate/
│   │   │   └── page.js
│   │   └── documents/
│   │       └── page.js
│   └── verify/
│       └── [id]/
│           └── page.js
├── components/
├── context/
├── hooks/
├── services/
└── utils/
```

---

## Requested App Modules

### `app/auth`

- `login/page.js`
- `register/page.js`

### `app/superadmin`

- `overview/page.js`
- `organizations/page.js`
- `layout.js`

### `app/organization`

- `activity/page.js`
- `profile/page.js`
- `templates/page.js`
- `generate/page.js`
- `bulk-generate/page.js`
- `documents/page.js`
- `existing-templates/page.js`
- `team/page.js`
- `settings/page.js`
- `security/page.js`
- `layout.js`

---

## Notes

- Frontend uses Next.js App Router (`web/src/app`).
- Backend follows Node.js + Express modular structure (`routes` + `controllers` + `services` + `models`).
