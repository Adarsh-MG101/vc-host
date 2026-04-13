# SCHEMA

## 1) User Model (`users`)
| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | Yes | PK |
| `name` | String | Yes | User display name |
| `email` | String | Yes | Unique login email |
| `password` | String | Yes | bcrypt hash |
| `role` | String | Yes | `superadmin`, `admin`, `user` |
| `orgRole` | String | No | `owner`, `admin`, `member` |
| `organization` | ObjectId | No | Null for superadmin |
| `status` | String | Yes | `active`, `inactive` |
| `createdAt` | Date | Yes | Audit |
| `updatedAt` | Date | Yes | Audit |

## 2) Organization Model (`organizations`)
| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | Yes | PK |
| `name` | String | Yes | Organization name |
| `slug` | String | Yes | URL-safe unique slug |
| `logo` | String | No | Logo URL/path |
| `owner` | ObjectId | Yes | User reference |
| `status` | String | Yes | `active`, `inactive` |
| `createdAt` | Date | Yes | Audit |
| `updatedAt` | Date | Yes | Audit |

## 3) Template Model (`templates`)
| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | Yes | PK |
| `organization` | ObjectId | Yes | Tenant boundary |
| `name` | String | Yes | Template name |
| `filePath` | String | Yes | DOCX location |
| `thumbnailPath` | String | No | PNG preview |
| `placeholders` | Array<String> | Yes | Parsed placeholders |
| `enabled` | Boolean | Yes | Active flag |
| `createdBy` | ObjectId | Yes | User reference |
| `createdAt` | Date | Yes | Audit |
| `updatedAt` | Date | Yes | Audit |

## 4) Document/Certificate Model (`documents`)
| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | Yes | PK |
| `organization` | ObjectId | Yes | Tenant boundary |
| `template` | ObjectId | Yes | Template reference |
| `uniqueId` | String | Yes | Public certificate ID |
| `data` | Object | Yes | Placeholder payload |
| `filePath` | String | Yes | PDF location |
| `verificationUrl` | String | Yes | Public verify link |
| `createdBy` | ObjectId | Yes | User reference |
| `createdAt` | Date | Yes | Audit |
| `updatedAt` | Date | Yes | Audit |

## 5) Activity Model (`activities`)
| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | Yes | PK |
| `organization` | ObjectId | No | Null for superadmin-global events |
| `userId` | ObjectId | Yes | Actor |
| `type` | String | Yes | Activity type key |
| `ipAddress` | String | No | Client IP |
| `userAgent` | String | No | Browser/device |
| `metadata` | Object | No | Action-specific details |
| `createdAt` | Date | Yes | Timestamp |

## 6) OrgOtp Model (`orgOtps`)
| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | Yes | PK |
| `organization` | ObjectId | Yes | Tenant reference |
| `email` | String | Yes | Recipient email |
| `otp` | String | Yes | Hashed OTP |
| `expiresAt` | Date | Yes | Expiration |
| `attempts` | Number | Yes | Attempt counter |
| `usedAt` | Date | No | Consumption timestamp |
| `createdAt` | Date | Yes | Audit |

## Relationships
- `organizations.owner -> users._id`
- `users.organization -> organizations._id`
- `templates.organization -> organizations._id`
- `documents.organization -> organizations._id`
- `documents.template -> templates._id`
- `activities.userId -> users._id`

## Required Indexing (minimum)
- `users.email` unique
- `organizations.slug` unique
- `documents.uniqueId` unique
- `templates.organization + name`
- `activities.organization + createdAt`
