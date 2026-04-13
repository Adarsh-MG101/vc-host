# VerifyCerts - Developer Requirements Document

## Project Overview
VerifyCerts is a multi-tenant certificate generation and verification platform that allows organizations to create, manage, and verify digital certificates with QR code verification capabilities.

---

## Table of Contents
1. [System Architecture](#system-architecture)
2. [User Roles & Access Control](#user-roles--access-control)
3. [Superadmin Module](#superadmin-module)
4. [Organization Admin Module](#organization-admin-module)
5. [Template Management](#template-management)
6. [Certificate Generation & Verification](#certificate-generation--verification)
7. [Authentication & Authorization](#authentication--authorization)
8. [Database Schema](#database-schema)
9. [Technology Stack](#technology-stack)
10. [API Endpoints](#api-endpoints)
11. [Email Notifications](#email-notifications)

---

## Core Stack (Current)
- **Users**: Superadmin, Organization Owner, Admin, Member
- **Workspace**: Nx Workspace
- **Backend**: Node.js
- **Frontend**: Next.js
- **Email**: SMTP (via Nodemailer)
- **Storage**: AWS S3

---

## System Architecture

### Technology Stack

#### Backend (Server)
- **Framework**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Processing**: 
  - `docxtemplater` - Template processing
  - `puppeteer` - PDF generation
  - `pdf-lib` - PDF manipulation
  - `qrcode` - QR code generation
- **Storage**: AWS S3 (with local fallback)
- **Email**: Nodemailer

#### Frontend (Client)
- **Framework**: Next.js 16 (React 19)
- **Styling**: TailwindCSS 4
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **Notifications**: react-toastify

#### DevOps
- **Environment**: Node.js runtime

---

## User Roles & Access Control

### 1. Superadmin (Global Administrator)
**Access Level**: Platform-wide access across all organizations

**Authentication**:
- **Login**: Yes (predefined credentials)
- **Registration**: No (created via environment variables)
- **Forgot Password**: No

**Permissions**:
- View all organizations
- Create new organizations
- Edit organization details
- Deactivate/Activate organizations
- View organization statistics (templates created, certificates generated, etc.)
- No access to organization-specific template or certificate operations

**Key Characteristics**:
- Does not belong to any specific organization
- Credentials set via environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`)
- Auto-seeded on first server startup
- Role: `role: 'superadmin'`, `orgRole: undefined`

---

### 2. Organization Owner
**Access Level**: Full access within their organization

**Authentication**:
- **Login**: Yes
- **Registration**: Yes (first user who creates an organization)
- **Forgot Password**: Yes

**Permissions**:
- All admin permissions (see below)
- Manage team members (add, remove, change roles)
- Organization settings and profile
- Transfer ownership (optional future feature)

**Key Characteristics**:
- Automatically assigned when organization is created
- Role: `role: 'admin'` or `role: 'user'`, `orgRole: 'owner'`

---

### 3. Organization Admin
**Access Level**: Administrative access within their organization

**Authentication**:
- **Login**: Yes
- **Registration**: Yes (or invited by owner)
- **Forgot Password**: Yes

**Permissions**:
- Upload templates
- Edit/delete templates
- Generate single certificates
- Generate bulk certificates
- View/manage generated certificates
- Send certificates via email
- View team members (limited management)

**Key Characteristics**:
- Assigned by organization owner
- Role: `role: 'admin'` or `role: 'user'`, `orgRole: 'admin'`

---

### 4. Organization Member
**Access Level**: Limited access within their organization

**Authentication**:
- **Login**: Yes
- **Registration**: Yes (or invited by owner/admin)
- **Forgot Password**: Yes

**Permissions** (Role-Based, configurable):
- View templates (if granted)
- Generate certificates (if granted)
- View generated certificates (if granted)
- Cannot upload or delete templates
- Cannot manage team

**Key Characteristics**:
- Basic user with restricted access
- Role: `role: 'user'`, `orgRole: 'member'`

---

## Superadmin Module

### Features

#### 1. Overview Dashboard
**Route**: `/superadmin/overview`

**Displays**:
- Total number of organizations
- Total templates across all organizations
- Total certificates generated
- Recent organization activity
- System-wide statistics

**UI Components**:
- Stat cards with icons
- Recent activity timeline
- Quick action buttons

---

#### 2. Organizations Management
**Route**: `/superadmin/organizations`

**Features**:
- **View All Organizations**: Table view with search and filters
  - Organization name
  - Owner name and email
  - Date created
  - Status (Active/Inactive)
  - Total templates count
  - Total certificates generated
  - Actions (View, Edit, Deactivate)

- **Create New Organization**: 
  - Organization name
  - Owner email (admin credentials sent via email)
  - Slug (auto-generated from name)
  - Logo upload (optional)
  
  **Process**:
  1. Superadmin creates organization with owner email
  2. System creates organization record
  3. System creates user account with owner role
  4. Email sent to owner with login credentials
  5. Owner can log in and access their organization dashboard

- **Edit Organization**:
  - Update organization name
  - Change organization status (active/inactive)
  - View organization details

- **Organization Statistics**:
  - Total templates uploaded
  - Total certificates generated
  - Number of team members
  - Last activity date

**Table Columns**:
```
| Logo | Name | Owner | Members | Templates | Certificates | Created | Status | Actions |
```

**Actions**:
- View Details
- Edit Organization
- Toggle Active/Inactive Status
- View Members

---

#### 3. Admin Activity
**Route**: `/superadmin/activity`

**Features**:
- **Activity Log Table**:
  - User name and email
  - Organization name
  - Activity type
  - Timestamp (date and time)
  - IP Address
  - User Agent (browser/device)
  - Additional details (template name, certificate ID, etc.)

- **Activity Types Tracked**:
  - `login` - User login
  - `logout` - User logout
  - `template_upload` - Template uploaded
  - `template_edit` - Template edited
  - `template_delete` - Template deleted
  - `certificate_generate` - Single certificate generated
  - `certificate_bulk_generate` - Bulk certificates generated
  - `certificate_send` - Certificate sent via email
  - `certificate_delete` - Certificate deleted
  - `profile_update` - User profile updated
  - `password_change` - Password changed

- **Filters & Search**:
  - Search by user name or email
  - Filter by organization
  - Filter by activity type
  - Filter by date range (from/to)
  - Sort by timestamp (newest/oldest)

- **Export**:
  - Export activity log as CSV
  - Filter before export
  - Includes all visible columns

- **Real-time Updates**:
  - Activities appear in real-time (auto-refresh)
  - Latest activities shown at top

**Table Columns**:
```
| Timestamp | User | Organization | Activity Type | IP Address | Details | User Agent |
```

**Example Activity Entry**:
```
2026-03-31 10:30:45 | John Doe (john@abc.com) | ABC Academy | certificate_generate | 192.168.1.1 | Certificate ID: CERT-2026-12345 | Chrome/MacOS
```

---

### Superadmin Sidebar Navigation
```
- Overview
- Organizations
- Admin Activity
- [Logout]
```

---

## Organization Admin Module

### Authentication Pages

#### 1. Login Page
**Route**: `/auth/login`

**Fields**:
- Email (validated)
- Password

**Features**:
- Form validation
- Error handling
- Success redirect based on role:
  - Superadmin → `/superadmin/overview`
  - Organization users → `/organization/dashboard`
- Link to registration page
- Link back to home

**NO Forgot Password link** (as per your requirement, but the system has user.role-based forgot password available)

---

#### 2. Registration Page
**Route**: `/auth/register`

**Fields**:
- Full Name
- Email Address
- Password
- Organization Name (optional - defaults to "{Name}'s Organization")

**Process**:
1. User fills registration form
2. System creates new organization
3. System creates user with `orgRole: 'owner'`
4. Redirect to login with success message

**Features**:
- Client-side validation
- Email format validation
- Password strength validation
- Username validation
- Link to login page

---

#### 3. Forgot Password (Future Enhancement)
**Route**: `/auth/forgot-password`

**Process**:
1. User enters email
2. System sends reset link via email
3. User clicks link and resets password
4. Redirect to login

---

### Organization Dashboard

#### Main Layout
```
┌─────────────┬────────────────────────────────────────┐
│             │                                        │
│   Sidebar   │          Main Content Area            │
│             │                                        │
└─────────────┴────────────────────────────────────────┘
```

---

### Sidebar Navigation (Organization Users)

**Routes**:
```
- Dashboard              → /organization/dashboard
- Profile                → /organization/profile
- Templates              → /organization/templates (add, edit, view all)
- Certificates           → /organization/certificates (generate, view, send)
- Roles & Users          → /organization/roles (create roles, create users, assign roles)
- Activity               → /organization/activity (organization activity logs)
- [Logout]
```

**Navigation Details**:
- **Dashboard**: Overview statistics and quick actions
- **Profile**: User profile management
- **Templates**: Unified page for all template operations (upload, edit, view table)
- **Certificates**: Unified page for all certificate operations (generate single/bulk, view table, send email)
- **Roles & Users**: Create custom roles, create users, assign/change user roles
- **Activity**: View organization-level user activity and export logs

---

## Dashboard

### Overview Dashboard
**Route**: `/organization/dashboard`

**Displays**:
- Welcome message with user name
- Quick statistics cards:
  - Total Templates
  - Total Certificates Generated
  - Certificates Generated This Month
  - Recent Activity
- Quick action buttons:
  - Upload New Template
  - Generate Certificate
- Recent certificates table (last 10)

**UI Components**:
```
┌─────────────────────────────────────────────────────────┐
│  Welcome, [User Name]!                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [📄 Templates: 12]  [📋 Total Certs: 340]            │
│  [📊 This Month: 45]  [⏰ Last Generated: 2h ago]      │
│                                                         │
│  [+ Upload Template]  [+ Generate Certificate]         │
│                                                         │
│  Recent Certificates:                                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │ ID    │ Template │ Recipient │ Date   │ Actions │  │
│  │ ...   │ ...      │ ...       │ ...    │ ...     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Profile Management

### User Profile
**Route**: `/organization/profile`

**Features**:
- View and edit user information:
  - Name
  - Email (view only, cannot change)
  - Role display (view only)
  - Organization name (view only)
- Change password:
  - Current password
  - New password
  - Confirm new password
- Profile picture upload (optional future enhancement)

**Profile Form**:
```
User Information:
- Name: [Input - editable]
- Email: john@example.com (read-only)
- Role: Admin (read-only)
- Organization: ABC Academy (read-only)

[Update Profile]

Change Password:
- Current Password: [Input]
- New Password: [Input]
- Confirm Password: [Input]

[Change Password]
```

---

## Template Management

### Templates Page (Unified)
**Route**: `/organization/templates`

**All Features in One Page**:
1. Upload new template (top section)
2. View all templates (table/grid view)
3. Edit template inline or modal
4. Delete template

---

#### 1. Upload Template Section

#### 1. Upload Template Section

**Features**:
- **File Upload**:
  - Accepts `.docx` files only
  - File size limit: 10MB
  - Template name (auto-filled from filename, editable)
  - Drag & drop or click to upload
  
- **Template Processing**:
  1. Upload `.docx` file
  2. System extracts placeholders (e.g., `{{name}}`, `{{date}}`, `{{certificateId}}`)
  3. Generate thumbnail preview (first page as PNG)
  4. Store in local filesystem or AWS S3
  5. Save template metadata to database

- **Placeholder Detection**:
  - System automatically detects `{{placeholder}}` syntax
  - Lists all detected placeholders for review
  - Special placeholders:
    - `{{QR_CODE}}` - Auto-generates QR code for verification
    - `{{CERTIFICATE_ID}}` - Auto-generates unique ID
    - `{{DATE}}` - Current date

---

#### 2. Templates Table View
#### 2. Templates Table View

**Displays All Templates**:
- Template name
- Thumbnail preview
- Number of placeholders
- Date uploaded
- Status (Enabled/Disabled)
- Actions (Edit, Delete, Generate Certificate)

**Table Columns**:
```
| Thumbnail | Template Name | Placeholders | Uploaded | Status | Actions |
```

**Actions**:
- **Edit**: Edit template name, enable/disable
- **Delete**: Remove template (with confirmation)
- **Generate**: Quick link to generate certificate using this template
- **Preview**: View template details and placeholders

**Features**:
- Search templates by name
- Filter by status (active/inactive)
- Sort by date, name

---

## Certificate Management

### Certificates Page (Unified)
**Route**: `/organization/certificates`

**All Features in One Page**:
1. Generate certificate (single or bulk) - top section with tabs
2. View all generated certificates (table view)
3. Send certificate via email
4. Download certificate

---

#### 1. Generate Certificate Section

**Two Tabs**:
- **Single Certificate**: Generate one certificate
- **Bulk Generation**: Generate multiple certificates from CSV/Excel

##### Tab A: Single Certificate Generation

##### Tab A: Single Certificate Generation

**Process**:
1. **Select Template**: Dropdown with all available templates
2. **Fill Placeholder Values**: Dynamic form based on template placeholders
   - Text inputs for each placeholder
   - Date picker for date fields
3. **Auto-Generated Fields**:
   - `CERTIFICATE_ID`: Unique ID (e.g., `CERT-2026-XXXXX`)
   - `QR_CODE`: QR code containing verification URL
   - `DATE`: Current date
4. **Generate**: Create PDF with filled values
5. **Actions After Generation**:
   - Download PDF
   - Send via email (inline button)

**Form Layout**:
```
Select Template: [Dropdown]

Certificate Data:
- Name: [Input]
- Course: [Input]
- Date: [Date Picker]
(... other placeholders ...)

[Generate Certificate]
```

**Send After Generate (SMTP)**:
- Option to enable `Send via SMTP after generate`
- Enter recipient email, subject, and optional message before generating
- After PDF generation, system sends certificate automatically via SMTP
- Show delivery status as `Sent` or `Failed`

---

##### Tab B: Bulk Certificate Generation

##### Tab B: Bulk Certificate Generation

**Process**:
1. **Select Template**: Choose template
2. **Upload Data**:
   - CSV file upload
   - Excel file upload (.xlsx)
   - Column mapping to placeholders
3. **Validation**:
   - Check all required placeholders are mapped
   - Validate data types
   - Show preview of first few rows
4. **Generate**:
   - Process all rows
   - Generate individual PDFs
   - Show progress bar
   - Option to generate as ZIP file
5. **Actions**:
   - Download all as ZIP
   - Send all via email (batch)

**CSV Format Example**:
```csv
name,course,date,grade
John Doe,Web Development,2026-01-15,A+
Jane Smith,Data Science,2026-01-15,A
...
```

**Bulk Generation UI**:
```
Step 1: Select Template
Step 2: Upload Data File (CSV/Excel)
Step 3: Map Columns to Placeholders
Step 4: Preview & Confirm
Step 5: Generate Certificates

Progress: [====================] 85/100 certificates
```

**Bulk SMTP Option**:
- Optional `Send all via SMTP after generation`
- Uses recipient email from uploaded data file
- Shows per-certificate delivery status in results table

---

#### 2. Certificates Table View

**Displays All Generated Certificates**:
#### 2. Certificates Table View

**Displays All Generated Certificates**:
- Certificate ID
- Template used
- Recipient name (extracted from data)
- Generation date
- Generated by (user)
- Actions (View, Download, Send Email, Delete)

**Table Columns**:
```
| Certificate ID | Template | Recipient | Generated By | Date | Actions |
```

**Actions**:
- **View PDF**: Open in browser
- **Download PDF**: Download to device
- **Send via Email**: Send certificate via SMTP with form:
  - Recipient Email
  - Subject (pre-filled)
  - Message (optional)
- **Copy Verification Link**: Copy verification URL to clipboard
- **Delete**: Remove certificate

**Filters & Search**:
- Search by certificate ID, recipient name
- Filter by template
- Filter by date range
- Filter by generated user

**Bulk Actions**:
- Select multiple certificates
- Bulk download as ZIP
- Bulk send via email
- Bulk delete

---

## Role-Based Access Page

### Roles & Users (Unified)
**Route**: `/organization/roles`

**Section A - Create Roles**
- Create custom role name (example: `Certificate Manager`, `Viewer`, `Editor`)
- Select permissions from checklist:
  - Dashboard view
  - Template add/edit/view/delete
  - Certificate generate/view/send/delete
  - Profile update
  - Activity view/export
- Edit existing roles
- Delete custom roles (protected system roles cannot be deleted)

**Section B - Assign Roles to Users**
- Create new users in organization
- Assign any custom role to user
- Change user role anytime
- Activate/deactivate users
- Search users by name or email

**Access Rules**:
- Owner can create/assign all roles
- Admin can create/assign roles based on policy
- Member cannot create roles or assign roles

---

## Organization Activity Page

### Activity
**Route**: `/organization/activity`

**Features**:
- Activity table with:
  - User name/email
  - Action type
  - Timestamp
  - IP address
  - Details (template name, certificate ID)
- Filters:
  - By user
  - By action type
  - By date range
- Export filtered activity as CSV

**Common Action Types**:
- login
- logout
- template_upload
- template_edit
- template_delete
- certificate_generate
- certificate_bulk_generate
- certificate_send
- certificate_delete
- profile_update
- password_change

---

## Certificate Verification System

**QR Code Content**:
```
https://verifycerts.com/verify/{CERTIFICATE_ID}
```

**Generation**:
- QR code generated using `qrcode` library
- Embedded in PDF at `{{QR_CODE}}` placeholder
- High error correction level for scanning reliability

---

### 2. Public Verification Page
**Route**: `/verify` (public, no authentication)

**Two Methods**:

#### Method A: Scan QR Code
- User scans QR code with mobile device
- Redirects to verification page with certificate ID
- Displays verification result

#### Method B: Manual ID Entry
- User visits `/verify`
- Enters certificate ID manually
- Displays verification result

**Verification UI**:
```
┌─────────────────────────────────────┐
│    Verify Certificate               │
├─────────────────────────────────────┤
│                                     │
│  Enter Certificate ID:              │
│  [_________________________]        │
│                                     │
│  [Verify]                          │
│                                     │
│  - OR -                            │
│                                     │
│  Scan QR Code:                     │
│  [QR Scanner UI]                   │
│                                     │
└─────────────────────────────────────┘
```

**Verification Result (Valid)**:
```
✓ Certificate is Valid

Certificate ID: CERT-2026-12345
Issued to: John Doe
Course: Web Development
Issue Date: January 15, 2026
Issued by: ABC Academy

[View Full Certificate] [Download PDF]
```

**Verification Result (Invalid)**:
```
✗ Certificate Not Found

The certificate ID you entered does not exist in our system.
Please check the ID and try again.
```

**Backend Verification Process**:
1. Receive certificate ID from request
2. Query database for document with matching `uniqueId`
3. If found, return certificate details (without sensitive data)
4. If not found, return error
5. Log verification attempt

---

## Role-Based Access Control (RBAC)

### Permission Matrix

| Feature                     | Superadmin | Org Owner | Org Admin | Org Member |
|-----------------------------|------------|-----------|-----------|------------|
| View all organizations      | ✓          | ✗         | ✗         | ✗          |
| Create organization         | ✓          | ✗         | ✗         | ✗          |
| Edit any organization       | ✓          | ✗         | ✗         | ✗          |
| View admin activity         | ✓          | ✗         | ✗         | ✗          |
| Export activity logs        | ✓          | ✗         | ✗         | ✗          |
| View dashboard              | ✗          | ✓         | ✓         | ✓          |
| View/edit profile           | ✗          | ✓         | ✓         | ✓          |
| Upload templates            | ✗          | ✓         | ✓         | ✗          |
| View templates              | ✗          | ✓         | ✓         | ✓          |
| Edit templates              | ✗          | ✓         | ✓         | ✗          |
| Delete templates            | ✗          | ✓         | ✓         | ✗          |
| Generate certificates       | ✗          | ✓         | ✓         | ✗          |
| View certificates           | ✗          | ✓         | ✓         | ✓          |
| Send certificates via email | ✗          | ✓         | ✓         | ✗          |
| Delete certificates         | ✗          | ✓         | ✓         | ✗          |
| Create custom roles         | ✗          | ✓         | ✓         | ✗          |
| Assign roles to users       | ✗          | ✓         | ✓         | ✗          |
| Create organization users   | ✗          | ✓         | ✓         | ✗          |
| View organization activity  | ✗          | ✓         | ✓         | ✓          |
| Export organization activity| ✗          | ✓         | ✓         | ✗          |

---

## Authentication & Authorization

### JWT Token Structure

**Payload**:
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "role": "user",
  "orgRole": "admin",
  "organization": "507f1f77bcf86cd799439012",
  "iat": 1234567890,
  "exp": 1234654290
}
```

**Token Expiration**: 24 hours

---

### Middleware Authentication

#### 1. Auth Middleware (`auth.js`)
**Purpose**: Verify JWT token and attach user data to request

**Process**:
1. Extract token from `Authorization: Bearer <token>`
2. Verify token with JWT secret
3. Decode payload
4. Attach `req.user` with user data
5. Continue to next middleware

**Error Handling**:
- No token: 401 Unauthorized
- Invalid token: 401 Unauthorized
- Expired token: 401 Unauthorized

---

#### 2. Tenant Scope Middleware (`tenantScope.js`)
**Purpose**: Enforce multi-tenant data isolation

**Process**:
1. Check if user is superadmin
   - If yes: Allow access to all organizations (no filter)
   - If no: Restrict to user's organization only
2. Attach `req.organizationId` to request
3. Provide `req.tenantFilter()` for database queries
4. Set `req.isSuperAdmin` flag

**Usage in Controllers**:
```javascript
// Automatically filters by organization
const templates = await Template.find(req.tenantFilter());

// For superadmins, tenantFilter() returns {}
// For org users, tenantFilter() returns { organization: orgId }
```

---

### Password Reset Flow (Optional)

**Implementation**:
1. User clicks "Forgot Password"
2. Enter email
3. System generates reset token (JWT with short expiration)
4. Send email with reset link
5. User clicks link → Redirect to reset page with token
6. User enters new password
7. Verify token and update password
8. Redirect to login

---

## Database Schema

### 1. User Model
```javascript
{
  name: String (required),
  email: String (required, unique, validated),
  password: String (required, hashed),
  role: String (enum: ['superadmin', 'admin', 'user'], default: 'user'),
  orgRole: String (enum: ['owner', 'admin', 'member'], default: 'member'),
  organization: ObjectId (ref: Organization),
  isActive: Boolean (default: true),
  createdAt: Date (default: now)
}
```

**Indexes**:
- `email` (unique)

**Hooks**:
- Pre-save: Hash password with bcrypt

---

### 2. Organization Model
```javascript
{
  name: String (required),
  slug: String (required, unique, lowercase),
  logoUrl: String (default: ''),
  owner: ObjectId (ref: User, required),
  isActive: Boolean (default: true),
  createdAt: Date (default: now)
}
```

**Indexes**:
- `slug` (unique)

**Hooks**:
- Pre-validate: Auto-generate slug from name

---

### 3. Template Model
```javascript
{
  name: String (required),
  filePath: String (required),      // Local path or fallback
  s3Key: String,                     // S3 object key (if using AWS)
  thumbnailPath: String,             // Preview image path
  placeholders: [String],            // Array of placeholder names
  organization: ObjectId (ref: Organization, required),
  enabled: Boolean (default: true),
  createdAt: Date (default: now)
}
```

**Indexes**:
- Compound: `{ name: 1, organization: 1 }` (unique)

**Multi-Tenancy**:
- Templates are scoped to organization
- Unique template names per organization

---

### 4. Document Model
```javascript
{
  uniqueId: String (required, unique),            // e.g., CERT-2026-12345
  data: Map (of Mixed),                           // Filled placeholder values
  filePath: String,                               // Generated PDF path
  template: ObjectId (ref: Template),
  organization: ObjectId (ref: Organization, required),
  createdBy: ObjectId (ref: User),
  createdAt: Date (default: now)
}
```

**Indexes**:
- `uniqueId` (unique)
- `organization` (for tenant filtering)

**Data Field Example**:
```json
{
  "name": "John Doe",
  "course": "Web Development",
  "date": "2026-01-15",
  "QR_CODE": "<base64-image>",
  "CERTIFICATE_ID": "CERT-2026-12345"
}
```

---

### 5. Activity Model
```javascript
{
  userId: ObjectId (ref: User, required),
  organization: ObjectId (ref: Organization),  // null for superadmin actions
  type: String (enum: [
    'login',
    'logout',
    'template_upload',
    'template_edit',
    'template_delete',
    'certificate_generate',
    'certificate_bulk_generate',
    'certificate_send',
    'certificate_delete',
    'profile_update',
    'password_change'
  ], required),
  ipAddress: String,
  userAgent: String,
  metadata: Object (additional data like certificateId, templateName, etc.),
  createdAt: Date (default: now)
}
```

**Indexes**:
- `userId` (for user activity lookup)
- `organization` (for organization filtering)
- `type` (for activity type filtering)
- `createdAt` (for date range queries)
- Compound: `{ organization: 1, createdAt: -1 }` (for efficient organization activity lookup)

**Metadata Field Examples**:
```javascript
// For certificate_generate
{
  certificateId: "CERT-2026-12345",
  templateName: "Completion Certificate",
  recipientEmail: "john@example.com"
}

// For template_upload
{
  templateId: "507f1f77bcf86cd799439014",
  templateName: "New Certificate Template",
  placeholderCount: 5
}

// For certificate_bulk_generate
{
  count: 50,
  templateName: "Completion Certificate"
}
```

---

### 6. OrgOtp Model (for email verification/reset)
```javascript
{
  email: String (required),
  otp: String (required),
  expiresAt: Date (required),
  createdAt: Date (default: now)
}
```

---

## API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/api/auth/register`
**Description**: Register new user and create organization (or join existing)

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "organizationName": "ABC Academy" // Optional
}
```

**Response**:
```json
{
  "success": true,
  "message": "Registration successful"
}
```

---

#### POST `/api/auth/login`
**Description**: Authenticate user and return JWT token

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "orgRole": "owner",
    "organization": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "ABC Academy",
      "slug": "abc-academy"
    }
  }
}
```

---

#### POST `/api/auth/logout`
**Description**: Logout user (client removes token)

**Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Superadmin Routes (`/api/superadmin`)

#### GET `/api/superadmin/organizations`
**Description**: Get all organizations (superadmin only)

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
{
  "success": true,
  "organizations": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "ABC Academy",
      "slug": "abc-academy",
      "owner": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00.000Z",
      "stats": {
        "members": 5,
        "templates": 12,
        "certificates": 450
      }
    }
  ]
}
```

---

#### POST `/api/superadmin/organizations`
**Description**: Create new organization and owner user

**Request Body**:
```json
{
  "name": "XYZ University",
  "ownerEmail": "owner@xyz.edu",
  "ownerName": "Jane Smith"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Organization created successfully",
  "organization": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "XYZ University",
    "slug": "xyz-university"
  }
}
```

**Backend Process**:
1. Create organization
2. Create user with `orgRole: 'owner'`
3. Send email to owner with login credentials
4. Return success

---

#### PUT `/api/superadmin/organizations/:id`
**Description**: Update organization details

**Request Body**:
```json
{
  "name": "XYZ University (Updated)",
  "isActive": false
}
```

**Response**:
```json
{
  "success": true,
  "organization": { /* updated org */ }
}
```

---

#### GET `/api/superadmin/stats`
**Description**: Get platform-wide statistics

**Response**:
```json
{
  "success": true,
  "stats": {
    "totalOrganizations": 25,
    "totalTemplates": 150,
    "totalCertificates": 5420,
    "totalUsers": 180
  }
}
```

---

#### GET `/api/superadmin/activity`
**Description**: Get all admin activity logs (superadmin only)

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `search` (optional): Search by user name or email
- `organizationId` (optional): Filter by organization
- `activityType` (optional): Filter by activity type
- `startDate` (optional): Filter from date (ISO format)
- `endDate` (optional): Filter to date (ISO format)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response**:
```json
{
  "success": true,
  "activities": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "userId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "organization": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "ABC Academy"
      },
      "type": "certificate_generate",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...",
      "metadata": {
        "certificateId": "CERT-2026-12345",
        "templateName": "Completion Certificate"
      },
      "createdAt": "2026-03-31T10:30:45.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439021",
      "userId": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "organization": {
        "_id": "507f1f77bcf86cd799439014",
        "name": "XYZ University"
      },
      "type": "login",
      "ipAddress": "192.168.1.2",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
      "createdAt": "2026-03-31T09:15:22.000Z"
    }
  ],
  "pagination": {
    "total": 1250,
    "page": 1,
    "limit": 50,
    "totalPages": 25
  }
}
```

---

#### GET `/api/superadmin/activity/export`
**Description**: Export activity logs as CSV

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**: Same as GET `/api/superadmin/activity`

**Response**: CSV file download

**CSV Format**:
```csv
Timestamp,User Name,User Email,Organization,Activity Type,IP Address,Details,User Agent
2026-03-31 10:30:45,John Doe,john@example.com,ABC Academy,certificate_generate,192.168.1.1,Certificate ID: CERT-2026-12345,Chrome/MacOS
2026-03-31 09:15:22,Jane Smith,jane@example.com,XYZ University,login,192.168.1.2,,Chrome/Windows
...
```

---

### Template Routes (`/api/organization/templates`)

#### GET `/api/organization/templates`
**Description**: Get all templates for user's organization

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
{
  "success": true,
  "templates": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Completion Certificate",
      "placeholders": ["name", "course", "date", "QR_CODE", "CERTIFICATE_ID"],
      "thumbnailPath": "/uploads/thumbnails/abc123.png",
      "enabled": true,
      "createdAt": "2026-01-10T00:00:00.000Z"
    }
  ]
}
```

---

#### POST `/api/organization/templates`
**Description**: Upload new template

**Request**: Multipart form-data
- `file`: .docx file
- `name`: Template name

**Response**:
```json
{
  "success": true,
  "message": "Template uploaded successfully",
  "template": {
    "_id": "507f1f77bcf86cd799439014",
    "name": "Completion Certificate",
    "placeholders": ["name", "course", "date"]
  }
}
```

**Backend Process**:
1. Validate file type (.docx)
2. Save file to local storage or S3
3. Extract placeholders using `docxtemplater`
4. Generate thumbnail preview
5. Save template to database
6. Return template data

---

#### DELETE `/api/organization/templates/:id`
**Description**: Delete template

**Response**:
```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

---

### Certificate Generation Routes (`/api/organization/documents`)

#### POST `/api/organization/documents/generate`
**Description**: Generate single certificate

**Request Body**:
```json
{
  "templateId": "507f1f77bcf86cd799439014",
  "data": {
    "name": "John Doe",
    "course": "Web Development",
    "date": "2026-01-15"
  },
  "sendEmail": true,
  "recipientEmail": "john@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "document": {
    "_id": "507f1f77bcf86cd799439015",
    "uniqueId": "CERT-2026-12345",
    "filePath": "/uploads/certificates/cert-12345.pdf",
    "downloadUrl": "https://verifycerts.com/download/cert-12345.pdf"
  }
}
```

**Backend Process**:
1. Validate template exists
2. Generate unique certificate ID
3. Generate QR code with verification URL
4. Fill template with data using `docxtemplater`
5. Convert to PDF using `puppeteer`
6. Add QR code to PDF using `pdf-lib`
7. Save PDF to storage
8. Save document metadata to database
9. Send email if requested
10. Return document data

---

#### POST `/api/organization/documents/bulk-generate`
**Description**: Generate multiple certificates from CSV/Excel

**Request**: Multipart form-data
- `file`: CSV or Excel file
- `templateId`: Template ID

**Response**:
```json
{
  "success": true,
  "message": "Generated 50 certificates",
  "documents": [ /* array of generated documents */ ],
  "zipUrl": "https://verifycerts.com/download/bulk-2026-01-15.zip"
}
```

**Backend Process**:
1. Parse CSV/Excel file
2. Validate all required placeholders are present
3. Loop through each row:
   - Generate certificate
   - Save to database
4. Create ZIP file of all PDFs
5. Return ZIP download URL

---

#### GET `/api/organization/documents`
**Description**: Get all generated certificates for organization

**Response**:
```json
{
  "success": true,
  "documents": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "uniqueId": "CERT-2026-12345",
      "data": {
        "name": "John Doe",
        "course": "Web Development"
      },
      "template": {
        "name": "Completion Certificate"
      },
      "createdBy": {
        "name": "Admin User"
      },
      "createdAt": "2026-01-15T00:00:00.000Z"
    }
  ]
}
```

---

#### POST `/api/organization/documents/:id/send-email`
**Description**: Send certificate via email

**Request Body**:
```json
{
  "recipientEmail": "john@example.com",
  "subject": "Your Completion Certificate",
  "message": "Congratulations on completing the course!"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Certificate sent successfully"
}
```

---

### Verification Routes (`/api/verify`) - PUBLIC

#### GET `/api/verify/:certificateId`
**Description**: Verify certificate by ID (public endpoint, no auth required)

**Response (Valid)**:
```json
{
  "success": true,
  "valid": true,
  "certificate": {
    "uniqueId": "CERT-2026-12345",
    "issuedTo": "John Doe",
    "course": "Web Development",
    "issueDate": "2026-01-15",
    "issuedBy": "ABC Academy"
  }
}
```

**Response (Invalid)**:
```json
{
  "success": false,
  "valid": false,
  "message": "Certificate not found"
}
```

---

### Organization Routes (`/api/organization`)

#### GET `/api/organization/dashboard`
**Description**: Get dashboard statistics

**Response**:
```json
{
  "success": true,
  "stats": {
    "totalTemplates": 12,
    "totalCertificates": 340,
    "certificatesThisMonth": 45,
    "recentCertificates": [
      {
        "uniqueId": "CERT-2026-12345",
        "template": "Completion Certificate",
        "createdAt": "2026-03-30T10:00:00.000Z"
      }
    ]
  }
}
```

---

#### GET `/api/organization/profile`
**Description**: Get user profile

**Response**:
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin",
    "orgRole": "owner",
    "organization": {
      "name": "ABC Academy",
      "slug": "abc-academy"
    }
  }
}
```

