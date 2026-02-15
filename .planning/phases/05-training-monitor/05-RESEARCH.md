# Phase 5: Training Monitor - Research

**Researched:** 2026-02-15
**Domain:** Real-time training visualization, metrics simulation, state management
**Confidence:** HIGH

## Summary

Phase 5 implements real-time training progress monitoring where users watch training jobs transition through states (queued → running → complete/failed) with live-updating loss curves, progress indicators, and time estimates. This is the "wow feature" that transforms the dashboard from a static config tool into an immersive training experience.

The research confirms that realistic training curve simulation requires exponential decay with stochastic noise (not random values). Real-time updates in React can be achieved through polling with useInterval hooks or Server-Sent Events (SSE) for more sophisticated implementations. Recharts handles streaming data updates well with proper buffering. The key architectural decision is separating the metrics simulation service from React component state, using a background process to generate realistic training metrics and persist them to the database.

Training loss curves typically follow exponential or power-law decay patterns with noise from mini-batch stochasticity. For this demo, exponential decay with Gaussian noise provides convincing simulation: `loss(t) = initial_loss * exp(-decay_rate * t) + noise`, where noise diminishes as training progresses to simulate convergence.

**Primary recommendation:** Build a training monitor page with Recharts for loss curves, implement a Server Action that simulates training progress in the background (updating database with metrics at intervals), use polling or SSE to fetch updates client-side, and manage job state transitions with explicit status enum validation.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| recharts | ^2.12+ | Line/area charts for loss curves | Declarative React API, handles real-time data updates, lightweight for dashboard use case |
| sonner | Latest | Toast notifications | ShadCN-compatible, elegant toast library with promise pattern support for training status updates |
| date-fns | ^4.x | Time formatting | Lightweight date utility for ETA calculations and timestamp formatting |
| drizzle-orm | ^0.45.1 (installed) | Database ORM | Already in use, will persist training metrics as timeseries data |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| ShadCN Progress | (CLI install) | Progress bar component | Epoch and overall training progress visualization |
| ShadCN Badge | (installed) | Status indicators | Job status (queued/running/complete/failed) with semantic colors |
| useInterval hook | (custom) | Polling mechanism | Fetch training metrics at regular intervals (1-2 second updates) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Polling (useInterval) | Server-Sent Events (SSE) | SSE more efficient for one-way updates, but polling is simpler and sufficient for demo with 1-2s intervals |
| Polling | WebSockets | WebSockets overkill for simulated data, adds complexity without portfolio value |
| Recharts | Victory, Visx, Plotly.js | Recharts best balance of features/bundle-size for this use case |
| sonner | react-hot-toast, react-toastify | Sonner is modern, ShadCN-compatible, has cleaner API |
| Manual state machine | XState | XState overkill for 4-state machine (queued/running/complete/failed) |

**Installation:**
```bash
# Install missing dependencies
pnpm add recharts sonner date-fns

# Add ShadCN components
npx shadcn add progress
npx shadcn add badge  # May already be installed
npx shadcn add card   # May already be installed
```

## Architecture Patterns

### Recommended Project Structure
```
app/(dashboard)/training/
├── jobs/
│   ├── [id]/
│   │   ├── page.tsx                    # Training monitor page (Phase 5 - NEW)
│   │   └── components/
│   │       ├── loss-chart.tsx          # Recharts loss curve (Phase 5 - NEW)
│   │       ├── training-stats.tsx      # Epoch/ETA display (Phase 5 - NEW)
│   │       └── job-controls.tsx        # Stop/deploy actions (Phase 5 - NEW)
│   ├── page.tsx                        # All jobs list (Phase 5 - NEW)
│   └── actions.ts                      # Server Actions for job operations (Phase 5 - NEW)
├── configure/
│   └── actions.ts                      # createTrainingJob (Phase 4 - EXISTS)
└── page.tsx                            # Model discovery (Phase 3 - EXISTS)

lib/
├── services/
│   └── training-simulator.ts           # Metrics generation service (Phase 5 - NEW)
├── db/
│   └── schema.ts                       # Add trainingMetrics table (Phase 5 - MODIFY)
└── hooks/
    └── use-interval.ts                 # Custom polling hook (Phase 5 - NEW)
```

