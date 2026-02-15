# Research Summary: Vapor ML Platform Dashboard

**Domain:** Enterprise ML/AI platform dashboard (portfolio SPA)
**Researched:** 2026-02-15
**Overall confidence:** MEDIUM-HIGH

## Executive Summary

The prescribed technology stack for Vapor (Next.js 15, TypeScript strict, TailwindCSS, ShadCN/ui, Recharts, Vercel) aligns well with 2025 industry standards for enterprise dashboard development. This stack is used by modern SaaS companies like Linear, Cal.com, and Vercel's own products.

Research validates the core technology choices and identifies necessary additions: Zustand for client state management, React Query (TanStack Query) for HuggingFace API integration, React Hook Form + Zod for training configuration forms, and TanStack Table for data-heavy views like the deployed models list.

The 1-week timeline is achievable with this stack due to: (1) ShadCN/ui's copy-paste component approach eliminates setup time, (2) Next.js App Router reduces routing boilerplate, (3) Recharts provides ready-made chart components, and (4) the focus on frontend polish over real ML infrastructure.

Key insight: This is a portfolio project optimizing for visual impact and code quality, not production ML platform functionality. The stack should prioritize developer velocity, type safety, and visual polish over scalability or backend complexity.

## Key Findings

**Stack:** Next.js 15 (App Router) + TypeScript strict + TailwindCSS + ShadCN/ui + Recharts + Zustand + React Query. Deploy to Vercel. Add React Hook Form + Zod for forms, TanStack Table for data tables, Framer Motion for polish.

**Architecture:** Standard Next.js App Router SPA with API routes for HuggingFace integration. Client-side routing, server components where beneficial, route handlers for API proxying to keep keys secure.

**Critical pitfall:** Scope creep attempting real ML infrastructure. Stick to mock data with selective HF API integration for model search only. Simulate training progress client-side with setInterval, don't build actual training pipelines.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation & Layout
**Duration:** Day 1-2
**Focus:** Project setup, core layout, navigation, theming

- Addresses: Development environment, component architecture, responsive layout
- Avoids: Jumping into features before design system is stable
- **Rationale:** ShadCN/ui requires initial configuration. Establishing layout patterns (sidebar nav, top bar, responsive grid) early prevents rework. Tailwind config for Liquid AI brand colors should be set before building components.
- **Deliverables:** Next.js project initialized, ShadCN/ui configured, DashboardLayout component, navigation structure, Liquid AI color scheme in Tailwind config

### Phase 2: Dashboard Overview & Data Display
**Duration:** Day 2-3
**Focus:** Dashboard home screen, metrics cards, basic charts

- Addresses: Recharts integration, mock data structure, ShadCN card/badge components
- Avoids: Complex state management before UI patterns are established
- **Rationale:** Dashboard overview is the landing page and sets visual tone. Start with static mock data, establish Recharts patterns for line/area charts (loss curves, accuracy trends), create reusable metric card components.
- **Deliverables:** Dashboard overview page, mock metrics, 2-3 chart types working, responsive grid layout

### Phase 3: HuggingFace API Integration
**Duration:** Day 3-4
**Focus:** Model search, API route handlers, React Query setup

- Addresses: External API integration, server-client data flow, caching
- Avoids: Client-side API key exposure, over-fetching, missing error states
- **Rationale:** This is the only "real" data integration. Use Next.js Route Handlers to proxy HF API calls, keeping keys secure. React Query provides caching and error handling. Start with model search autocomplete, potentially add metadata display for Liquid LFMs (curated list).
- **Deliverables:** HF API route handler, model search component with debouncing, React Query integration, loading/error states

### Phase 4: Training Configuration & Forms
**Duration:** Day 4-5
**Focus:** Training config form, validation, submission flow

- Addresses: Complex form handling, multi-step wizards, validation
- Avoids: Poor form UX, missing validation, form state bugs
- **Rationale:** React Hook Form + Zod is essential here. Training config has dropdowns (model selection), sliders (learning rate), inputs (epochs), conditional fields. Validation prevents invalid configs. This phase integrates HF model search from Phase 3.
- **Deliverables:** Training config form with RHF + Zod, model selection with HF search, hyperparameter inputs, validation rules, submission creates mock training job

### Phase 5: Training Monitor & Real-Time Simulation
**Duration:** Day 5-6
**Focus:** Real-time training progress, live metric updates, job status