---

#### PUT `/api/organization/profile`
**Description**: Update user profile

**Request Body**:
```json
{
  "name": "John Doe Updated"
}
```

---

#### PUT `/api/organization/profile/password`
**Description**: Change password

**Request Body**:
```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass456"
}
```

---

### Roles & Users Routes (`/api/organization/roles`, `/api/organization/users`)

#### GET `/api/organization/roles`
**Description**: Get all roles in organization

#### POST `/api/organization/roles`
**Description**: Create custom role with permission set

**Request Body**:
```json
{
  "name": "Certificate Manager",
  "permissions": [
    "dashboard.view",
    "templates.view",
    "certificates.generate",
    "certificates.send"
  ]
}
```

#### PUT `/api/organization/roles/:roleId`
**Description**: Update role name or permissions

#### DELETE `/api/organization/roles/:roleId`
**Description**: Delete custom role

#### GET `/api/organization/users`
**Description**: Get organization users and assigned roles

#### POST `/api/organization/users`
**Description**: Create organization user

#### PUT `/api/organization/users/:userId/role`
**Description**: Assign or change user role

#### PUT `/api/organization/users/:userId/status`
**Description**: Activate/deactivate organization user

---

### Organization Activity Routes (`/api/organization/activity`)

#### GET `/api/organization/activity`
**Description**: Get organization activity logs

