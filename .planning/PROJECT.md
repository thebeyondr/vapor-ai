# Vapor — Liquid AI Dashboard

## What This Is

A portfolio-grade full-stack application simulating an enterprise ML platform for discovering, training, deploying, and monitoring AI models. Built with Liquid AI's exact tech stack to demonstrate the ability to translate complex ML workflows into clean, intuitive UX — and ship it fast with good taste. Features real HuggingFace API integration, AI-powered model recommendations, realistic training simulation, and production-grade polish.

## Core Value

Prove you can translate ML complexity into accessible UX — and ship it fast with good taste using Liquid AI's exact stack.

## Requirements

### Validated

- ✓ Responsive sidebar navigation with Dashboard, Training, Deployments routes — v1.0
- ✓ Liquid AI-inspired color palette with custom ShadCN/ui theme and dark mode — v1.0
- ✓ Deployed to Vercel with shareable public URL (https://vapor-ai.vercel.app) — v1.0
- ✓ Neon Postgres database with Drizzle ORM for persistent data storage — v1.0
- ✓ Dashboard with summary metrics, recent jobs, and "Start New Training" CTA — v1.0
- ✓ Welcome modal with localStorage persistence and floating reopen button — v1.0
- ✓ Curated Liquid LFMs grouped by modality with HuggingFace API search — v1.0
- ✓ AI-powered model recommendations from natural language goal input — v1.0
- ✓ Training configuration with Zod validation, React Hook Form, and Server Actions — v1.0
- ✓ Real-time training monitor with realistic loss curves and status transitions — v1.0
- ✓ Deployments with TanStack Table sorting/filtering and inference stats — v1.0
- ✓ Loading skeletons, contextual empty states, and Motion page transitions — v1.0
- ✓ Responsive design across desktop, tablet, and mobile viewports — v1.0

### Active

(No active requirements — v1.0 shipped. Use `/gsd:new-milestone` for next version.)

### Out of Scope

- Real ML infrastructure or model training — this is a frontend demo
- User authentication — no login needed for a portfolio piece
- Mobile native app — web only, responsive design covers mobile
- Real-time WebSocket connections — simulated with intervals/polling (sufficient for demo)
- Model comparison overlays, command palette, CSV export — deferred to v2

## Context

- **Target audience:** Liquid AI's Product and Engineering hiring team
- **What they're evaluating:** Working without detailed specs, translating ML complexity into accessible UX, shipping fast with their exact stack, thinking like a product owner
- **Liquid AI's models:** LFMs (Liquid Foundation Models) — available in audio, text, vision, and nano variants
- **Data strategy:** Hybrid — curated LFM data + Hugging Face API for real model search + programmatic generators for training metrics
- **Current state:** v1.0 shipped. 6,526 LOC TypeScript/TSX across 153 files. Deployed at https://vapor-ai.vercel.app

## Constraints

- **Timeline**: Shipped in 1 day (1.3 hours execution time)
- **Tech stack**: Next.js 16, React 19, TypeScript (strict), Tailwind v4, ShadCN/ui (new-york), Recharts, Drizzle ORM, Neon Postgres
- **Deployment**: Vercel — thebeyondrs-projects team
- **No real ML**: All training/inference is simulated with mock data and generators
- **API dependency**: Hugging Face API only — with static fallback for offline scenarios

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Hybrid mock data (generated + HF API) | Pure mock feels fake; pure API limits what we can show | ✓ Good — realism without fragility |
| Match Liquid AI branding | Targeted portfolio piece > generic one | ✓ Good — custom purple/blue theme |
| Curated LFMs + HF search | Shows company research AND real API integration | ✓ Good — 8 LFMs across 4 modalities |
| Welcome modal with floating button | Gives reviewer context without being intrusive | ✓ Good — localStorage persistence |
| Single config page (not wizard) | Less clicking for a demo, shows form design skills | ✓ Good — clean single-page form |
| ShadCN new-york style (not nova) | Nova missing sidebar/button components | ✓ Good — stable component set |
| Tailwind v4 with @theme inline | No tailwind.config.ts, CSS-native approach | ✓ Good — required Tw v4 syntax fixes |
| Neon DB (not JSON files) | Real persistence for portfolio credibility | ✓ Good — Drizzle ORM + serverless |
| Lazy db client via Proxy | Vercel build compatibility without DB at build time | ✓ Good — solved build failures |
| Error-as-data Server Actions | Return objects, not throw — safer pattern | ✓ Good — consistent error handling |
| Motion (not Framer Motion) | Better tree-shaking, modern package | ✓ Good — FrozenRouter pattern works |
| TanStack Table for deployments | Industry-standard, sorting/filtering built-in | ✓ Good — clean implementation |
| Exponential decay + Gaussian noise | Realistic training curves for the "wow" feature | ✓ Good — visually convincing |

---
*Last updated: 2026-02-15 after v1.0 milestone*
