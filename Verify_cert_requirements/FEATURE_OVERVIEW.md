# VerifyCerts - Feature Overview

## Quick Summary
VerifyCerts is a platform where organizations can create and manage digital certificates with QR code verification.

---

## 🔴 SUPERADMIN SECTION

### Who is Superadmin?
- The main administrator who manages all organizations
- Login only (no registration, no forgot password)
- Credentials set in environment variables

---

### Superadmin Pages

#### 1. Overview Dashboard
**Route**: `/superadmin/overview`

**What you see:**
- Total number of organizations
- Total templates across all organizations  
- Total certificates generated across all organizations
- Recent activity from all organizations

**What you can do:**
- View overall platform statistics
- Quick overview of system usage

---

#### 2. Organizations Management
**Route**: `/superadmin/organizations`

**What you see:**
- Table of all organizations with:
  - Organization name
  - Organization logo
  - Owner name and email
  - Number of members
  - Number of templates
  - Number of certificates generated
  - Created date
  - Status (Active/Inactive)

**What you can do:**
- **Create New Organization**:
  - Enter organization name
  - Enter owner email
  - Enter owner name
  - System sends email to owner with login credentials
  
- **View Organization Details**:
  - See complete organization information
  - View statistics (templates, certificates, members)
  
- **Edit Organization**:
  - Update organization name
  - Change organization logo
  
- **Activate/Deactivate Organization**:
  - Toggle organization status
  - Inactive organizations cannot login

- **Search & Filter**:
  - Search organizations by name
  - Filter by status (active/inactive)
  - Sort by date, name, or statistics

---

#### 3. Admin Activity
**Route**: `/superadmin/activity`

**What you see:**
- Table of all admin activities across all organizations:
  - User name and email
  - Organization name
  - Action performed (Login, Logout, Template Upload, Certificate Generate, etc.)
  - Timestamp (date and time)
  - IP Address
  - User Agent (browser/device info)

**What you can do:**
- **View All Activities**: Monitor all actions performed by users
- **Search & Filter**:
  - Search by user name or email
  - Filter by organization
  - Filter by activity type (Login, Template Upload, Certificate Generate, etc.)
  - Filter by date range
- **Export Activity Log**: Download activity report as CSV
- **Real-time Monitoring**: See latest activities at the top

**Activity Types Tracked**:
- User Login
- User Logout
- Template Uploaded
- Template Deleted
- Certificate Generated (Single)
- Certificates Generated (Bulk)
- Certificate Sent via Email
- Certificate Deleted
- Profile Updated
- Password Changed

---

### Superadmin Navigation Menu
```
├── Overview
├── Organizations
├── Admin Activity
└── Logout
```

---

## 🔵 ORGANIZATION SECTION

### Who are Organization Users?
- **Owner**: First user, has full access, can manage everything
- **Admin**: Can create templates and certificates, no user management
- **Member**: Can only view (no create/edit/delete)

### Authentication
- Login page (yes)
- Registration page (yes)
- Forgot password (yes)

---

### Organization Pages

#### 1. Dashboard
**Route**: `/organization/dashboard`

**What you see:**
- Welcome message with your name
- Statistics cards:
  - Total templates created
  - Total certificates generated
  - Certificates generated this month
  - Last generated certificate time
- Quick action buttons (Upload Template, Generate Certificate)
- Recent certificates table (last 10 certificates)

**What you can do:**
- View your organization's statistics
- Quick access to common actions
- Monitor recent activity

---

#### 2. Profile
**Route**: `/organization/profile`

**What you see:**
- Your name (editable)
- Your email (view only)
- Your role (view only)
- Organization name (view only)
- Change password section

**What you can do:**
- Update your name
- Change your password:
  - Enter current password
  - Enter new password
  - Confirm new password

---

#### 3. Templates
**Route**: `/organization/templates`

**This page has everything for templates in one place**

**Section A - Upload New Template (Top of page)**

**What you see:**
- File upload area (drag & drop or click)
- Template name input field

**What you can do:**
- Upload .docx file (Word document)
- System automatically:
  - Detects placeholders like {{name}}, {{date}}, {{course}}
  - Creates thumbnail preview
  - Saves template

**Special Placeholders:**
- `{{QR_CODE}}` - Automatically generates QR code
- `{{CERTIFICATE_ID}}` - Automatically generates unique ID
- `{{DATE}}` - Automatically fills current date
- Any custom placeholder like {{name}}, {{course}}, {{grade}}, etc.