- Addresses: Simulated real-time data, chart updates, state management
- Avoids: Attempting actual ML training, WebSocket complexity for mock data
- **Rationale:** Use setInterval with Zustand to simulate training progress. React Query refetching updates charts in real-time. Framer Motion for smooth metric transitions. This is the "wow" feature for portfolio impact.
- **Deliverables:** Training monitor page, simulated progress (loss decreasing, accuracy increasing), live chart updates, job status changes (queued → running → complete)

### Phase 6: Deployed Models & Data Tables
**Duration:** Day 6
**Focus:** Deployed models list, TanStack Table, filtering/sorting

- Addresses: Data-heavy views, table features, mock deployment data
- Avoids: Building custom table logic, missing sorting/filtering
- **Rationale:** TanStack Table provides sorting, filtering, pagination out of the box. This is a simpler view (list of deployed models with status, metrics, actions). Use mock data representing deployed models.
- **Deliverables:** Deployed models page, TanStack Table with sorting/filtering, mock deployment data, status badges

### Phase 7: Welcome Modal & Polish
**Duration:** Day 7
**Focus:** Onboarding modal, animations, responsive testing, final polish

- Addresses: First-run experience, visual refinement, cross-device testing
- Avoids: Skipping onboarding, missing empty states, neglecting mobile
- **Rationale:** Welcome modal introduces Vapor and sets context for hiring team. Framer Motion for page transitions. Test on mobile/tablet. Add empty states for all views. Optimize performance.
- **Deliverables:** Welcome modal with ShadCN Dialog, page transitions, responsive fixes, empty states, performance check

---

## Phase Ordering Rationale

**Why this order:**

1. **Foundation first:** Layout/navigation establishes patterns for all later work
2. **Static before dynamic:** Dashboard with mock data validates design before adding API complexity
3. **External dependencies isolated:** HF API integration is one phase, can be debugged independently
4. **Forms after data:** Training config form needs model search from Phase 3
5. **Real-time builds on forms:** Training monitor needs job submission from Phase 4
6. **Simpler views late:** Deployed models table is straightforward, can compress if needed
7. **Polish last:** Welcome modal and animations are nice-to-have, can be trimmed if timeline slips

**Dependencies:**
- Phase 3 (HF API) → Phase 4 (forms need model search)
- Phase 4 (forms) → Phase 5 (monitor needs job creation)
- Phases 1-2 → all others (layout/design system used everywhere)

**Flexibility:**
- Phases 6-7 can be compressed or reordered
- If timeline slips, cut: welcome modal, some animations, deployed models page
- If timeline has slack, add: command palette (cmdk), toast notifications, advanced chart types

---

## Research Flags for Phases

**Phase 1: Foundation & Layout**
- Standard patterns, unlikely to need research
- ShadCN/ui docs and Tailwind docs are sufficient

**Phase 2: Dashboard Overview & Data Display**
- Standard patterns, unlikely to need research
- Recharts examples available, basic chart types well-documented

**Phase 3: HuggingFace API Integration**
- **LIKELY NEEDS DEEPER RESEARCH**
- @huggingface/hub library may not exist or have different API
- Alternative: Direct REST API calls to HF Inference API
- Need to verify: HF API endpoints, rate limits, authentication, response shapes
- Recommendation: Prototype API call early, fallback to mock if HF API blocked

**Phase 4: Training Configuration & Forms**
- Standard patterns, unlikely to need research
- React Hook Form + Zod is well-documented

**Phase 5: Training Monitor & Real-Time Simulation**
- **MAY NEED RESEARCH**
- Simulating realistic training curves (loss/accuracy shapes) requires understanding typical ML training behavior
- Need to verify: Recharts real-time update patterns, animation performance with streaming data
- Recommendation: Use faker.js for realistic but simplified curves, focus on visual polish over ML accuracy

**Phase 6: Deployed Models & Data Tables**
- Standard patterns, unlikely to need research
- TanStack Table docs are excellent

**Phase 7: Welcome Modal & Polish**
- Standard patterns, unlikely to need research
- Framer Motion docs and ShadCN Dialog examples sufficient

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core choices (Next.js, React, TS, Tailwind, ShadCN) are industry standard |
| Versions | MEDIUM | Unable to verify exact versions with external sources, based on training data through Jan 2025 |
| HF API Integration | LOW | @huggingface/hub library existence uncertain, may need direct REST API approach |
| Timeline Feasibility | HIGH | 1-week timeline achievable with this stack and phase breakdown |
| Visual Polish | HIGH | ShadCN/ui + Framer Motion + Recharts provide excellent foundation for portfolio-quality UI |

**Overall assessment:** Stack is solid, timeline is realistic, main uncertainty is HuggingFace API integration approach (verify @huggingface/hub or use direct REST calls).

