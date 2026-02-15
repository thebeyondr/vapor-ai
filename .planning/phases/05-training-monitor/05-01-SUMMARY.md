---
phase: 05-training-monitor
plan: 01
subsystem: training-monitor/foundation
tags: [schema, simulator, hooks, dependencies]
dependency_graph:
  requires: [04-02]
  provides: [trainingMetrics-table, TrainingSimulator, useInterval]
  affects: [05-02, 05-03]
tech_stack:
  added: [recharts, sonner, date-fns]
  patterns: [exponential-decay, gaussian-noise, declarative-intervals]
key_files:
  created:
    - lib/db/schema.ts (trainingMetrics table)
    - lib/services/training-simulator.ts
    - lib/hooks/use-interval.ts
    - components/ui/progress.tsx
  modified:
    - package.json
decisions:
  - summary: "Exponential decay with diminishing Gaussian noise for realistic loss curves"
    rationale: "Research showed realistic training curves follow exponential decay with noise that decreases as model converges"
    alternatives: ["linear decay", "fixed noise", "no noise"]
    impact: "Simulator produces visually realistic training curves matching actual ML behavior"
  - summary: "Dan Abramov's declarative interval pattern for useInterval hook"
    rationale: "Proven pattern that handles cleanup, pause states, and callback updates correctly in React"
    alternatives: ["raw setInterval", "custom implementation"]
    impact: "Reliable polling with proper React lifecycle management"
  - summary: "Cascade delete for trainingMetrics when job deleted"
    rationale: "Metrics have no value without their parent job, cascading prevents orphaned data"
    alternatives: ["manual cleanup", "soft delete"]
    impact: "Automatic cleanup maintains database integrity"
metrics:
  duration: "179s (2min)"
  tasks_completed: 2
  files_created: 4
  files_modified: 2
  commits: 2
  completed_at: "2026-02-15T18:31:39Z"
---

# Phase 05 Plan 01: Training Monitor Foundation Summary

**One-liner:** Database schema for metrics persistence, exponential decay simulator with diminishing noise, and declarative polling hook

## What Was Built

Foundation layer for the training monitor with three core pieces:

1. **trainingMetrics schema table** - Neon Postgres table with foreign key to trainingJobs, indexed on jobId for fast queries
2. **TrainingSimulator service** - Realistic loss/accuracy curve generation using exponential decay with Gaussian noise that diminishes as training progresses
3. **useInterval hook** - Declarative interval management for polling, supporting pause and automatic cleanup
4. **Dependencies installed** - recharts (charts), sonner (toasts), date-fns (time formatting), ShadCN progress component

## Implementation Details

### Database Schema

Added `trainingMetrics` table to `lib/db/schema.ts`:

```typescript
export const trainingMetrics = pgTable("training_metrics", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => trainingJobs.id, { onDelete: "cascade" }),
  epoch: integer("epoch").notNull(),
  step: integer("step").notNull(),
  loss: real("loss").notNull(),
  accuracy: real("accuracy"),
  learningRate: real("learning_rate"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  jobIdIdx: index("training_metrics_job_id_idx").on(table.jobId),
}))
```

**Key decisions:**
- Cascade delete ensures metrics are cleaned up when job is deleted
- Index on `jobId` enables fast queries for metric series
- `accuracy` and `learningRate` nullable for flexibility in what metrics are tracked

### TrainingSimulator Service

Implemented realistic curve generation in `lib/services/training-simulator.ts`:

**Loss generation formula:**
```typescript
baseLoss = finalLoss + (initialLoss - finalLoss) * exp(-decayRate * step)
noiseScale = 0.1 * (1 - progress * 0.8)  // Diminishes from 0.1 to 0.02
loss = baseLoss + gaussianNoise * noiseScale
```

**Accuracy generation:**
```typescript
baseAccuracy = 1 - (loss / initialLoss)  // Inverse relationship
accuracy = baseAccuracy + smallNoise
```

**Why exponential decay with diminishing noise?**
- Matches real ML training behavior: rapid initial improvement, then convergence
- Noise starts high (model unstable early), reduces as model stabilizes
- Gaussian distribution creates realistic variance (not just ±random)
- Floor at 0.05 prevents unrealistic negative or zero loss

### useInterval Hook

Implemented Dan Abramov's declarative interval pattern in `lib/hooks/use-interval.ts`:

```typescript
export function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return  // Pause when delay is null
    const id = setInterval(() => savedCallback.current?.(), delay)
    return () => clearInterval(id)
  }, [delay])
}
```

**Why this pattern?**
- Ref stores latest callback → avoids stale closures
- `delay === null` pauses interval → simple pause/resume API
- Cleanup function prevents memory leaks
- Declarative API matches React mental model

### Dependencies

Installed via pnpm:
- **recharts** (3.7.0) - Chart library for loss/accuracy visualization
- **sonner** (2.0.7) - Toast notifications for training events
- **date-fns** (4.1.0) - Time formatting for metric timestamps
- **ShadCN progress** - Progress bar component for training completion

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed useRef initial value TypeScript error**
- **Found during:** Task 2, first build attempt
- **Issue:** `useRef<() => void>()` called with no arguments, TypeScript expected 1
- **Fix:** Changed to `useRef(callback)` to initialize with the callback parameter
- **Files modified:** `lib/hooks/use-interval.ts`
- **Commit:** e2666a9

## Testing & Verification

**Build verification:**
- ✓ `pnpm build` passes with no errors
- ✓ All TypeScript types check correctly
- ✓ Schema pushed to Neon database successfully

**File verification:**
- ✓ `lib/db/schema.ts` exports `trainingMetrics`
- ✓ `lib/services/training-simulator.ts` exports `TrainingSimulator`
- ✓ `lib/hooks/use-interval.ts` exports `useInterval`
- ✓ `components/ui/progress.tsx` exists

**Dependency verification:**
- ✓ recharts, sonner, date-fns in package.json
- ✓ ShadCN progress component installed

**Manual inspection:**
- TrainingSimulator.generateLossPoint returns decreasing values over time
- Noise diminishes as step approaches totalSteps
- Accuracy inversely correlates with loss

## Commits

| Hash | Message |
|------|---------|
| 37f42dc | feat(05-01): add trainingMetrics schema and install dependencies |
| e2666a9 | feat(05-01): create TrainingSimulator and useInterval hook |

## Next Steps

This plan provides the foundation for plans 05-02 and 05-03:

- **05-02** will use `trainingMetrics` table to persist simulated metrics
- **05-02** will use `TrainingSimulator` to generate realistic curves
- **05-02** will use `useInterval` to poll for new metrics every 500ms
- **05-03** will use `recharts` to visualize the metrics
- **05-03** will use `sonner` for training event notifications
- **05-03** will use `date-fns` to format timestamps
- **05-03** will use ShadCN `Progress` component for training progress

All foundation pieces are in place and ready for integration.

## Self-Check: PASSED

✓ trainingMetrics table exists in database (verified via db:push)
✓ lib/services/training-simulator.ts exists and exports TrainingSimulator
✓ lib/hooks/use-interval.ts exists and exports useInterval
✓ components/ui/progress.tsx exists
✓ recharts, sonner, date-fns in package.json dependencies
✓ Commit 37f42dc exists in git history
✓ Commit e2666a9 exists in git history