**Query Parameters**:
- `search` (optional)
- `type` (optional)
- `startDate` (optional)
- `endDate` (optional)
- `page` (optional)
- `limit` (optional)

#### GET `/api/organization/activity/export`
**Description**: Export organization activity logs as CSV

---

## Email Notifications

### Email Service Configuration
**Library**: Nodemailer
**SMTP Settings**: Configured via environment variables

---

### Email Templates

#### 1. Organization Owner Welcome Email
**Triggered**: When superadmin creates organization

**Subject**: Welcome to VerifyCerts - Your Organization is Ready!

**Content**:
```
Hi [Owner Name],

Your organization "[Organization Name]" has been successfully created on VerifyCerts!

Your login credentials:
Email: [Owner Email]
Temporary Password: [Generated Password]

Please log in and change your password immediately:
https://verifycerts.com/auth/login

Best regards,
VerifyCerts Team
```

---

#### 2. Certificate Email
**Triggered**: When certificate is generated and email option is selected

**Subject**: Your Certificate from [Organization Name]

**Content**:
```
Hi [Recipient Name],

Congratulations! Your certificate is ready.

Certificate Details:
- Certificate ID: [CERT-ID]
- Course/Event: [Course Name]
- Issue Date: [Date]

You can download your certificate here:
[Download Link]

To verify your certificate, scan the QR code or visit:
https://verifycerts.com/verify/[CERT-ID]

Best regards,
[Organization Name]
```