---

## Gaps to Address

### Immediate Gaps (needed before Phase 1)

1. **Exact version verification:** Check current stable versions of Next.js, React, TypeScript, Tailwind
   - Action: Run `npx create-next-app@latest` to get current defaults
   - Action: Check `npm view <package> version` for each library

2. **HuggingFace API approach:** Verify @huggingface/hub library or plan direct REST API
   - Action: Test `npm install @huggingface/hub` and check types
   - Fallback: Use fetch with HF Inference API endpoints directly

3. **Liquid AI brand colors:** Extract color palette from Liquid AI website
   - Action: Inspect liquidai.com, grab primary/accent colors
   - Action: Define in Tailwind config as custom colors (e.g., `liquid-blue`, `liquid-purple`)

### Phase-Specific Research (can be deferred)

**Phase 3: HuggingFace API**
- Investigate: HF API endpoints, authentication, rate limits, response shapes
- Investigate: Liquid AI's foundational models (LFMs) - names, identifiers, how to feature them
- Confidence: LOW - needs verification before implementation

**Phase 5: Training Monitor**
- Investigate: Realistic training curve shapes (how does loss decrease, accuracy increase over epochs)
- Investigate: Recharts animation performance with frequent updates
- Confidence: MEDIUM - can fake it, but research improves realism

**Optional enhancements (if time permits):**
- Command palette library (cmdk): Nice-to-have for portfolio wow factor
- Toast library (sonner vs react-hot-toast): For training job notifications
- Advanced charts: Confusion matrix, ROC curves (low priority, table stakes are simpler)

---

## Recommendations

### Do This

1. **Start with create-next-app:** Use latest defaults, don't fight tooling
2. **Initialize ShadCN/ui immediately:** Establishes component patterns early
3. **Define types early:** Create `types/` folder with Model, TrainingJob, Deployment interfaces
4. **Mock data first:** Build UI with static data, swap in APIs later
5. **Commit often:** Portfolio projects benefit from visible git history
6. **Deploy early:** Set up Vercel project on Day 1, deploy daily

### Don't Do This

1. **Don't build real ML training:** Simulate everything, this is frontend showcase
2. **Don't over-engineer:** 1-week timeline, prefer working code over perfect architecture
3. **Don't skip TypeScript strict mode:** Type safety prevents bugs, worth the upfront cost
4. **Don't neglect empty states:** Empty charts, empty tables look unfinished
5. **Don't ignore mobile:** Even if desktop-focused, responsive design shows professionalism
6. **Don't delay HF API research:** If @huggingface/hub doesn't work, switch to REST early

### Risk Mitigation

**Risk:** HuggingFace API integration blocked (rate limits, library issues)
- **Mitigation:** Have mock model search data ready as fallback

**Risk:** Timeline slips due to scope creep
- **Mitigation:** Cut Phase 6 (deployed models) and/or Phase 7 (welcome modal) if needed

**Risk:** Recharts doesn't support needed chart types
- **Mitigation:** Verify chart types early in Phase 2, switch to Victory if needed (unlikely)

**Risk:** Real-time simulation feels fake
- **Mitigation:** Research typical training curves, add realistic noise and variability

---

## Success Criteria

**Portfolio project succeeds if:**

1. **Visual impact:** Looks professional, on-brand with Liquid AI
2. **Code quality:** TypeScript strict, clean component structure, good separation of concerns
3. **Feature completeness:** All 5 key screens implemented (dashboard, config, monitor, deployed, welcome)
4. **Interactivity:** Training simulation feels real, forms are smooth, charts update live
5. **Responsive:** Works on desktop, tablet, mobile (at minimum functional, ideally polished)
6. **Deployed:** Live on Vercel with public URL
7. **Git history:** Clean commits showing progression

**Not critical for success:**
- Real ML training (this is mock data showcase)
- Comprehensive testing (nice-to-have, but 1-week timeline limits this)
- Backend database (mock data sufficient)
- User authentication (out of scope for portfolio piece)

---

## Next Steps

1. **Validate versions:** Check current stable versions of all libraries
2. **Research HuggingFace API:** Verify @huggingface/hub or plan REST API approach
3. **Extract Liquid AI branding:** Colors, typography, design language
4. **Proceed to roadmap creation:** Use this SUMMARY.md + STACK.md to inform phase planning

**Handoff to roadmap:** Phase structure (7 phases over 7 days) with clear deliverables, dependencies, and research flags. Stack is validated and prescriptive. Ready for detailed milestone planning.