---

**Section B - All Templates Table (Below upload section)**

**What you see:**
- Table showing all your templates:
  - Thumbnail preview image
  - Template name
  - Number of placeholders
  - Upload date
  - Status (Active/Inactive)
  - Action buttons

**What you can do:**
- **View Template Details**: Click to see all placeholders
- **Edit Template**: 
  - Change template name
  - Enable/Disable template
- **Delete Template**: Remove template (with confirmation)
- **Generate Certificate**: Quick link to use this template
- **Search Templates**: Search by name
- **Filter**: Show only active or inactive templates

---

#### 4. Certificates
**Route**: `/organization/certificates`

**This page has everything for certificates in one place**

**Section A - Generate Certificates (Top of page with tabs)**

**Tab 1: Single Certificate**

**What you see:**
- Template dropdown (select which template to use)
- Dynamic form fields based on template placeholders
- Send via SMTP option (checkbox/toggle)
- Recipient email, subject, and message fields
- Generate button

**What you can do:**
1. Select a template
2. Fill in all the placeholder values:
   - Name, Course, Date, Grade, etc. (based on your template)
3. Click Generate
4. Certificate is created as PDF
5. After generation:
   - Download PDF
   - Send via SMTP email immediately after generating
   - Enter recipient email, subject, and optional message

**SMTP Send After Generate:**
- User can enable "Send after generate"
- System generates certificate and sends automatically via SMTP
- Recipient gets the certificate PDF attachment by email
- Delivery status is shown (Sent/Failed)

**Auto-filled fields:**
- Certificate ID (unique, like CERT-2026-12345)
- QR Code (for verification)
- Date (current date)

---

**Tab 2: Bulk Certificates**

**What you see:**
- Template dropdown
- File upload area for CSV/Excel
- Column mapping section
- Preview of data
- Progress bar during generation

**What you can do:**
1. Select a template
2. Upload CSV or Excel file with data
   - Example: CSV with columns: name, course, date, grade
3. Map CSV columns to template placeholders
4. Preview first few rows
5. Click Generate All
6. System creates PDFs for all rows
7. Download all as ZIP file
8. Option to send all via email

**CSV Example:**
```
name,course,date,grade
John Doe,Web Development,2026-01-15,A+
Jane Smith,Data Science,2026-01-15,A
...
```

---

**Section B - All Certificates Table (Below generation section)**

**What you see:**
- Table showing all generated certificates:
  - Certificate ID (unique identifier)
  - Template name used
  - Recipient name
  - Generated by (which user created it)
  - Generation date
  - Action buttons

**What you can do:**
- **View PDF**: Open certificate in browser
- **Download PDF**: Download to your computer
- **Send via Email**: 
  - Enter recipient email
  - Customize subject line
  - Add optional message
  - System sends email with PDF attached via SMTP
- **Copy Verification Link**: Copy link to verify this certificate
- **Delete Certificate**: Remove certificate (with confirmation)
- **Search**: Search by certificate ID or recipient name
- **Filter**: 
  - Filter by template
  - Filter by date range
  - Filter by who generated it
- **Bulk Actions**:
  - Select multiple certificates
  - Download all as ZIP
  - Send all via email
  - Delete multiple certificates

---

#### 5. Role-Based Access
**Route**: `/organization/roles`

**This page is for role creation and user-role assignment**

**Section A - Create Roles**

**What you see:**
- Role name input (example: `Certificate Manager`, `Viewer`, `Editor`)
- Permissions checklist
- Save role button

**What you can do:**
- Create custom roles for your organization
- Choose permissions for each role, such as:
  - Dashboard view
  - Template add/edit/view/delete
  - Certificate generate/view/send/delete
  - Profile update
- Edit existing roles
- Delete custom roles (except protected default roles)

---

**Section B - Assign Roles to Users**

**What you see:**
- Users table:
  - User name
  - Email
  - Current role
  - Status
  - Action buttons

**What you can do:**
- Create new users in the organization
- Assign any created role to a user
- Change user role anytime
- Deactivate/activate users
- Search users by name or email

**Important Rules:**
- Owner can assign any role
- Admin can assign roles based on access policy
- Member cannot create roles or assign roles

---

#### 6. Activity
**Route**: `/organization/activity`

**This page shows all activities inside one organization**