**Attachments**:
- PDF certificate file

---

#### 3. Password Reset Email (Optional)
**Triggered**: When user requests password reset

**Subject**: Reset Your VerifyCerts Password

**Content**:
```
Hi [Name],

We received a request to reset your password.

Click here to reset your password:
[Reset Link]

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
VerifyCerts Team
```

---

## File Storage

### Storage Options

#### 1. Local File Storage (Development/Fallback)
**Path Structure**:
```
/uploads
  /templates
    /orgId
      template-id.docx
  /thumbnails
    /orgId
      template-id.png
  /certificates
    /orgId
      cert-id.pdf
```

---

#### 2. AWS S3 Storage (Production)
**Bucket Structure**:
```
verifycerts-bucket/
  templates/
    {orgId}/
      {templateId}.docx
  thumbnails/
    {orgId}/
      {templateId}.png
  certificates/
    {orgId}/
      {certId}.pdf
```

**Configuration**:
- Environment variables: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET_NAME`
- Library: `@aws-sdk/client-s3`
- Presigned URLs for secure downloads

---

## Environment Variables

### Server `.env` File
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/verifycerts

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Superadmin Credentials (for seeding)
ADMIN_EMAIL=admin@verifycerts.com
ADMIN_PASSWORD=SuperSecure123!

# SMTP (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BUCKET_NAME=verifycerts-storage
AWS_REGION=us-east-1

# Frontend URL (for emails)
FRONTEND_URL=https://verifycerts.com
```

