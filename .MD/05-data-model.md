# Kovira Data Model

## Multi-tenant structure

Each workspace is isolated.

---

## Entities

### User

- id
- email
- role

---

### Workspace

- id
- name
- members

---

### Form

- id
- workspace_id
- schema (JSON)
- settings
- version

---

### Submission

- id
- form_id
- data (JSON)
- status
- tags
- created_at

---

### Workflow

- id
- form_id
- nodes
- edges
- version

---

### Execution

- id
- workflow_id
- submission_id
- status
- logs
