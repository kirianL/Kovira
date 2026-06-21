# Kovira — Full Feature Set

## 🧩 1. FORM BUILDER

### Core

- Drag & drop builder
- Field types:
  - text
  - email
  - number
  - select
  - checkbox
  - radio
  - date
  - file upload
- Multi-step forms
- Reorder fields
- Live preview

### Logic

- Conditional logic (if/else)
- Field dependencies
- Dynamic visibility rules
- Required rules per condition

### UX

- Auto-save draft
- Resume later link
- Progress bar
- Redirect after submit
- Custom thank you page
- Form theming (colors, logo)

---

## 📥 2. SUBMISSIONS SYSTEM

- Table view (Notion-like)
- Submission detail view
- Filters (date, status, tags)
- Search global
- Tags system
- Status pipeline:
  - pending
  - reviewed
  - approved
  - rejected
- Comments per submission
- Activity log per submission
- Export CSV / JSON
- Webhook trigger on submit

---

## 🔁 3. WORKFLOWS ENGINE

### Core

- Visual flow builder (nodes)

### Nodes

- Trigger:
  - form submitted
- Conditions:
  - if / else logic
  - multi-condition rules
- Actions:
  - update submission
  - send email (internal system optional)
  - webhook call
  - notify user
  - assign reviewer

### Advanced

- Multi-step flows
- Parallel branches
- Execution logs
- Retry logic
- Failure handling

---

## 👥 4. WORKSPACE & COLLABORATION

- Multi-tenant workspaces
- Roles:
  - owner
  - admin
  - editor
  - viewer
- Invite members
- Activity feed
- Mentions (@user)
- Comments system
- Audit logs

---

## 📊 5. ANALYTICS

- Form views
- Submission count
- Conversion rate
- Drop-off analysis
- Field-level analytics
- Time to complete form
- Traffic source tracking
- Workflow success rate

---

## 🔌 6. EMBEDDING SYSTEM

- iFrame embed
- Script embed
- Headless mode (no branding)
- Domain whitelist
- Embed tracking
- Responsive embed support

---

## ⚙️ 7. AUTOMATION SYSTEM

- Webhooks
- Event triggers
- Scheduled actions (basic cron-like logic)
- External API calls (later phase)
- Retry + failure tracking
- Logs per automation

---

## 🔐 8. SECURITY & CONTROL

- Rate limiting per workspace
- Spam protection (honeypot)
- CAPTCHA support (optional)
- Workspace isolation (multi-tenant RLS)
- API key system
- Audit logs
- Input validation layer

---

## 🔑 9. AUTH SYSTEM

- Email/password auth
- OAuth (optional later)
- Session management
- Workspace switching
- Role-based access control

---

## 💳 10. BILLING SYSTEM

- Stripe integration (later phase)
- Free plan limits:
  - forms
  - submissions
  - workflows
- Paid tiers:
  - Starter
  - Pro
  - Business
- Usage tracking

---

## 🔌 11. API SYSTEM

- REST API
- API keys per workspace
- Endpoints:
  - /forms
  - /submissions
  - /workflows
- Webhook receivers
- Rate limiting

---

## 📚 12. TEMPLATE SYSTEM

- Form templates
- Workflow templates
- Duplicate system
- Public template gallery (future)

---

## 🧠 13. VERSIONING SYSTEM

- Form version history
- Restore previous versions
- Workflow version tracking