---

### Client `.env.local` File
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Security Considerations

### 1. Password Security
- Passwords hashed with bcrypt (salt rounds: 10)
- Minimum password requirements enforced
- No password stored in plain text

### 2. JWT Security
- Tokens signed with strong secret
- 24-hour expiration
- Secure token storage (httpOnly cookies or localStorage with XSS protection)

### 3. Multi-Tenancy Data Isolation
- All database queries filtered by organization
- Middleware enforces tenant scoping
- Superadmins explicitly bypass filters

### 4. File Upload Security
- File type validation (only .docx)
- File size limits enforced
- Malicious file scanning (optional)
- Uploaded files stored with random names

### 5. API Rate Limiting (Recommended)
- Implement rate limiting on sensitive endpoints
- Example: 100 requests per minute per IP

### 6. Input Validation
- All inputs validated and sanitized
- Email format validation
- SQL/NoSQL injection prevention (Mongoose handles this)

### 7. CORS Configuration
- Restrict CORS to trusted domains
- Configure in `cors.config.js`

---

## Deployment Considerations

### Production Checklist

1. **Environment Variables**:
   - Set strong JWT secret
   - Configure production database
   - Set up SMTP for emails
   - Configure AWS S3 credentials

2. **Database**:
   - Use MongoDB Atlas or self-hosted MongoDB
   - Enable authentication
   - Configure backups

