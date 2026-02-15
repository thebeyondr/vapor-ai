# Vapor — Liquid AI Dashboard

## What This Is

A portfolio-grade single-page application that simulates an enterprise platform for customizing, deploying, and monitoring AI models. Built to demonstrate frontend engineering skills aligned with Liquid AI's product needs — specifically the ability to take a complex ML domain and ship a clean, intuitive interface that non-technical enterprise users could navigate. Not a fake ML tool; a real demonstration of product thinking, design taste, and frontend craft.

## Core Value

Prove you can translate ML complexity into accessible UX — and ship it fast with good taste using Liquid AI's exact stack.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Dashboard overview with deployed model status, key metrics, and a prominent "Start New Training" CTA
- [ ] Welcome modal on first load explaining why this was built and what to try, dismissible to a floating button
- [ ] Training config page with natural language goal input that queries Hugging Face API for model suggestions
- [ ] Curated Liquid LFM section grouped by modality (audio, text, vision, nano) with HF search below
- [ ] Training monitor with simulated real-time progress: loss curves, epoch progress, ETA, status badges
- [ ] Error/failure state handling in training monitor (amber/red status, notification toasts)
- [ ] Deployed models view with inference stats (request volume, latency, error rates)
- [ ] Visual design matching Liquid AI's branding and aesthetic
- [ ] Responsive, polished interactions throughout

### Out of Scope

- Real ML infrastructure or model training — this is a frontend demo
- User authentication — no login needed for a portfolio piece
- Backend/database — mock data with local JSON + generated data + HF API
- Mobile app — web only, though responsive design is in scope
- Real-time WebSocket connections — simulated with intervals/timers

## Context

- **Target audience:** Liquid AI's Product and Engineering hiring team
- **What they're evaluating:** Working without detailed specs, translating ML complexity into accessible UX, shipping fast with their exact stack, thinking like a product owner
- **Liquid AI's models:** LFMs (Liquid Foundation Models) — available in audio, text, vision, and nano variants
- **Data strategy:** Hybrid — curated LFM data + Hugging Face API for real model search + programmatic generators for training metrics (loss curves via exponential decay with noise, etc.)
- **Design direction:** Match Liquid AI's own site branding and visual language

## Constraints

- **Timeline**: Ship this week — every screen must earn its place
- **Tech stack**: Next.js 14+ (App Router), TypeScript (strict), TailwindCSS, ShadCN/ui, Recharts — all listed in job posting
- **Deployment**: Vercel — one-click deploy, free tier, instant shareable link
- **No real ML**: All training/inference is simulated with mock data and generators
- **API dependency**: Hugging Face API only — keep external dependencies minimal

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Hybrid mock data (generated + HF API) | Pure mock feels fake; pure API limits what we can show | — Pending |
| Match Liquid AI branding | Targeted portfolio piece > generic one for this use case | — Pending |
| Curated LFMs + HF search | Shows company research AND real API integration | — Pending |
| Welcome modal with floating button | Gives reviewer context without being intrusive; shows UX thinking | — Pending |
| Single config page (not wizard) | Less clicking for a demo, shows form design skills | — Pending |
| 5 screens balanced approach | Full lifecycle story without spreading too thin for a 1-week sprint | — Pending |

---
*Last updated: 2026-02-15 after initialization*
