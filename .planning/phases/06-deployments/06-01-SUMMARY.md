---
phase: 06-deployments
plan: 01
subsystem: deployments
tags: [deployments, tanstack-table, drizzle-orm, inference-metrics, versioning]

# Dependency graph
requires:
  - phase: 05-training-monitor
    provides: completed training jobs ready for deployment
provides:
  - deployments database schema with versioning and job references
  - inference metrics simulator for realistic latency/traffic data
  - deploy Server Action with validation and duplicate prevention
  - deploy buttons on completed training jobs (list + detail pages)
affects: [06-02, dashboard]

# Tech tracking
tech-stack:
  added: ["@tanstack/react-table@8.21.3", "shadcn table component"]
  patterns: ["semantic versioning for model deployments", "inference metrics simulation", "error-as-data in deploy action"]

key-files:
  created:
    - lib/db/schema.ts (deployments table)
    - lib/services/inference-simulator.ts
    - app/(dashboard)/deployments/actions.ts
    - app/(dashboard)/training/jobs/[id]/components/deploy-button.tsx
    - components/ui/table.tsx
  modified:
    - lib/db/queries.ts
    - app/(dashboard)/training/jobs/job-actions.tsx
    - app/(dashboard)/training/jobs/[id]/page.tsx

key-decisions:
  - "Skip 'deploying' state - instant deployment to 'active' for demo simplicity"
  - "Use restrict on delete for job FK - prevents accidental deletion of deployed jobs"
  - "Semantic versioning v1.{count}.0 for clear version progression"
  - "Plain exported function (not class) for inference simulator"
  - "Prevent duplicate active deployments per job"

patterns-established:
  - "Box-Muller transform for Gaussian noise in metric simulation"
  - "Deterministic-ish metrics using deployment ID as seed offset"
  - "P95/P99 latency as multiples of P50 for realistic distributions"

# Metrics
duration: 3min
completed: 2026-02-15
---

# Phase 6 Plan 01: Deployment Infrastructure Summary

**Deployments schema with semantic versioning, inference metrics simulator using realistic latency distributions, and deploy action creating deployment records from completed training jobs**

## Performance

- **Duration:** 3 minutes
- **Started:** 2026-02-15T19:40:16Z
- **Completed:** 2026-02-15T19:43:29Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Deployments table in Neon database with job references, semantic versioning, and status tracking
- Inference metrics simulator generating realistic P50/P95/P99 latency, request volume, and error rates
- Deploy Server Action with validation (completed jobs only, no duplicate active deployments)
- Deploy buttons on training jobs list and detail pages with redirect to /deployments
- TanStack Table and ShadCN table component installed for Plan 02

## Task Commits

Each task was committed atomically:

1. **Task 1: Add deployments schema, install dependencies, create inference simulator** - `33ef05d` (feat)
2. **Task 2: Create deploy Server Action and add deploy button to training jobs** - `f466be6` (feat)

## Files Created/Modified

**Created:**
- `lib/db/schema.ts` - Added deployments table with job FK, versioning, status enum
- `lib/services/inference-simulator.ts` - Generates realistic inference metrics using Box-Muller transform
- `app/(dashboard)/deployments/actions.ts` - deployTrainingJob Server Action with validation
- `app/(dashboard)/training/jobs/[id]/components/deploy-button.tsx` - Client component for deploy action
- `components/ui/table.tsx` - ShadCN table component (for Plan 02)

**Modified:**
- `lib/db/queries.ts` - Added deployment queries (getAllDeployments, getDeploymentCounts, etc.)
- `app/(dashboard)/training/jobs/job-actions.tsx` - Added deploy button for completed jobs
- `app/(dashboard)/training/jobs/[id]/page.tsx` - Added DeployButton to job detail header

## Decisions Made

**1. Skip "deploying" state for demo simplicity**
- Deployments created directly in "active" state
- Rationale: Simulating gradual rollout adds complexity without portfolio value

**2. Use restrict on delete for job FK**
- Prevents deleting training jobs that have deployments
- Rationale: Forces users to pause/delete deployments first (clearer than cascade)

**3. Semantic versioning v1.{count}.0**
- Auto-increment middle version number (v1.0.0, v1.1.0, v1.2.0)
- Rationale: Clear version progression, familiar semver pattern

**4. Plain exported function for inference simulator**
- Used `export function generateInferenceMetrics()` instead of class
- Rationale: Simpler, no state needed, matches training simulator pattern

**5. Prevent duplicate active deployments per job**
- Validation check before creating deployment
- Rationale: User must pause/delete existing deployment before redeploying

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all dependencies installed successfully, schema migration succeeded, build passed on first try.

## User Setup Required

None - no external service configuration required. Database schema automatically pushed to existing Neon instance.

## Next Phase Readiness

**Ready for Plan 02:**
- Deployments schema is live in database
- Inference simulator tested and generating realistic metrics
- TanStack Table dependency installed and ready
- Deploy action creates records that can be fetched and displayed

**Verification:**
- `pnpm build` passes with no TypeScript errors
- Deploy buttons appear on completed training jobs
- Clicking deploy creates deployment record with auto-generated version

## Self-Check: PASSED

All claims verified:
- ✓ lib/services/inference-simulator.ts exists
- ✓ app/(dashboard)/deployments/actions.ts exists
- ✓ app/(dashboard)/training/jobs/[id]/components/deploy-button.tsx exists
- ✓ components/ui/table.tsx exists
- ✓ Commit 33ef05d found
- ✓ Commit f466be6 found
- ✓ @tanstack/react-table in package.json

---
*Phase: 06-deployments*
*Completed: 2026-02-15*
