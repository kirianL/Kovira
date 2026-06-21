# Kovira Architecture Overview

## 🧠 System type

Modular Multi-Tenant SaaS (Modular Monolith first phase)

---

## 🏗️ High-level architecture

Frontend (Astro + Next.js)
↓
API Layer (Next.js / Node)
↓
Business Logic Layer
↓
Database (PostgreSQL)

---

## 📦 Monorepo structure

kovira/
│
├── apps/
│ ├── web (Astro - marketing)
│ ├── app (Next.js - SaaS core)
│
├── packages/
│ ├── ui (design system)
│ ├── config (tokens/theme)
│ ├── utils
│
├── services/
│ ├── api
│ ├── auth
│ ├── workflows-engine
│ ├── forms-engine
│
└── infra/
├── database schema
├── env config
├── deployment config
🧩 Architectural pattern
Modular Monolith (initial stage)

Each domain is isolated:

forms module
submissions module
workflows module
analytics module
auth module
🔄 Data flow
User → Form → Submission → Workflow Trigger → Actions → Analytics
🧱 Frontend architecture
App (Next.js)

Feature-based structure:

features/forms
features/submissions
features/workflows
features/analytics
🌐 Landing (Astro)
static-first
SEO optimized
minimal JS islands
🧠 State management
React state → UI only
Zustand → global UI state
React Query → server state
🗄️ Database

PostgreSQL (multi-tenant)

Tables:

users
workspaces
forms
submissions
workflows
executions
logs
