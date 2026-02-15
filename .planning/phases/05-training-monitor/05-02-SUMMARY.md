---
phase: 05-training-monitor
plan: 02
subsystem: training-operations
tags: [server-actions, api-routes, toast-notifications, job-management]
dependency_graph:
  requires:
    - 05-01-PLAN.md (TrainingSimulator service, trainingMetrics schema)
    - 04-02-PLAN.md (createTrainingJob action)
    - Phase 1 (DB schema, Drizzle ORM setup)
  provides:
    - Server Actions for training state transitions (start, simulate, fail)
    - Metrics polling API endpoint
    - Training jobs list UI with status-based actions
    - Sonner toaster for global notifications
  affects:
    - 05-03-PLAN.md (will consume Server Actions and API route for real-time monitor)
tech_stack:
  added:
    - sonner (toast notifications)
  patterns:
    - Error-as-data in Server Actions (return objects, not throw)
    - Direct DB queries for API routes (no cache for polling freshness)
    - React cache() for Server Component queries
    - useTransition for async Server Action pending state
    - Next.js 15+ async params pattern
key_files:
  created:
    - app/(dashboard)/training/jobs/actions.ts (Server Actions)
    - app/(dashboard)/training/jobs/page.tsx (Jobs list Server Component)
    - app/(dashboard)/training/jobs/job-actions.tsx (Client component for actions)
    - app/api/training/[id]/metrics/route.ts (Metrics polling endpoint)
  modified:
    - lib/db/queries.ts (added getAllJobs, getTrainingJob, getTrainingMetrics)
    - app/layout.tsx (mounted Sonner Toaster)
decisions:
  - Server Actions use error-as-data pattern for safer error handling (no throwing)
  - API route uses direct DB queries (bypassing cache) for fresh polling data
  - Jobs list page uses Card layout for scannable job metadata
  - JobActions component provides status-specific controls (Start/Stop/View)
  - Sonner richColors mode for semantic toast styling (green success, red error)
  - simulateTrainingStep auto-completes job when all steps generated
metrics:
  tasks_completed: 2
  files_created: 4
  files_modified: 2
  duration: 176 seconds (2 minutes)
  commits: 2
  completed_at: 2026-02-15
---

# Phase 5 Plan 2: Training Operations Data Layer

Training job state management via Server Actions, metrics polling API, jobs list UI, and Sonner toaster for notifications.

## Objectives Achieved

Built the complete data layer for training operations:
- Server Actions for training state transitions (queued→running→complete/failed)
- Simulated training step execution with metric persistence
- Metrics polling API endpoint for client-side updates
- Jobs list page with status-specific actions
- Global toast notification system

## Tasks Completed

### Task 1: Server Actions and Metrics API Route
**Commit:** `80950fc`

Created comprehensive training operations layer:

**Query Functions (lib/db/queries.ts):**
- `getAllJobs()` — fetch all jobs ordered by createdAt DESC (cached)
- `getTrainingJob(id)` — fetch single job by ID (cached)
- `getTrainingMetrics(jobId, limit=200)` — fetch metrics ordered by step ASC (cached)

**Server Actions (app/(dashboard)/training/jobs/actions.ts):**
- `startTrainingJob(jobId)` — transition queued job to running status
  - Validates status is "queued" before transition
  - Revalidates /, /training/jobs, /training/jobs/[id] paths
  - Returns error-as-data: `{ success: boolean, error?: string }`

- `simulateTrainingStep(jobId)` — generate one training metric point
  - Counts existing metrics to calculate next step
  - Uses TrainingSimulator to generate realistic loss/accuracy
  - Calculates epoch from step (100 steps per epoch)
  - Auto-completes job when nextStep > totalSteps
  - Returns `{ success: true, complete: boolean, progress: number }`
  - On error: marks job as "failed" and returns error object

- `failTrainingJob(jobId)` — manually stop/fail a job
  - Validates status is "running" or "queued"
  - Updates status to "failed"
  - Revalidates paths

**API Route (app/api/training/[id]/metrics/route.ts):**
- GET endpoint for polling job + metrics data
- Uses direct DB queries (no cache) for fresh data
- Handles Next.js 15+ async params: `const { id } = await params`
- Returns JSON: `{ job, metrics }` with metrics limited to 200 points
- Proper error handling: 400 for invalid ID, 404 for missing job, 500 for server errors

### Task 2: Training Jobs List Page and Sonner Toaster
**Commit:** `d777028`

Created jobs list UI and notification system:

**Jobs List Page (app/(dashboard)/training/jobs/page.tsx):**
- Server Component fetching all jobs via getAllJobs()
- Card-based layout showing job metadata:
  - Name, model name, status badge
  - Epochs, learning rate, created date (relative format)
  - Status-specific action buttons via JobActions component
- Empty state with link to /training/configure
- "New Job" button in page header

**JobActions Client Component (app/(dashboard)/training/jobs/job-actions.tsx):**
- Status-specific controls:
  - **Queued:** "Start" button → calls startTrainingJob
  - **Running:** "Stop" button → calls failTrainingJob
  - **Complete/Failed:** "View" link → navigates to /training/jobs/[id]
- Uses useTransition for pending state during Server Action calls
- Toast notifications for success/error feedback via Sonner

**Sonner Toaster (app/layout.tsx):**
- Mounted globally after Providers, before closing body
- Position: top-right
- richColors enabled for semantic coloring (green success, red error)

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

All verification criteria met:

✓ `pnpm build` passes with no errors
✓ `/training/jobs` route exists and renders
✓ Server Actions compile and export correct functions
✓ API route at `/api/training/[id]/metrics` compiles
✓ Sonner Toaster renders in app shell
✓ StatusBadge reused from existing component
✓ date-fns already installed for date formatting

## Key Integration Points

**Server Actions consume:**
- TrainingSimulator service (from 05-01)
- trainingJobs, trainingMetrics schema tables
- Drizzle ORM for DB operations

**API Route consumed by:**
- Next plan (05-03) for polling job/metrics data in real-time monitor UI

**Jobs List Page integrates:**
- StatusBadge component (from Phase 1)
- getAllJobs query function
- JobActions for user controls
- date-fns for relative timestamps

## Technical Notes

**Error-as-data pattern:**
All Server Actions return `{ success: boolean, error?: string }` instead of throwing. This provides safer error handling and clearer control flow in client components.

**Polling freshness:**
API route uses direct DB queries (bypassing React cache) to ensure fresh data for polling. Server Component queries use cache() for deduplication.

**Auto-completion:**
`simulateTrainingStep` automatically transitions job to "complete" when all steps are generated (nextStep > totalSteps). No separate completion action needed.

**Next.js 15+ params:**
API route handles async params: `const { id } = await params` per Next.js 15+ requirements.

**Revalidation:**
All state-changing actions revalidate /, /training/jobs, and /training/jobs/[id] to ensure fresh data across app.

## Testing Notes

**Manual testing paths:**
1. Create job via /training/configure
2. Navigate to /training/jobs → see queued job
3. Click "Start" → job transitions to running, toast shows success
4. API endpoint `/api/training/[id]/metrics` returns job + empty metrics array
5. Click "Stop" on running job → transitions to failed
6. Completed/failed jobs show "View" link

**Expected behavior:**
- Start button only appears for queued jobs
- Stop button only appears for running jobs
- Toast notifications appear on all actions
- Invalid actions (start running job) return error messages
- API route returns 404 for non-existent jobs

## Files Modified

**Created:**
- `app/(dashboard)/training/jobs/actions.ts` (203 lines)
- `app/(dashboard)/training/jobs/page.tsx` (87 lines)
- `app/(dashboard)/training/jobs/job-actions.tsx` (67 lines)
- `app/api/training/[id]/metrics/route.ts` (58 lines)

**Modified:**
- `lib/db/queries.ts` (+32 lines) — added 3 query functions
- `app/layout.tsx` (+2 lines) — mounted Sonner Toaster

**Total:** 4 files created, 2 files modified, 449 lines added

## Next Steps

Plan 05-03 will build the real-time training monitor UI:
- Consume `simulateTrainingStep` Server Action for step-by-step simulation
- Poll `/api/training/[id]/metrics` for live data updates
- Render real-time loss/accuracy charts using Recharts
- Use useInterval hook (from 05-01) for polling logic

## Self-Check

Verifying all claimed artifacts exist:

### Files Created
✓ app/(dashboard)/training/jobs/actions.ts
✓ app/(dashboard)/training/jobs/page.tsx
✓ app/(dashboard)/training/jobs/job-actions.tsx
✓ app/api/training/[id]/metrics/route.ts

### Files Modified
✓ lib/db/queries.ts
✓ app/layout.tsx

### Commits
✓ 80950fc: feat(05-02): add training operations Server Actions and metrics API
✓ d777028: feat(05-02): add training jobs list page and mount Sonner toaster

**Self-Check: PASSED** ✓