**What you see:**
- Activity table with:
  - User name and email
  - Action type (login, template upload, certificate generate, email send, etc.)
  - Date and time
  - IP address
  - Details (certificate ID/template name)

**What you can do:**
- View recent activity of your organization
- Search by user name or email
- Filter by action type
- Filter by date range
- Export activity to CSV

**Access:**
- Owner and Admin: full access
- Member: view only (if enabled by role permission)

---

### Organization Navigation Menu
```
├── Dashboard
├── Profile
├── Templates
├── Certificates
├── Roles & Users
├── Activity
└── Logout
```

---

## 🌐 PUBLIC VERIFICATION PAGE

### Public Verification
**Route**: `/verify` (anyone can access, no login needed)

**What you see:**
- Certificate ID input field
- OR QR code scanner option

**How it works:**

**Method 1: Scan QR Code**
1. User scans QR code on certificate with phone
2. Automatically opens verification page
3. Shows certificate details if valid

**Method 2: Manual Entry**
1. User visits verification page
2. Enters certificate ID manually (e.g., CERT-2026-12345)
3. Clicks Verify button
4. Shows certificate details if valid

**If Certificate is Valid:**
```
✓ Certificate is Valid

Certificate ID: CERT-2026-12345
Issued to: John Doe
Course: Web Development
Issue Date: January 15, 2026
Issued by: ABC Academy

[Download Certificate]
```

**If Certificate is Invalid:**
```
✗ Certificate Not Found

The certificate ID does not exist.
Please check the ID and try again.
```

---

## 📊 ROLE PERMISSIONS

### What each role can do:

| Feature | Superadmin | Owner | Admin | Member |
|---------|------------|-------|-------|--------|
| **Superadmin Features** |
| View all organizations | ✅ | ❌ | ❌ | ❌ |
| Create organizations | ✅ | ❌ | ❌ | ❌ |
| Edit organizations | ✅ | ❌ | ❌ | ❌ |
| View admin activity | ✅ | ❌ | ❌ | ❌ |
| **Organization Features** |
| View dashboard | ❌ | ✅ | ✅ | ✅ |
| View/edit profile | ❌ | ✅ | ✅ | ✅ |
| Upload templates | ❌ | ✅ | ✅ | ❌ |
| View templates | ❌ | ✅ | ✅ | ✅ |
| Edit templates | ❌ | ✅ | ✅ | ❌ |
| Delete templates | ❌ | ✅ | ✅ | ❌ |
| Generate certificates | ❌ | ✅ | ✅ | ❌ |
| View certificates | ❌ | ✅ | ✅ | ✅ |
| Send certificates via email | ❌ | ✅ | ✅ | ❌ |
| Delete certificates | ❌ | ✅ | ✅ | ❌ |
| Create custom roles | ❌ | ✅ | ✅ | ❌ |
| Assign roles to users | ❌ | ✅ | ✅ | ❌ |
| Create organization users | ❌ | ✅ | ✅ | ❌ |
| View organization activity | ❌ | ✅ | ✅ | ✅ |
| Export organization activity | ❌ | ✅ | ✅ | ❌ |

---

## 📧 EMAIL FEATURES

### When emails are sent:

#### 1. Organization Owner Welcome Email
**When**: Superadmin creates new organization

**Who receives**: Organization owner

**Contains**:
- Welcome message
- Login credentials (email and temporary password)
- Link to login page

---

#### 2. Certificate Email
**When**: User generates certificate and clicks "Send via Email"

**Who receives**: Certificate recipient (email entered by user)

**Contains**:
- Congratulations message
- Certificate details (ID, course, date)
- PDF certificate attached
- Verification link
- QR code information

**Email is sent via SMTP** (configured in environment variables)

---

## 🔄 TYPICAL USER FLOWS

### Flow 1: Superadmin Creates Organization
1. Superadmin logs in
2. Goes to Organizations page
3. Clicks "Create Organization"
4. Enters: Organization name, Owner email, Owner name
5. Clicks Submit
6. System creates organization and owner account
7. Owner receives email with login credentials

---

### Flow 2: Owner Generates First Certificate
1. Owner logs in (first time with credentials from email)
2. Changes password
3. Goes to Templates page
4. Uploads .docx template file
5. System detects placeholders
6. Goes to Certificates page
7. Selects template
8. Fills in placeholder values
9. Clicks Generate
10. Downloads PDF or sends via email

