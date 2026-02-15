---
phase: 07-polish-and-responsive
plan: 01
subsystem: ui-polish
tags: [loading-states, empty-states, skeletons, ml-metrics, ux]
dependency_graph:
  requires: [phase-06]
  provides: [loading-states, empty-state-component, skeleton-components, ml-metric-constants]
  affects: [all-dashboard-routes]
tech_stack:
  added: [spinner-component, skeleton-components, empty-state-pattern, ml-metric-constants]
  patterns: [next-loading-convention, reusable-empty-states, typed-constants]
key_files:
  created:
    - components/ui/spinner.tsx
    - app/(dashboard)/components/skeletons/dashboard-skeleton.tsx
    - app/(dashboard)/components/skeletons/table-skeleton.tsx
    - app/(dashboard)/components/skeletons/card-list-skeleton.tsx
    - app/(dashboard)/components/skeletons/model-catalog-skeleton.tsx
    - app/(dashboard)/loading.tsx
    - app/(dashboard)/training/loading.tsx
    - app/(dashboard)/training/jobs/loading.tsx
    - app/(dashboard)/training/configure/loading.tsx
    - app/(dashboard)/deployments/loading.tsx
    - app/(dashboard)/components/empty-state.tsx
    - lib/constants/ml-metrics.ts
  modified:
    - app/(dashboard)/components/recent-jobs-list.tsx
    - app/(dashboard)/deployments/page.tsx
    - app/(dashboard)/training/jobs/page.tsx
decisions:
  - title: "Next.js loading.tsx convention for route loading states"
    rationale: "Next.js built-in loading UI pattern provides automatic Suspense boundaries and streaming SSR support"
    alternatives: ["Manual Suspense boundaries", "Client-side loading indicators"]
    tradeoffs: "Requires skeleton components to match page structure, but provides seamless UX"
  - title: "Skeleton dimensions match final rendered content"
    rationale: "Prevents cumulative layout shift (CLS) and provides smoother perceived performance"
    alternatives: ["Generic loading spinners", "Placeholder text"]
    tradeoffs: "More initial implementation work, but significantly better UX"
  - title: "Reusable EmptyState component with contextual messaging"
    rationale: "Consistent empty state UX across app with domain-specific guidance and CTAs"
    alternatives: ["Page-specific empty states", "Generic 'no data' messages"]
    tradeoffs: "Requires passing icon/title/description props, but ensures consistency"
  - title: "ML_METRIC_RANGES as documented source of truth"
    rationale: "Centralizes domain knowledge for validation, testing, and future chart normalization"
    alternatives: ["Hardcoded values in simulators", "Config file"]
    tradeoffs: "Simulators continue to work independently, constants serve as reference"
metrics:
  duration: 239
  completed_date: 2026-02-15
  tasks_completed: 2
  files_created: 12
  files_modified: 3
  commits: 2
---

# Phase 7 Plan 1: Loading and Empty States Summary

Comprehensive loading states and contextual empty states across all dashboard routes using Next.js loading conventions, reusable skeleton components matching final layouts, and domain-specific EmptyState component with actionable CTAs.

## Objective Achieved

All dashboard routes now show structured skeleton loading states during navigation, eliminating blank screens. All empty data states show helpful contextual messaging with icons and clear CTAs. ML metric constants documented for domain reference.

## Tasks Completed

### Task 1: Create skeleton loading components and loading.tsx files for all routes

**Commit:** 929709c

Created comprehensive loading state infrastructure:

1. **Spinner component** (`components/ui/spinner.tsx`):
   - Reusable Loader2 icon with animate-spin
   - Accepts className prop for sizing
   - Used for action button loading feedback

2. **Reusable skeleton components** (`app/(dashboard)/components/skeletons/`):
   - **DashboardSkeleton**: Page header + 4 metric cards in responsive grid + recent jobs card with 5 row skeletons
   - **TableSkeleton**: Configurable rows/columns (default 5x4) with varying widths, matches deployments table
   - **CardListSkeleton**: Configurable count (default 3), matches training jobs page with header + params grid
   - **ModelCatalogSkeleton**: Hero recommender card + separator + 2x2 model grid + separator + search section

3. **loading.tsx files for all routes**:
   - `app/(dashboard)/loading.tsx` → DashboardSkeleton
   - `app/(dashboard)/training/loading.tsx` → ModelCatalogSkeleton
   - `app/(dashboard)/training/jobs/loading.tsx` → CardListSkeleton
   - `app/(dashboard)/training/configure/loading.tsx` → Custom form skeleton
   - `app/(dashboard)/deployments/loading.tsx` → TableSkeleton with page header

**Key implementation details:**
- Skeleton layouts use same Card/CardHeader/CardContent wrappers as real components
- Same grid classes and spacing to prevent layout shift
- Outer containers match page.tsx wrapper classes (space-y-6, space-y-8)
- Next.js automatically shows loading.tsx during route transitions

**Verification:** Build succeeded, all loading.tsx files compile without errors

### Task 2: Create reusable EmptyState, upgrade all empty states, and add ML metric constants

**Commit:** 74fcf9b

