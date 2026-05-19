# GRATEHCARE — Care Management SaaS

## Original Problem Statement
Build a multi-tenant care management SaaS platform with a marketing landing page + full app shell, role-based dashboards, auth flow and reusable components. React + TypeScript + Tailwind + Framer Motion.

## Architecture
- **Frontend**: React 19 + TypeScript 4.9 + Tailwind + Framer Motion 12
- **Routing**: react-router-dom v7 (BrowserRouter + nested protected routes)
- **Auth**: localStorage-backed `AuthContext` (placeholder — accepts any email/password and persists user with role)
- **Backend**: untouched FastAPI hello-world (no API consumed yet)

## Folder Structure
```
src/
├── pages/
│   ├── LandingPage.tsx
│   ├── auth/                 (Login, Register, ForgotPassword)
│   └── dashboard/            (18 role-aware pages)
├── components/
│   ├── landing/              (Hero, Features, Pricing, etc.)
│   ├── auth/                 (AuthLayout, ProtectedRoute)
│   └── dashboard/            (AppShell, Sidebar, Topbar, PageHeader, StatCard, Card, Badge)
├── context/AuthContext.tsx
└── lib/
    ├── roles.ts              (11 roles + labels + descriptions + accents)
    └── nav.ts                (per-role sidebar config)
```

## Implemented (Dec 2025)

### Public
- Landing page (already built — preserved)
- `/login`, `/register`, `/forgot-password` with split-screen auth layout, password rules, demo role selector

### Auth foundation
- `AuthContext` with `login` / `register` / `logout` / `switchRole` (localStorage persistence)
- `ProtectedRoute` redirects unauthenticated users to `/login`
- 11 supported roles: Platform Owner, Super Admin, Platform Support, Org Owner, Operations Admin, Care Coordinator, Support Worker, Billing Officer, Compliance Officer, Family User, Practitioner

### App shell (`/app/*`)
- Collapsible **Sidebar** with role-aware nav, org switcher, hover-to-expand, animated active indicator
- **Topbar** with global search (⌘K hint), Create button, role switcher (demo), notifications dropdown, user menu
- Responsive: mobile hamburger opens sidebar overlay

### Role-aware dashboards (each role gets unique KPIs + widgets)
- `DashboardHome` — switches widget set per role:
  - Org Owner / Operations Admin → revenue trend, AI insights, recent activity, top performers
  - Care Coordinator → today's schedule, unfilled shifts
  - Support Worker → my shifts, quick actions (clock in, care note, incident, kilometres)
  - Billing → claims pipeline, invoice list
  - Compliance → expiring credentials, open incidents
  - Family → care log, latest update from team
  - Practitioner → care plans due review, week sessions
  - Platform Owner → MRR/NRR, top tenants, revenue chart
  - Super Admin → service health, system activity
  - Platform Support → ticket queue, tenant activity

### Operational pages with full mock UI
- **Schedule** — week-view drag/drop calendar grid with shifts (filled / open / tentative), KPI strip, click-to-detail
- **Clients** — searchable table with avatar, status, funding, coordinator, hours
- **Care plans** — Eleanor R. detail with goals/progress bars, vitals trend, recent care notes
- **Messages** — split-pane inbox with 5 conversations + chat thread + composer
- **Billing** — KPI strip + invoice table with status badges
- **Claims** — 4-stage pipeline (Submitted → Review → Approved → Paid) + claim table
- **Reports** — Revenue line chart + service mix donut + bar charts (visits by line, top staff)
- **Compliance** — credential table sorted by expiry
- **Incidents** — 4-column kanban (Open → Investigating → Review → Resolved) with severity tags
- **Audits** — readiness checklist + audit history
- **Settings** — tabbed (Profile, Organization, Notifications, Security, Plan & billing)

### Platform-level pages
- **Tenants** — tenant table with plan / staff / MRR / region / health
- **Users** — cross-tenant user table with role badges
- **Tickets** — support queue table with priority + status
- **Activity** — vertical timeline of system events
- **Network** — stylised globe + regional breakdown
- **Revenue** — MRR chart + revenue-by-plan + cohort heatmap

### Reusable components
- `PageHeader`, `StatCard`, `Card`, `Badge`
- All interactive elements have `data-testid`

## Backlog / Next Action Items
- P1: Wire AuthContext to a real backend (FastAPI + JWT + bcrypt) + multi-tenant model
- P1: Connect each dashboard to real APIs (replace mock arrays)
- P2: Forms & wizards (create client, new shift, log incident, generate invoice)
- P2: Real-time updates (websocket or polling) for shifts/claims/notifications
- P3: Permissions/feature flags by role; impersonation for Platform Support
- P3: Drag-and-drop on schedule + kanban (currently styled but not interactive)
- P3: Mobile-optimised support worker view (currently responsive but not mobile-first)
