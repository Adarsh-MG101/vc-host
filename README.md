# VerifyCerts

VerifyCerts is a multi-tenant certificate generation and verification platform built in an Nx monorepo.

## What It Does

- Manages organizations under a superadmin workspace
- Allows organization users to upload certificate templates
- Generates certificates (single and bulk) with QR-enabled verification
- Supports public certificate verification via certificate ID or QR link
- Tracks platform and organization activity logs

## Roles

- Superadmin
- Organization Owner
- Organization Admin
- Organization Member
- Public Verifier (no login)

## Workspace Structure

- `apps/web` - Next.js frontend
- `apps/api` - Express backend
- `packages/*` - shared workspace packages (when added)

## Requirements Documentation

- New VerifyCerts requirement pack: `Requirements_VerifyCert/`
  - `README.md`
  - `SPEC.md`
  - `ARCHITECTURE.md`
  - `APP_FLOW.md`
  - `DATA_API.md`
  - `PHASE_SCOPE.md`
  - `schema.md`
  - `stories.extracted.txt`
- Legacy pack from previous project remains in `Requirements/` for reference.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Start web app:

```bash
npm run web:serve
```

3. Start API:

```bash
npm run api:serve
```

## Notes

- This repo currently contains bootstrap application code plus requirements-first documentation.
- API and UI modules should be implemented following the contracts and scope in `Requirements_VerifyCert/`.