3. **File Storage**:
   - Use AWS S3 for scalability
   - Configure CDN for faster downloads

4. **Server**:
   - Use PM2 for process management
   - Enable HTTPS
   - Configure reverse proxy (Nginx)

5. **Client**:
   - Build Next.js for production: `npm run build`
   - Serve with optimized settings
   - Enable CDN for static assets

6. **Monitoring**:
   - Set up error logging (e.g., Sentry)
   - Monitor server performance
   - Track API usage

---

## Testing Strategy

### Unit Tests
- Test individual functions (e.g., placeholder extraction, QR generation)
- Test API route handlers
- Test middleware (auth, tenant scope)

### Integration Tests
- Test end-to-end flows:
  - User registration → Login → Upload template → Generate certificate
  - Superadmin creates org → Owner logs in → Uploads template
  - Certificate verification flow

### Manual Testing Checklist
- [ ] Superadmin can create organization
- [ ] Organization owner receives email and can log in
- [ ] Owner can upload template and see placeholders
- [ ] Owner can generate single certificate
- [ ] Owner can generate bulk certificates from CSV
- [ ] Owner can send certificate via SMTP immediately after generate
- [ ] Generated certificate has QR code
- [ ] QR code verification works
- [ ] Manual verification by ID works
- [ ] Certificate email is sent correctly
- [ ] Owner/Admin can create custom roles
- [ ] Owner/Admin can assign roles to organization users
- [ ] Owner/Admin can view organization activity logs
- [ ] Admin can upload templates and generate certificates
- [ ] Member with restricted access cannot access forbidden pages
- [ ] Logout works correctly
- [ ] Multi-tenancy: users from Org A cannot see Org B data