1. **EmptyState component** (`app/(dashboard)/components/empty-state.tsx`):
   - Accepts: icon (LucideIcon), title, description, actionLabel, actionHref
   - Renders centered Card with py-16, icon at h-12 w-12, semantic hierarchy
   - Button linking to actionHref for clear call-to-action

2. **Upgraded empty states**:
   - **Dashboard** (recent-jobs-list.tsx): FolderOpen icon, "No training jobs yet", CTA to /training
   - **Deployments** (deployments/page.tsx): Rocket icon, "No deployments yet", CTA to /training/jobs
   - **Training Jobs** (training/jobs/page.tsx): BrainCircuit icon, "No training jobs yet", CTA to /training/configure

3. **ML metric constants** (`lib/constants/ml-metrics.ts`):
   - **loss**: initial (2.0-5.0), converged (0.1-1.0)
   - **gpuUtilization**: low (25-40%), good (40-60%), excellent (60-85%)
   - **learningRate**: small (0.0001), typical (0.001), large (0.01)
   - **accuracy**: initial (0.4-0.6), trained (0.75-0.95)
   - **latency**: p50 (15-45ms), p95Factor (2.5x), p99Factor (4.0x)
   - **errorRate**: healthy (0.001-0.01), degraded (0.01-0.05)
   - Typed exports for type-safe access
   - Documented as reference, does NOT refactor existing simulators

**Verification:** Build succeeded, no generic "No data" messages found in codebase

## Deviations from Plan

None - plan executed exactly as written.

## Technical Highlights

1. **Next.js loading.tsx convention**: Automatic Suspense boundaries with streaming SSR support, zero client JavaScript
2. **Layout shift prevention**: Skeleton dimensions precisely match final rendered content structure
3. **Contextual empty states**: Domain-specific icons (FolderOpen, Rocket, BrainCircuit) and actionable CTAs
4. **Type-safe constants**: ML_METRIC_RANGES exported with TypeScript types for reliable IDE autocomplete
5. **Reusable patterns**: EmptyState component ensures consistency across all future empty states

## Impact

**UX improvements:**
- Route transitions now show structured content previews instead of blank screens
- Empty states provide helpful guidance and clear next actions
- Perceived performance significantly improved with skeleton loading

**Developer experience:**
- Reusable EmptyState component ensures consistency
- ML metric constants centralize domain knowledge
- Typed constants provide IDE autocomplete and validation

**Accessibility:**
- Loading states maintain semantic structure during transitions
- Empty states provide clear textual guidance (not just visual)

## Files Created

1. `components/ui/spinner.tsx` - Reusable spinner component
2. `app/(dashboard)/components/skeletons/dashboard-skeleton.tsx` - Dashboard loading skeleton
3. `app/(dashboard)/components/skeletons/table-skeleton.tsx` - Table loading skeleton
4. `app/(dashboard)/components/skeletons/card-list-skeleton.tsx` - Card list loading skeleton
5. `app/(dashboard)/components/skeletons/model-catalog-skeleton.tsx` - Model catalog loading skeleton
6. `app/(dashboard)/loading.tsx` - Dashboard route loading state
7. `app/(dashboard)/training/loading.tsx` - Training route loading state
8. `app/(dashboard)/training/jobs/loading.tsx` - Training jobs route loading state
9. `app/(dashboard)/training/configure/loading.tsx` - Configure route loading state
10. `app/(dashboard)/deployments/loading.tsx` - Deployments route loading state
11. `app/(dashboard)/components/empty-state.tsx` - Reusable empty state component
12. `lib/constants/ml-metrics.ts` - ML metric range constants

## Files Modified

1. `app/(dashboard)/components/recent-jobs-list.tsx` - Use EmptyState component
2. `app/(dashboard)/deployments/page.tsx` - Use EmptyState component
3. `app/(dashboard)/training/jobs/page.tsx` - Use EmptyState component

## Dependencies Satisfied

- All route groups under `app/(dashboard)/` now have loading states
- EmptyState component provides consistent pattern for future empty states
- ML metric constants available for Phase 7 verification and future normalization

## Next Steps

Ready for Plan 2 of Phase 7 (responsive design and mobile optimization).

## Self-Check: PASSED

**Created files verified:**

```
✓ components/ui/spinner.tsx exists
✓ app/(dashboard)/components/skeletons/dashboard-skeleton.tsx exists
✓ app/(dashboard)/components/skeletons/table-skeleton.tsx exists
✓ app/(dashboard)/components/skeletons/card-list-skeleton.tsx exists
✓ app/(dashboard)/components/skeletons/model-catalog-skeleton.tsx exists
✓ app/(dashboard)/loading.tsx exists
✓ app/(dashboard)/training/loading.tsx exists
✓ app/(dashboard)/training/jobs/loading.tsx exists
✓ app/(dashboard)/training/configure/loading.tsx exists
✓ app/(dashboard)/deployments/loading.tsx exists
✓ app/(dashboard)/components/empty-state.tsx exists
✓ lib/constants/ml-metrics.ts exists
```

**Commits verified:**

```
✓ 929709c: feat(07-01): add loading states for all dashboard routes
✓ 74fcf9b: feat(07-01): add reusable empty states and ML metric constants
```

All claimed files exist, all commits present in git history.
