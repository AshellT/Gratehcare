# Lumina — SaaS Landing Page

## Original Problem Statement
Build a complete, production-ready landing page for Lumina, a modern multi-tenant care management SaaS platform (similar to ShiftCare but more advanced). Tech: React + TypeScript + Tailwind + Framer Motion. Sections: Hero, Problem→Solution, Features (5), How It Works (3 steps), Role-Based (8 roles), Social Proof, Pricing (3 tiers), Final CTA, Footer.

## User Choices
- TypeScript (.tsx) — converted CRA project to TS
- Light theme with blue/indigo accents
- Mix of Unsplash imagery + custom UI mockups
- Real pricing tiers: Starter ($49) / Growth ($129) / Enterprise (Custom)

## Architecture
- Frontend: React 19 + TypeScript 4.9 + Tailwind + Framer Motion 12
- Routing: react-router-dom (single landing route `/`)
- Fonts: Outfit (display) + DM Sans (body) via Google Fonts
- Backend: untouched (default FastAPI hello-world)

## Implemented (Dec 2025)
- `src/pages/LandingPage.tsx` — composes all sections
- `src/components/landing/Header.tsx` — sticky glassmorphism nav with mobile menu
- `src/components/landing/Hero.tsx` — headline, CTAs, custom dashboard mock with floating AI/audit badges
- `src/components/landing/LogoCloud.tsx` — 6 trust logos
- `src/components/landing/ProblemSolution.tsx` — side-by-side comparison cards
- `src/components/landing/Features.tsx` — 5-card bento (Smart Scheduling, Billing & Claims, Compliance & Audit, Care Management, AI Insights) with custom mini-visualizations
- `src/components/landing/HowItWorks.tsx` — 3-step Setup → Manage → Grow
- `src/components/landing/RoleBased.tsx` — 8 audience cards (Owners, Admins, Coordinators, Support Workers, Billing, Compliance, Families, Practitioners)
- `src/components/landing/SocialProof.tsx` — 3 testimonials + stats strip
- `src/components/landing/Pricing.tsx` — 3 tiers, Growth highlighted on dark card with badge
- `src/components/landing/FinalCTA.tsx` — dark hero CTA block
- `src/components/landing/Footer.tsx` — 4-column links + socials
- All interactive elements have `data-testid` attributes
- Framer Motion fade/slide animations on scroll
- Fully responsive (mobile/tablet/desktop)

## Backlog / Next Action Items
- P1: Wire CTAs to real signup / demo booking forms (Calendly, HubSpot, etc.)
- P2: Add a dedicated Features deep-dive page per module
- P2: Customer story / case-study page
- P2: Blog / Resources index
- P3: Cookie banner + analytics (GA4 / PostHog)
- P3: i18n + dark mode toggle