---

## Future Enhancements

### Phase 2 Features
1. **Advanced RBAC**:
   - Granular permission system
   - Custom roles with specific permissions
   - Permission management UI

2. **Certificate Templates Marketplace**:
   - Pre-designed templates available to all organizations
   - Template categories (education, corporate, events)

3. **Certificate Analytics**:
   - Track certificate views
   - Track verification attempts
   - Dashboard with charts

4. **API Access**:
   - Public API for third-party integrations
   - API key management
   - Webhook notifications

5. **Mobile App**:
   - Mobile app for scanning QR codes
   - Certificate wallet

6. **Certificate Revocation**:
   - Ability to revoke certificates
   - Display revocation status on verification page

7. **Batch Email Scheduling**:
   - Schedule bulk email sending
   - Email delivery tracking

8. **Template Designer**:
   - Visual template editor
   - Drag-and-drop placeholder insertion
   - No need to upload .docx files

9. **Multi-Language Support**:
   - Internationalization (i18n)
   - Support multiple languages

10. **Blockchain Integration** (Advanced):
    - Store certificate hashes on blockchain
    - Immutable verification

---

## Development Workflow

### Initial Setup

1. **Clone Repository**:
   ```bash
   git clone <repository-url>
   cd VerifyCerts/VerifyCert2
   ```

