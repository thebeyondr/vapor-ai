# Roadmap: Vapor — Liquid AI Dashboard

## Overview

Vapor ships in 7 phases over 1 week, progressing from foundation to full ML platform simulation. Early phases establish the app shell, theming, and database layer. Middle phases deliver the core user journey: discovering models, configuring training runs, and watching real-time progress (the "wow" feature). Final phases add deployments view and polish. Each phase delivers complete, verifiable capabilities that build toward a portfolio-grade demo.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Database** - Project setup, layout, theming, Neon integration ✓ 2026-02-15
- [x] **Phase 2: Dashboard & Welcome** - Landing page with metrics, welcome modal ✓ 2026-02-15
- [x] **Phase 3: Model Discovery** - Curated LFMs and HuggingFace API search ✓ 2026-02-15
- [x] **Phase 4: Training Configuration** - Training config form with validation ✓ 2026-02-15
- [ ] **Phase 5: Training Monitor** - Real-time progress simulation (wow feature)
- [ ] **Phase 6: Deployments** - Deployed models view with stats
- [ ] **Phase 7: Polish & Responsive** - Final refinement, animations, cross-device

## Phase Details

### Phase 1: Foundation & Database
**Goal**: Working Next.js app with navigation, Liquid AI theming, and Neon database connected
**Depends on**: Nothing (first phase)
**Requirements**: FNDN-01, FNDN-02, FNDN-03, FNDN-04, FNDN-05
**Success Criteria** (what must be TRUE):
  1. User can navigate between Dashboard, Training, and Deployments pages via sidebar
  2. App uses custom Liquid AI color palette (not default ShadCN theme)
  3. User can toggle between light and dark mode
  4. App is deployed to Vercel with public URL
  5. Neon database is connected and stores at least one test record
**Plans:** 2 plans

Plans:
- [x] 01-01-PLAN.md — Scaffold app, apply Liquid AI theming, build sidebar navigation with 3 routes and dark mode
- [x] 01-02-PLAN.md — Set up Neon database with Drizzle ORM, verify connection, deploy to Vercel

### Phase 2: Dashboard & Welcome
**Goal**: User sees a functional landing page with metrics and understands what Vapor is
**Depends on**: Phase 1
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, WELC-01, WELC-02, WELC-03
**Success Criteria** (what must be TRUE):
  1. Dashboard displays summary cards showing active training jobs, deployed models, and recent activity
  2. Dashboard shows recent training jobs with status badges (queued/running/complete/failed)
  3. User can click "Start New Training" CTA to navigate to training config page
  4. First-time visitor sees welcome modal explaining Vapor's purpose and suggested actions
  5. User can dismiss welcome modal and reopen it via floating button
**Plans:** 2 plans

Plans:
- [x] 02-01-PLAN.md — Seed database, build dashboard with metrics cards, recent jobs list, and Start New Training CTA
- [x] 02-02-PLAN.md — Welcome modal with localStorage persistence and floating reopen button

### Phase 3: Model Discovery
**Goal**: User can discover Liquid LFMs and search for models via HuggingFace API
**Depends on**: Phase 2
**Requirements**: MODL-01, MODL-02, MODL-03, MODL-04, MODL-05
**Success Criteria** (what must be TRUE):
  1. User sees curated Liquid LFMs grouped by modality (audio, text, vision, nano)
  2. User can search for models with debounced HuggingFace API integration
  3. Model cards display name, size, architecture, and description
  4. User can describe a training goal in natural language and receive model suggestions
  5. Search gracefully falls back to cached data if HuggingFace API is unavailable
**Plans:** 3 plans

Plans:
- [x] 03-01-PLAN.md — HuggingFace client, curated Liquid LFM catalog, model cards on training page
- [x] 03-02-PLAN.md — Debounced model search via HuggingFace API with fallback
- [x] 03-03-PLAN.md — AI model recommender with natural language goal input

### Phase 4: Training Configuration
**Goal**: User can configure and submit a training job with validated inputs
**Depends on**: Phase 3
**Requirements**: TRCF-01, TRCF-02, TRCF-03, TRCF-04, TRCF-05
**Success Criteria** (what must be TRUE):
  1. User can select a base model from LFM catalog or HuggingFace search results
  2. User can configure hyperparameters (learning rate, epochs, batch size) with inline validation
  3. Form shows meaningful error messages for invalid inputs (e.g., learning rate out of range)
  4. User can submit training configuration to create a new training job
  5. Submitted training job is persisted to Neon database with unique ID
**Plans:** 2 plans

Plans:
- [x] 04-01-PLAN.md — Schema migration (add batchSize), install form deps, create Zod validation schema
- [x] 04-02-PLAN.md — Training config form with RHF + Zod validation, Server Action, and model card navigation

### Phase 5: Training Monitor
**Goal**: User watches real-time training progress with realistic loss curves and status transitions
**Depends on**: Phase 4
**Requirements**: TRMN-01, TRMN-02, TRMN-03, TRMN-04, TRMN-05, TRMN-06
**Success Criteria** (what must be TRUE):
  1. User sees loss curve updating in real-time with realistic exponential decay plus noise
  2. Training monitor displays epoch progress, estimated time remaining, and overall progress bar
  3. Training job transitions through states: queued → running → complete/failed
  4. Failed training jobs show amber/red status badges and trigger notification toasts
  5. Training metrics are persisted to Neon database as they generate
  6. Multiple concurrent training jobs can run without interfering with each other's displays
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD
- [ ] 05-03: TBD
- [ ] 05-04: TBD

### Phase 6: Deployments
**Goal**: User can view deployed models with inference statistics
**Depends on**: Phase 5
**Requirements**: DEPL-01, DEPL-02, DEPL-03, DEPL-04, DEPL-05
**Success Criteria** (what must be TRUE):
  1. User can "deploy" a completed training job from training monitor
  2. Deployments page shows table of deployed models with status, version, and creation date
  3. User can sort and filter deployed models table
  4. Each deployed model displays inference stats (request volume, P50/P95 latency, error rate)
  5. Deployment records are persisted to Neon database
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD
- [ ] 06-03: TBD

### Phase 7: Polish & Responsive
**Goal**: App feels polished across all devices with smooth interactions
**Depends on**: Phase 6
**Requirements**: POLH-01, POLH-02, POLH-03, POLH-04, POLH-05
**Success Criteria** (what must be TRUE):
  1. All async operations show loading states (skeletons for lists, spinners for actions)
  2. All views have empty states with helpful CTAs when no data exists
  3. App is fully functional on desktop, tablet, and mobile viewports
  4. Page transitions use smooth animations via Framer Motion
  5. All charts and metrics use realistic ranges and values appropriate to ML domain
**Plans**: TBD

Plans:
- [ ] 07-01: TBD
- [ ] 07-02: TBD
- [ ] 07-03: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Database | 2/2 | ✓ Complete | 2026-02-15 |
| 2. Dashboard & Welcome | 2/2 | ✓ Complete | 2026-02-15 |
| 3. Model Discovery | 3/3 | ✓ Complete | 2026-02-15 |
| 4. Training Configuration | 2/2 | ✓ Complete | 2026-02-15 |
| 5. Training Monitor | 0/TBD | Not started | - |
| 6. Deployments | 0/TBD | Not started | - |
| 7. Polish & Responsive | 0/TBD | Not started | - |