---

### Flow 3: Bulk Certificate Generation
1. User goes to Certificates page
2. Clicks "Bulk Generation" tab
3. Selects template
4. Uploads CSV file with student/recipient data
5. Maps CSV columns to template placeholders
6. Previews data
7. Clicks Generate All
8. System creates all certificates
9. Downloads ZIP file with all PDFs
10. Optionally sends all via email

---

### Flow 4: Public Verification
1. Someone receives certificate
2. Sees QR code or Certificate ID on PDF
3. Scans QR code OR visits verification page
4. If scanned: Automatically shows verification result
5. If manual: Enters Certificate ID and clicks Verify
6. System checks if certificate exists
7. Shows certificate details if valid

---

## 💾 DATA ISOLATION

### Multi-Tenancy
- Each organization's data is completely separate
- Organization A cannot see Organization B's data
- Superadmin can see all organizations but not their certificates/templates
- Users can only see data from their own organization

---

## 🔒 SECURITY NOTES

### Passwords
- All passwords are encrypted (hashed with bcrypt)
- Minimum password requirements enforced

### Authentication
- JWT tokens used for login sessions
- Tokens expire after 24 hours
- Secure token storage

### File Uploads
- Only .docx files accepted for templates
- File size limits enforced
- Files stored securely (local or AWS S3)

### Multi-Tenancy
- Database queries automatically filtered by organization
- No way for users to access other organization's data

---

## 📱 KEY FEATURES SUMMARY

### For Superadmin:
✅ Manage all organizations from one place
✅ Create new organizations instantly
✅ View platform-wide statistics
✅ Activate/deactivate organizations
✅ Monitor all admin activity in real-time
✅ Track user actions across all organizations

### For Organization Users:
✅ Dashboard with quick stats and actions
✅ Profile management with password change
✅ Easy template upload with auto-detection of placeholders
✅ Single and bulk certificate generation
✅ Send certificates via email with SMTP
✅ QR code embedded in every certificate
✅ Simple certificate verification

### For Public:
✅ Anyone can verify certificates
✅ Scan QR code or enter ID manually
✅ Instant verification results

---

## 🎯 SPECIAL FEATURES

### 1. Smart Placeholders
- System automatically detects {{placeholder}} in templates
- Special auto-fill placeholders:
  - `{{QR_CODE}}` → QR code image
  - `{{CERTIFICATE_ID}}` → Unique ID
  - `{{DATE}}` → Current date

### 2. QR Code Verification
- Every certificate has embedded QR code
- Scan with any QR scanner app
- Instantly verify authenticity
- No login required to verify

### 3. Bulk Generation
- Upload CSV/Excel with hundreds of rows
- Generate all certificates at once
- Download as ZIP file
- Progress bar shows generation status

### 4. Email Integration
- SMTP email sending
- Send certificates with one click
- Bulk email option available
- PDF attached automatically
- Customizable subject and message

### 5. Template Preview
- Thumbnail preview for each template
- See placeholders before generating
- Quick template selection

### 6. Admin Activity Tracking
- Track all user actions across platform
- Monitor login/logout events
- Track template and certificate operations
- IP address and device tracking
- Export activity logs to CSV
- Real-time activity monitoring
- Filter by organization, user, date, or action type

---

## 📋 REQUIREMENTS SUMMARY

### Technical Stack:
- **Backend**: Node.js with Express
- **Frontend**: Next.js with React
- **Database**: MongoDB
- **File Processing**: docxtemplater, puppeteer, pdf-lib
- **QR Codes**: qrcode library
- **Email**: Nodemailer with SMTP
- **Storage**: Local files or AWS S3

### Environment Setup:
- MongoDB connection
- JWT secret key
- Superadmin credentials
- SMTP email settings (host, port, username, password)
- AWS S3 credentials (optional)

---

## 🚀 GETTING STARTED

### For Superadmin:
1. System admin sets superadmin credentials in environment
2. Login with those credentials
3. Create first organization
4. Organization owner receives email

### For Organization Owner:
1. Receive welcome email
2. Login with provided credentials
3. Change password
4. Upload first template
5. Generate first certificate

### For Users:
1. Owner/Admin creates account for you
2. Login with credentials
3. View dashboard
4. Access templates and certificates based on your role

---

**Document Version**: 1.0  
**Last Updated**: March 31, 2026