2. **Install Dependencies**:
   ```bash
   # Server
   cd server
   npm install

   # Client
   cd ../client
   npm install
   ```

3. **Configure Environment Variables**:
   - Copy `.env.example` to `.env` in server folder
   - Update with your credentials

4. **Start MongoDB**:
   ```bash
   # Local MongoDB
   mongod

   # Or use MongoDB Atlas (update MONGODB_URI in .env)
   ```

4. **Start Development Servers**:
   ```bash
   # Server (from server folder)
   npm run dev

   # Client (from client folder)
   npm run dev
   ```

5. **Access Application**:
   - Client: http://localhost:3000
   - Server API: http://localhost:5000/api

---

### Development Guidelines

1. **Code Structure**:
   - Follow existing folder structure
   - Keep controllers thin, move logic to services
   - Reusable components in `/components/common`

2. **API Development**:
   - All organization routes use tenant scope middleware
   - Return consistent JSON responses
   - Use proper HTTP status codes

3. **Frontend Development**:
   - Use Next.js App Router (not Pages Router)
   - Keep components modular and reusable
   - Use Tailwind for styling (avoid custom CSS)

4. **Database Queries**:
   - Always use `req.tenantFilter()` for organization data
   - Use Mongoose populate for related data
   - Index frequently queried fields

5. **Error Handling**:
   - Catch all async errors
   - Return user-friendly error messages
   - Log detailed errors on server

---

## Summary

This document outlines the complete requirements for building VerifyCerts, a multi-tenant certificate generation and verification platform. Key features include:

1. **Superadmin Module**: Manage organizations, view statistics, create new organizations
2. **Organization Module**: 
   - **Dashboard**: Overview with statistics and quick actions
   - **Profile**: User profile management and password change
   - **Templates**: Unified page to upload, edit, view, and delete templates
   - **Certificates**: Unified page to generate (single/bulk), view, send via email, and manage certificates
3. **Verification System**: Public verification via QR code or manual ID entry
4. **Role-Based Access**: Superadmin, Owner, Admin, Member with defined permissions
5. **Email Notifications**: Organization owner welcome email, certificate delivery via SMTP
6. **Multi-Tenancy**: Complete data isolation between organizations

The platform is built with Node.js/Express backend, Next.js/React frontend, MongoDB database, and includes document processing, PDF generation, QR code integration, and SMTP email delivery.

---

## Contact & Support

For questions or clarifications during development, please contact:
- **Project Owner**: [Your Name/Contact]
- **Documentation Version**: 1.0
- **Last Updated**: March 31, 2026
