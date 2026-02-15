# Requirements: Vapor

**Defined:** 2026-02-15
**Core Value:** Prove you can translate ML complexity into accessible UX — and ship it fast with good taste using Liquid AI's exact stack.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation & Layout

- [ ] **FNDN-01**: App has responsive sidebar navigation with routes for Dashboard, Training, and Deployments
- [ ] **FNDN-02**: App uses Liquid AI-inspired color palette and custom ShadCN/ui theme (not default)
- [ ] **FNDN-03**: App supports dark mode toggle
- [ ] **FNDN-04**: App is deployed to Vercel with shareable public URL
- [ ] **FNDN-05**: Neon Postgres database is connected for persistent data storage

### Dashboard

- [ ] **DASH-01**: User sees a dashboard overview as the landing page
- [ ] **DASH-02**: Dashboard displays summary metrics cards (active training jobs, deployed models, recent activity)
- [ ] **DASH-03**: Dashboard has a prominent "Start New Training" CTA that navigates to training config
- [ ] **DASH-04**: Dashboard shows recent training jobs with status indicators
- [ ] **DASH-05**: Dashboard evolves across phases — early phases show minimal view, final phase shows full metrics

### Welcome Experience

- [ ] **WELC-01**: First-time visitor sees a welcome modal explaining why this was built and what to try
- [ ] **WELC-02**: Welcome modal is dismissible and minimizes to a floating button
- [ ] **WELC-03**: User can reopen the welcome modal from the floating button

### Model Discovery

- [ ] **MODL-01**: User sees a curated section of Liquid LFMs grouped by modality (audio, text, vision, nano)
- [ ] **MODL-02**: User can search for models via HuggingFace API with debounced input
- [ ] **MODL-03**: Model cards display key metadata (name, size, architecture, description)
- [ ] **MODL-04**: HuggingFace API has graceful fallback to cached/static data if API is unavailable
- [ ] **MODL-05**: User can describe their goal in natural language and get model suggestions

### Training Configuration

- [ ] **TRCF-01**: User can select a base model (from LFM catalog or HF search results)
- [ ] **TRCF-02**: User can configure hyperparameters (learning rate, epochs, batch size) with validation
- [ ] **TRCF-03**: Form validates inputs with meaningful error messages (Zod schema)
- [ ] **TRCF-04**: User can submit training configuration to create a new training job
- [ ] **TRCF-05**: Training job is persisted to Neon database on submission

### Training Monitor

- [ ] **TRMN-01**: User sees real-time simulated training progress (loss curve updating live)
- [ ] **TRMN-02**: Training monitor displays epoch count, ETA, and overall progress bar
- [ ] **TRMN-03**: Loss curves use realistic shapes (exponential decay with noise, not random)
- [ ] **TRMN-04**: Training job status transitions through states: queued → running → complete/failed
- [ ] **TRMN-05**: Error/failure states show amber/red status badges and notification toasts
- [ ] **TRMN-06**: Training metrics are persisted to Neon database as they generate

### Deployed Models

- [ ] **DEPL-01**: User can "deploy" a completed training job (simulated)
- [ ] **DEPL-02**: User sees a table of deployed models with status, version, and key metrics
- [ ] **DEPL-03**: Deployed models table supports sorting and filtering
- [ ] **DEPL-04**: Each deployed model shows inference stats (request volume, latency, error rates)
- [ ] **DEPL-05**: Deployment records are persisted to Neon database

### Polish & UX

- [ ] **POLH-01**: All async operations have loading states (skeletons or spinners)
- [ ] **POLH-02**: All views have empty states with helpful CTAs
- [ ] **POLH-03**: Responsive design works on desktop, tablet, and mobile
- [ ] **POLH-04**: Page transitions use smooth animations (Framer Motion)
- [ ] **POLH-05**: Charts and metrics use domain-appropriate ranges and realistic values

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Advanced Features

- **ADV-01**: Model comparison — overlay multiple training runs on same chart
- **ADV-02**: Command palette (Cmd+K) for quick navigation
- **ADV-03**: Export training metrics as CSV
- **ADV-04**: Experiment tracking with tagging and annotations
- **ADV-05**: Cost estimation before training submission

### Enterprise Features

- **ENT-01**: User authentication and sessions
- **ENT-02**: Multi-tenancy (organizations, teams)
- **ENT-03**: Audit trail (who deployed what, when)
- **ENT-04**: Role-based access control

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real ML training | Frontend demo — all training is simulated |
| Data upload / preprocessing | Requires backend file handling, out of scope |
| Real-time WebSockets | Simulated with intervals/polling — sufficient for demo |
| Email notifications | Requires email service, in-app toasts only |
| Billing / payments | Enterprise feature, not needed for portfolio |
| Mobile native app | Web only, responsive design covers mobile |
| Model architecture editing | Too deep for dashboard UI — config only |
| A/B testing infrastructure | Complex, marginal portfolio value |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FNDN-01 | Phase 1 | Pending |
| FNDN-02 | Phase 1 | Pending |
| FNDN-03 | Phase 1 | Pending |
| FNDN-04 | Phase 1 | Pending |
| FNDN-05 | Phase 1 | Pending |
| DASH-01 | Phase 2 | Pending |
| DASH-02 | Phase 2 | Pending |
| DASH-03 | Phase 2 | Pending |
| DASH-04 | Phase 2 | Pending |
| DASH-05 | Phase 2 | Pending |
| WELC-01 | Phase 2 | Pending |
| WELC-02 | Phase 2 | Pending |
| WELC-03 | Phase 2 | Pending |
| MODL-01 | Phase 3 | Pending |
| MODL-02 | Phase 3 | Pending |
| MODL-03 | Phase 3 | Pending |
| MODL-04 | Phase 3 | Pending |
| MODL-05 | Phase 3 | Pending |
| TRCF-01 | Phase 4 | Pending |
| TRCF-02 | Phase 4 | Pending |
| TRCF-03 | Phase 4 | Pending |
| TRCF-04 | Phase 4 | Pending |
| TRCF-05 | Phase 4 | Pending |
| TRMN-01 | Phase 5 | Pending |
| TRMN-02 | Phase 5 | Pending |
| TRMN-03 | Phase 5 | Pending |
| TRMN-04 | Phase 5 | Pending |
| TRMN-05 | Phase 5 | Pending |
| TRMN-06 | Phase 5 | Pending |
| DEPL-01 | Phase 6 | Pending |
| DEPL-02 | Phase 6 | Pending |
| DEPL-03 | Phase 6 | Pending |
| DEPL-04 | Phase 6 | Pending |
| DEPL-05 | Phase 6 | Pending |
| POLH-01 | Phase 7 | Pending |
| POLH-02 | Phase 7 | Pending |
| POLH-03 | Phase 7 | Pending |
| POLH-04 | Phase 7 | Pending |
| POLH-05 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 38 total
- Mapped to phases: 38
- Unmapped: 0

---
*Requirements defined: 2026-02-15*
*Last updated: 2026-02-15 after roadmap creation*