### Pattern 1: Separate Metrics Table for Timeseries Data
**What:** Store individual metric points in a separate table with foreign key to training job
**When to use:** Always for timeseries data - prevents row size explosion and enables efficient querying
**Example:**
```typescript
// lib/db/schema.ts
export const trainingMetrics = pgTable("training_metrics", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => trainingJobs.id, { onDelete: 'cascade' }),
  epoch: integer("epoch").notNull(),
  step: integer("step").notNull(),
  loss: real("loss").notNull(),
  accuracy: real("accuracy"),           // Optional, can be null
  learningRate: real("learning_rate"),  // Tracks LR if using schedules
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Index for efficient querying by job
export const trainingMetricsJobIdIdx = index("training_metrics_job_id_idx")
  .on(trainingMetrics.jobId);
```
**Source:** [Drizzle ORM - PostgreSQL Best Practices](https://gist.github.com/productdevbook/7c9ce3bbeb96b3fabc3c7c2aa2abc717)

### Pattern 2: Exponential Decay Loss Curve Simulation
**What:** Generate realistic training loss curves using exponential decay with diminishing noise
**When to use:** Mock training metrics that need to look convincing
**Example:**
```typescript
// lib/services/training-simulator.ts
interface TrainingMetricPoint {
  epoch: number;
  step: number;
  loss: number;
  accuracy?: number;
}

export class TrainingSimulator {
  private initialLoss = 2.5;      // Typical for untrained model
  private finalLoss = 0.3;        // Target convergence
  private decayRate = 0.15;       // Controls convergence speed

  /**
   * Generate realistic loss value for given step
   * Based on exponential decay with noise
   * Source: Google ML Crash Course - Loss Curves
   */
  generateLossPoint(step: number, totalSteps: number): number {
    // Exponential decay: loss(t) = L_final + (L_initial - L_final) * exp(-decay_rate * t)
    const progress = step / totalSteps;
    const baseLoss = this.finalLoss +
      (this.initialLoss - this.finalLoss) * Math.exp(-this.decayRate * step);

    // Add diminishing noise (simulates mini-batch stochasticity)
    // Noise decreases as training progresses (convergence)
    const noiseScale = 0.1 * (1 - progress * 0.8); // 80% noise reduction by end
    const noise = (Math.random() - 0.5) * noiseScale;

    return Math.max(0.05, baseLoss + noise); // Floor at 0.05 to avoid negative
  }

  /**
   * Generate accuracy from loss (inverse relationship)
   */
  generateAccuracy(loss: number): number {
    // Simple heuristic: accuracy = 1 - (loss / initial_loss)
    const baseAccuracy = 1 - (loss / this.initialLoss);
    const noise = (Math.random() - 0.5) * 0.02; // Small noise
    return Math.max(0, Math.min(1, baseAccuracy + noise));
  }
}
```
**Source:** [Overfitting: Interpreting loss curves - Google ML](https://developers.google.com/machine-learning/crash-course/overfitting/interpreting-loss-curves)

### Pattern 3: useInterval Hook for Declarative Polling
**What:** Custom hook that wraps setInterval with proper cleanup and dynamic delays
**When to use:** Any periodic data fetching (training metrics, dashboard refresh)
**Example:**
```typescript
// lib/hooks/use-interval.ts
import { useEffect, useRef } from 'react';

/**
 * Declarative setInterval hook
 * Based on Dan Abramov's pattern
 * Source: https://overreacted.io/making-setinterval-declarative-with-react-hooks/
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>();

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (delay === null) return; // Pause if delay is null

    function tick() {
      savedCallback.current?.();
    }

    const id = setInterval(tick, delay);
    return () => clearInterval(id); // Cleanup on unmount
  }, [delay]);
}
```
**Source:** [Making setInterval Declarative with React Hooks](https://overreacted.io/making-setinterval-declarative-with-react-hooks/)

### Pattern 4: Server Action for Background Metrics Generation
**What:** Server Action that runs in the background, periodically updating database with new metrics
**When to use:** Simulating long-running processes (training, deployments)
**Example:**
```typescript
// app/(dashboard)/training/jobs/actions.ts
"use server";

import { db } from "@/lib/db/client";
import { trainingJobs, trainingMetrics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { TrainingSimulator } from "@/lib/services/training-simulator";
import { revalidatePath } from "next/cache";

/**
 * Simulate one training step (epoch)
 * Called by client polling or background job
 */
export async function simulateTrainingStep(jobId: number) {
  // Fetch job
  const job = await db.query.trainingJobs.findFirst({
    where: eq(trainingJobs.id, jobId)
  });

  if (!job || job.status !== "running") {
    return { success: false, error: "Job not running" };
  }

  // Get current progress
  const metrics = await db.query.trainingMetrics.findMany({
    where: eq(trainingMetrics.jobId, jobId),
    orderBy: (metrics, { desc }) => [desc(metrics.step)]
  });

  const currentStep = metrics[0]?.step || 0;
  const totalSteps = job.epochs * 100; // Assume 100 steps per epoch
  const nextStep = currentStep + 1;

  // Generate next metric point
  const simulator = new TrainingSimulator();
  const loss = simulator.generateLossPoint(nextStep, totalSteps);
  const accuracy = simulator.generateAccuracy(loss);

  // Insert metric
  await db.insert(trainingMetrics).values({
    jobId,
    epoch: Math.floor(nextStep / 100) + 1,
    step: nextStep,
    loss,
    accuracy,
    learningRate: job.learningRate
  });

  // Check if complete
  if (nextStep >= totalSteps) {
    await db.update(trainingJobs)
      .set({
        status: "complete",
        updatedAt: new Date()
      })
      .where(eq(trainingJobs.id, jobId));
  }

  revalidatePath(`/training/jobs/${jobId}`);

  return { success: true, progress: nextStep / totalSteps };
}
```

### Pattern 5: Recharts with Real-Time Updates
**What:** Recharts LineChart that updates smoothly as new data arrives
**When to use:** Any time-series visualization with streaming data
**Example:**
```typescript
// app/(dashboard)/training/jobs/[id]/components/loss-chart.tsx
"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LossChartProps {
  data: Array<{ step: number; loss: number }>;
}

export function LossChart({ data }: LossChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="step"
          label={{ value: 'Training Step', position: 'insideBottom', offset: -5 }}
        />
        <YAxis
          label={{ value: 'Loss', angle: -90, position: 'insideLeft' }}
          domain={[0, 'auto']}  // Start at 0, auto-scale max
        />
        <Tooltip
          formatter={(value: number) => value.toFixed(4)}
          labelFormatter={(label) => `Step ${label}`}
        />
        <Line
          type="monotone"
          dataKey="loss"
          stroke="hsl(var(--chart-1))"
          strokeWidth={2}
          dot={false}  // Disable dots for smoother appearance
          animationDuration={300}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```
**Source:** [Implementing Real-Time Data Visualization With Recharts](https://vibe-studio.ai/insights/implementing-real-time-data-visualization-with-recharts)

### Pattern 6: ETA Calculation with Moving Average
**What:** Calculate estimated time remaining using exponential moving average of step duration
**When to use:** Progress bars with time estimates
**Example:**
```typescript
// lib/utils/eta-calculator.ts
export class ETACalculator {
  private stepDurations: number[] = [];
  private alpha = 0.3; // Smoothing factor for exponential moving average

  /**
   * Add new step duration and recalculate ETA
   */
  addStepDuration(durationMs: number): void {
    this.stepDurations.push(durationMs);
    // Keep last 50 samples for moving average
    if (this.stepDurations.length > 50) {
      this.stepDurations.shift();
    }
  }

  /**
   * Get estimated time remaining in seconds
   * Uses exponential moving average to smooth out variance
   */
  getETA(stepsRemaining: number): number {
    if (this.stepDurations.length === 0) return 0;

    // Exponential moving average
    let ema = this.stepDurations[0];
    for (let i = 1; i < this.stepDurations.length; i++) {
      ema = this.alpha * this.stepDurations[i] + (1 - this.alpha) * ema;
    }

    return (ema * stepsRemaining) / 1000; // Convert to seconds
  }

  /**
   * Format ETA as human-readable string
   */
  formatETA(seconds: number): string {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`;
  }
}
```
**Source:** [react-progress-timer - Automatic ETA calculation](https://github.com/whizsid/react-progress-timer)

### Pattern 7: Sonner Toast for Status Notifications
**What:** Promise-based toast notifications for training lifecycle events
**When to use:** Async operations with loading → success/error states
**Example:**
```typescript
// app/(dashboard)/training/jobs/[id]/page.tsx (client component)
"use client";

import { toast } from "sonner";
import { startTrainingJob, stopTrainingJob } from "../actions";

export function TrainingControls({ jobId }: { jobId: number }) {

  async function handleStart() {
    toast.promise(
      startTrainingJob(jobId),
      {
        loading: 'Starting training job...',
        success: (data) => `Training started - ${data.name}`,
        error: 'Failed to start training job',
      }
    );
  }

  async function handleStop() {
    toast.error('Training job stopped', {
      description: 'Job will complete current epoch before stopping'
    });
    await stopTrainingJob(jobId);
  }

  return (
    <div className="flex gap-2">
      <Button onClick={handleStart}>Start</Button>
      <Button variant="destructive" onClick={handleStop}>Stop</Button>
    </div>
  );
}
```
**Source:** [Shadcn/ui React Series — Part 19: Sonner](https://medium.com/@rivainasution/shadcn-ui-react-series-part-19-sonner-modern-toast-notifications-done-right-903757c5681f)

### Pattern 8: Status Badge with Semantic Colors
**What:** Type-safe status badges with color + icon + text for accessibility
**When to use:** Job/deployment status indicators
**Example:**
```typescript
// components/ui/status-badge.tsx
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import type { TrainingStatus } from "@/lib/db/schema";

const statusConfig = {
  queued: {
    label: "Queued",
    variant: "secondary" as const,
    icon: Clock,
  },
  running: {
    label: "Running",
    variant: "default" as const,
    icon: Loader2,
  },
  complete: {
    label: "Complete",
    variant: "success" as const,
    icon: CheckCircle2,
  },
  failed: {
    label: "Failed",
    variant: "destructive" as const,
    icon: XCircle,
  },
} satisfies Record<TrainingStatus, { label: string; variant: string; icon: any }>;

export function StatusBadge({ status }: { status: TrainingStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
}
```

### Anti-Patterns to Avoid

- **Storing all metrics in training_jobs row:** Don't use JSON column to store metrics array - use separate table for timeseries data. Queryability and scalability issues.
- **Random loss values:** Don't use `Math.random()` for loss curves - use exponential decay with noise. Unconvincing, breaks simulation realism.
- **Not cleaning up intervals:** Always return cleanup function from useEffect/useInterval. Memory leaks and stale updates.
- **Fetching entire metrics history on each poll:** Use limit/offset or windowing. Fetch last 100 points, not all 10,000.
- **Blocking Server Actions:** Don't make Server Actions wait for entire training to complete. Simulate one step at a time.
- **Not handling status transitions:** Validate state transitions (can't go from "complete" back to "running"). Use type-safe enum.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| ETA calculation | Manual step tracking and division | Exponential moving average algorithm | Handles variance, outliers, warm-up period |
| Loss curve shapes | Random values or linear decay | Exponential decay with diminishing noise | Realistic ML training behavior, convincing demo |
| Chart animations | Manual requestAnimationFrame | Recharts built-in animations | Handles edge cases, smooth transitions, tested |
| Toast notifications | Custom div positioning and state | Sonner or react-hot-toast | Stacking, timing, animations, accessibility |
| Interval management | Raw setInterval in useEffect | useInterval hook pattern | Cleanup, dynamic delays, latest callback reference |
| Status state machine | If-else chains | Explicit enum + validation function | Type safety, prevents invalid transitions |

**Key insight:** Realistic training simulation is deceptively complex. Loss curves must follow exponential/power-law decay with noise that diminishes over time to simulate convergence. A naive `Math.random()` approach looks fake immediately. ETA calculation requires smoothing (moving averages) to handle variance in step duration. These are solved problems - use established algorithms.

## Common Pitfalls

### Pitfall 1: Polling Too Frequently
**What goes wrong:** Polling every 100ms causes excessive database queries and re-renders
**Why it happens:** Desire for "real-time" feel without considering cost
**How to avoid:** 1-2 second polling interval is sufficient. Training steps take seconds, not milliseconds. Use `delay={isRunning ? 2000 : null}` pattern to pause when not running.
**Warning signs:** High database query count, laggy UI, excessive network requests

### Pitfall 2: Metrics Table Without Index on job_id
**What goes wrong:** Fetching metrics for a job becomes slow as table grows
**Why it happens:** Forgetting to add index on foreign key
**How to avoid:** Always create index on foreign keys, especially for timeseries queries:
```typescript
export const trainingMetricsJobIdIdx = index("training_metrics_job_id_idx")
  .on(trainingMetrics.jobId);
```
**Warning signs:** Slow query performance, database timeouts

### Pitfall 3: Not Limiting Metrics Query
**What goes wrong:** Fetching all 10,000 metric points on every update
**Why it happens:** Query `SELECT * FROM training_metrics WHERE job_id = ?`
**How to avoid:** Use `.limit(100)` and fetch most recent points:
```typescript
const recentMetrics = await db.query.trainingMetrics.findMany({
  where: eq(trainingMetrics.jobId, jobId),
  orderBy: (metrics, { desc }) => [desc(metrics.step)],
  limit: 100
});
```
**Warning signs:** Slow renders, large network payloads

### Pitfall 4: Loss Curve Not Monotonically Decreasing
**What goes wrong:** Loss increases mid-training, looks unrealistic
**Why it happens:** Too much noise in simulation, or using random values
**How to avoid:** Ensure base loss follows exponential decay, noise is small and diminishing:
```typescript
const baseLoss = finalLoss + (initialLoss - finalLoss) * Math.exp(-decay * step);
const noise = (Math.random() - 0.5) * 0.05 * (1 - progress);  // Small, diminishing
```
**Warning signs:** Spiky, non-smooth curves that don't trend downward

### Pitfall 5: Interval Not Cleaning Up on Unmount
**What goes wrong:** Interval continues running after navigating away, causing stale state updates
**Why it happens:** Missing return cleanup function in useEffect
**How to avoid:** Always return cleanup:
```typescript
useEffect(() => {
  const interval = setInterval(() => fetchMetrics(), 2000);
  return () => clearInterval(interval);  // CRITICAL
}, [fetchMetrics]);
```
**Warning signs:** "Can't perform state update on unmounted component" warnings

### Pitfall 6: Not Handling Failed State
**What goes wrong:** Training job stuck in "running" state if error occurs
**Why it happens:** No error handling in simulation loop
**How to avoid:** Wrap simulation in try/catch, transition to "failed" on error:
```typescript
try {
  await simulateTrainingStep(jobId);
} catch (error) {
  await db.update(trainingJobs)
    .set({ status: "failed" })
    .where(eq(trainingJobs.id, jobId));

  toast.error("Training failed", {
    description: error.message
  });
}
```
**Warning signs:** Jobs stuck in "running" state indefinitely

### Pitfall 7: Recharts Domain Not Set Correctly
**What goes wrong:** Y-axis jumps around as new data arrives, disorienting
**Why it happens:** Recharts auto-scales by default
**How to avoid:** Set stable domain for loss axis:
```typescript
<YAxis
  domain={[0, 3]}  // Fixed domain for stability
  // OR
  domain={[0, 'dataMax + 0.5']}  // Auto with padding
/>
```
**Warning signs:** Axis scale changing on every update

## Code Examples

### Complete Training Monitor Page
```typescript
// app/(dashboard)/training/jobs/[id]/page.tsx
import { db } from "@/lib/db/client";
import { trainingJobs, trainingMetrics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { TrainingMonitor } from "./components/training-monitor";

interface PageProps {
  params: { id: string };
}

export default async function TrainingJobPage({ params }: PageProps) {
  const jobId = parseInt(params.id);

  // Fetch job
  const job = await db.query.trainingJobs.findFirst({
    where: eq(trainingJobs.id, jobId)
  });

  if (!job) notFound();

  // Fetch recent metrics (last 200 points)
  const metrics = await db.query.trainingMetrics.findMany({
    where: eq(trainingMetrics.jobId, jobId),
    orderBy: (metrics, { asc }) => [asc(metrics.step)],
    limit: 200
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{job.name}</h1>
        <p className="text-muted-foreground">
          {job.modelName} • {job.epochs} epochs
        </p>
      </div>

      <TrainingMonitor
        job={job}
        initialMetrics={metrics.map(m => ({
          step: m.step,
          loss: m.loss,
          accuracy: m.accuracy || 0
        }))}
      />
    </div>
  );
}
```

### Client-Side Monitor with Polling
```typescript
// app/(dashboard)/training/jobs/[id]/components/training-monitor.tsx
"use client";

import { useState, useEffect } from "react";
import { useInterval } from "@/lib/hooks/use-interval";
import { LossChart } from "./loss-chart";
import { TrainingStats } from "./training-stats";
import { StatusBadge } from "@/components/ui/status-badge";
import type { TrainingJob } from "@/lib/db/schema";

interface TrainingMonitorProps {
  job: TrainingJob;
  initialMetrics: Array<{ step: number; loss: number; accuracy: number }>;
}

export function TrainingMonitor({ job: initialJob, initialMetrics }: TrainingMonitorProps) {
  const [job, setJob] = useState(initialJob);
  const [metrics, setMetrics] = useState(initialMetrics);

  // Poll for updates every 2 seconds if running
  useInterval(
    async () => {
      const response = await fetch(`/api/training/${job.id}/metrics`);
      const data = await response.json();
      setJob(data.job);
      setMetrics(data.metrics);
    },
    job.status === "running" ? 2000 : null  // Pause if not running
  );

  const currentEpoch = metrics[metrics.length - 1]?.step || 0;
  const totalSteps = job.epochs * 100;
  const progress = (currentEpoch / totalSteps) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <StatusBadge status={job.status} />
        <span className="text-sm text-muted-foreground">
          {progress.toFixed(1)}% complete
        </span>
      </div>

      <LossChart data={metrics} />

      <TrainingStats
        currentEpoch={Math.floor(currentEpoch / 100) + 1}
        totalEpochs={job.epochs}
        progress={progress}
      />
    </div>
  );
}
```

### Metrics API Route Handler
```typescript
// app/api/training/[id]/metrics/route.ts
import { db } from "@/lib/db/client";
import { trainingJobs, trainingMetrics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const jobId = parseInt(params.id);

  const job = await db.query.trainingJobs.findFirst({
    where: eq(trainingJobs.id, jobId)
  });

  const metrics = await db.query.trainingMetrics.findMany({
    where: eq(trainingMetrics.jobId, jobId),
    orderBy: (metrics, { asc }) => [asc(metrics.step)],
    limit: 200
  });

  return Response.json({
    job,
    metrics: metrics.map(m => ({
      step: m.step,
      loss: m.loss,
      accuracy: m.accuracy
    }))
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| WebSockets for real-time | Server-Sent Events (SSE) or polling | 2024-2025 | SSE simpler for one-way updates, polling sufficient for low-frequency (1-2s) |
| D3.js for charts | Recharts, Victory, Visx | 2020-2023 | Declarative React APIs replace imperative D3 for most use cases |
| react-hot-toast | Sonner | 2024-2025 | Sonner has cleaner API, better stacking, promise pattern |
| Manual ETA calculation | Exponential moving average | Always best practice | Smooths variance, handles warm-up period |
| Serial data type (deprecated) | Identity columns | PostgreSQL 10+ (2017) | Identity is SQL standard, better for replication |

**Deprecated/outdated:**
- **WebSockets for simple real-time:** Polling or SSE sufficient for demo. WebSockets add complexity.
- **Storing metrics as JSON in job row:** Use separate table for timeseries. JSON prevents efficient queries.
- **Chart.js with React:** Imperative API doesn't fit React patterns. Use Recharts or Victory.

## Realistic Training Curve Research

### Loss Curve Shapes
Based on research, training loss curves can follow several patterns:

1. **Exponential Decay:** Most common for well-behaved training
   - Formula: `L(t) = L_final + (L_initial - L_final) * exp(-k*t)`
   - Typical for models with good hyperparameters

2. **Power Law:** Common for large models
   - Formula: `L(t) = a * t^(-b) + c`
   - Source: [A Multi-Power Law for Loss Curve Prediction](https://arxiv.org/html/2503.12811v1)

3. **Noisy Convergence:** Realistic includes mini-batch stochasticity
   - Base curve (exponential/power) + Gaussian noise
   - Noise diminishes as training progresses (convergence)

**Recommendation for Vapor:** Use exponential decay with diminishing Gaussian noise. It's mathematically simple, visually convincing, and matches typical fine-tuning behavior.

### Realistic Hyperparameter Ranges
From Phase 4 research and ML best practices:

| Parameter | Typical Range | Demo Defaults | Notes |
|-----------|---------------|---------------|-------|
| Initial Loss | 1.5 - 3.0 | 2.5 | Depends on task, higher for random init |
| Final Loss | 0.1 - 0.5 | 0.3 | Good convergence for fine-tuning |
| Training Time | 5-30 min | 2-5 min (demo) | Accelerated for portfolio demo |
| Steps per Epoch | 50-200 | 100 | Balances granularity and data size |

**Source:** [Training and Validation Loss in Deep Learning](https://www.geeksforgeeks.org/deep-learning/training-and-validation-loss-in-deep-learning/)

## Open Questions

1. **Should we support pausing/resuming training jobs?**
   - What we know: Phase 5 requirements mention start/stop but not pause/resume
   - What's unclear: Whether "stop" means permanent halt or pause-able
   - Recommendation: Implement stop as permanent (transition to "failed"). Pause/resume can be Phase 7 enhancement if time permits.

2. **Should metrics persist forever or be pruned?**
   - What we know: Neon free tier has storage limits
   - What's unclear: Whether to implement retention policy (e.g., keep last 1000 points)
   - Recommendation: Keep all metrics for MVP. Add `LIMIT` to queries. Can add retention policy later if needed.

3. **Should we simulate occasional training failures?**
   - What we know: Requirement TRMN-05 mentions failure states should show red badges and toasts
   - What's unclear: Whether failures should happen randomly or only on user action
   - Recommendation: Add manual "Fail Training" button for testing. Don't auto-fail randomly - confusing UX.

4. **Should we use SSE or polling for real-time updates?**
   - What we know: SSE more efficient for one-way updates, polling simpler
   - What's unclear: Whether portfolio value of SSE justifies complexity
   - Recommendation: Start with polling (2s interval). SSE can be Phase 7 upgrade if time permits. Polling is proven pattern and sufficient for demo.

## Sources

### Primary (HIGH confidence)
- [Overfitting: Interpreting loss curves - Google ML](https://developers.google.com/machine-learning/crash-course/overfitting/interpreting-loss-curves) - Official Google ML course on loss curve shapes
- [Implementing Real-Time Data Visualization With Recharts](https://vibe-studio.ai/insights/implementing-real-time-data-visualization-with-recharts) - Recharts real-time patterns
- [Making setInterval Declarative with React Hooks](https://overreacted.io/making-setinterval-declarative-with-react-hooks/) - Dan Abramov's useInterval pattern
- [Drizzle ORM - PostgreSQL Best Practices](https://gist.github.com/productdevbook/7c9ce3bbeb96b3fabc3c7c2aa2abc717) - Schema patterns for timeseries
- [Sonner - shadcn/ui](https://ui.shadcn.com/docs/components/radix/sonner) - Official ShadCN toast component

### Secondary (MEDIUM confidence)
- [Real-Time Web Communication: Long/Short Polling, WebSockets, and SSE Explained + Next.js code](https://medium.com/@brinobruno/real-time-web-communication-long-short-polling-websockets-and-sse-explained-next-js-code-958cd21b67fa) - SSE vs polling comparison
- [Server Sent Events in Node.js and Next.js](https://www.futuredevtech.com/blog/server-sent-events-in-nodejs-and-nextjs-or-building-real-time-updates) - SSE implementation guide
- [Shadcn/ui React Series — Part 19: Sonner](https://medium.com/@rivainasution/shadcn-ui-react-series-part-19-sonner-modern-toast-notifications-done-right-903757c5681f) - Sonner usage patterns (Jan 2026)
- [Training and Validation Loss in Deep Learning](https://www.geeksforgeeks.org/deep-learning/training-and-validation-loss-in-deep-learning/) - Loss curve theory
- [A Multi-Power Law for Loss Curve Prediction](https://arxiv.org/html/2503.12811v1) - Research on loss curve shapes
- [react-progress-timer](https://github.com/whizsid/react-progress-timer) - ETA calculation patterns
- [Building a Typescript State Machine](https://medium.com/@floyd.may/building-a-typescript-state-machine-cc9e55995fa8) - State machine patterns

### Tertiary (LOW confidence - context only)
- Various GitHub discussions on useInterval patterns (verified against Dan Abramov's official pattern)
- Community blog posts on Recharts performance (cross-referenced with official docs)

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** - Recharts and Sonner are established, polling pattern is proven
- Architecture: **HIGH** - Timeseries schema pattern and useInterval are best practices
- Pitfalls: **HIGH** - Common issues documented across multiple sources
- Loss curve simulation: **MEDIUM** - Exponential decay is standard, but Liquid AI-specific behavior unknown

**Research date:** 2026-02-15
**Valid until:** 2026-03-15 (30 days - stable stack, simulation patterns unlikely to change)

**Key limitations:**
- No official Liquid AI training metrics documentation available
- Loss curve shapes are general ML patterns, not Liquid-specific
- Polling vs SSE tradeoff is project-specific (both are valid)
- ETA calculation accuracy depends on simulation step timing (adjustable)

**Next steps for planner:**
1. Create trainingMetrics table migration
2. Implement TrainingSimulator service with exponential decay
3. Build useInterval hook for polling
4. Create training monitor page with Recharts
5. Add API route for metrics fetching
6. Implement status transition logic (queued → running → complete/failed)
7. Integrate Sonner toasts for status changes
8. Add manual controls (start simulated training, stop, mark as failed for testing)
