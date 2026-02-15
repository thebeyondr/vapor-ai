# Architecture Patterns: ML Platform Dashboard

**Domain:** ML Model Training & Deployment Platform (Frontend SPA)
**Project:** Vapor
**Researched:** 2026-02-15
**Confidence:** MEDIUM (based on established ML platform patterns from training data - external research tools unavailable)

## Recommended Architecture

ML platform dashboards typically follow a **layered frontend architecture** with clear separation between data management, business logic, and presentation:

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │Training  │  │Monitor   │  │Deployed  │   │
│  │Overview  │  │Config    │  │View      │  │Models    │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼─────────────┼─────────────┼─────────────┼──────────┘
        │             │             │             │
┌───────┼─────────────┼─────────────┼─────────────┼──────────┐
│       │        State Management Layer           │          │
│       │   ┌──────────────────────────────┐     │          │
│       └───┤  Training Jobs Store         │─────┘          │
│           ├──────────────────────────────┤                │
│           │  Model Catalog Store         │                │
│           ├──────────────────────────────┤                │
│           │  Metrics/Telemetry Store     │                │
│           └──────────┬───────────────────┘                │
└──────────────────────┼────────────────────────────────────┘
                       │
┌──────────────────────┼────────────────────────────────────┐
│              Data Access Layer                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Mock Data   │  │ Hugging Face │  │ Local JSON   │     │
│  │ Generator   │  │ API Client   │  │ Loader       │     │
│  └─────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────────────────────────────────────────┘
```

### Component Boundaries

| Component | Responsibility | Communicates With | State |
|-----------|---------------|-------------------|-------|
| **Dashboard Overview** | Aggregate metrics display, navigation hub | Training Jobs Store, Model Catalog Store, Metrics Store | Read-only (consumes) |
| **Training Config** | Model selection, parameter configuration, job submission | HF API Client, LFM Catalog, Training Jobs Store | Read-write (creates jobs) |
| **Training Monitor** | Real-time training visualization, job status tracking | Training Jobs Store, Mock Data Generator | Read-only + subscription |
| **Deployed Models** | Inference metrics, model performance tracking | Model Catalog Store, Metrics Store | Read-only (consumes) |
| **Welcome Modal** | Onboarding, context setting | Local storage (dismissal state) | Self-contained |
| **Training Jobs Store** | Training job state, lifecycle management | Mock Data Generator, all views | Central state |
| **Model Catalog Store** | Available models, deployed models registry | HF API Client, LFM Catalog | Central state |
| **Metrics/Telemetry Store** | Time-series metrics, aggregated statistics | Mock Data Generator | Central state |
| **Mock Data Generator** | Simulated training metrics, realistic curves | Training Jobs Store, Metrics Store | Stateless service |
| **HF API Client** | Model search, metadata fetching | Hugging Face API, Model Catalog Store | Stateless service |
| **LFM Catalog** | Curated lightweight foundation models | Local JSON, Model Catalog Store | Static data |

### Data Flow

#### 1. Training Job Creation Flow
```
User Input (Training Config)
  → Model Selection (HF API Client OR LFM Catalog)
  → Parameter Configuration (UI State)
  → Job Submission (Training Jobs Store)
  → Mock Data Generator starts simulation
  → Training Monitor subscribes to updates
```

#### 2. Real-Time Training Monitoring Flow
```
Training Jobs Store (active job)
  → Mock Data Generator (produces metrics at intervals)
  → Metrics/Telemetry Store (accumulates time-series)
  → Training Monitor (React subscriptions/polling)
  → Recharts visualization updates
```

#### 3. Dashboard Aggregation Flow
```
Training Jobs Store (all jobs) ─┐
Model Catalog Store (deployed)  ├─→ Dashboard Overview (aggregates)
Metrics Store (latest stats)   ─┘
  → Display cards/widgets
  → Start New Training CTA
```

#### 4. Model Deployment Flow (Simulated)
```
Training Monitor (job complete)
  → User triggers "Deploy"
  → Training Jobs Store (marks deployed)
  → Model Catalog Store (adds to deployed registry)
  → Mock Data Generator (starts inference metrics)
  → Deployed Models view updates
```

## Patterns to Follow

### Pattern 1: Centralized State with Local UI State
**What:** Global stores (Zustand/Context) for domain data, local useState for UI-only concerns

**When:** Always separate data that affects multiple views from ephemeral UI state

**Example:**
```typescript
// Global store - shared across views
interface TrainingJobsStore {
  jobs: TrainingJob[];
  activeJob: string | null;
  createJob: (config: JobConfig) => void;
  updateJobMetrics: (jobId: string, metrics: Metrics) => void;
}

// Local UI state - specific to Training Config view
function TrainingConfigView() {
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [parameters, setParameters] = useState<Parameters>({});
  const createJob = useTrainingJobsStore(state => state.createJob);

  // UI state doesn't leak to global store
}
```

**Why:** Prevents state synchronization bugs, enables time-travel debugging, simplifies testing

---

### Pattern 2: Service Layer Abstraction
**What:** Separate data fetching/generation logic from state management

**When:** Any external data source (API, mock generator, local files)

**Example:**
```typescript
// services/mockDataGenerator.ts
export class TrainingMetricsSimulator {
  private intervals: Map<string, NodeJS.Timer> = new Map();

  startSimulation(jobId: string, callback: (metrics: Metrics) => void) {
    const interval = setInterval(() => {
      const metrics = this.generateRealisticMetrics();
      callback(metrics);
    }, 1000);

    this.intervals.set(jobId, interval);
  }

  stopSimulation(jobId: string) {
    clearInterval(this.intervals.get(jobId));
    this.intervals.delete(jobId);
  }

  private generateRealisticMetrics(): Metrics {
    // Exponential decay loss curve, noise, occasional spikes
  }
}

// In store
const simulator = new TrainingMetricsSimulator();
simulator.startSimulation(jobId, (metrics) => {
  useTrainingJobsStore.getState().updateJobMetrics(jobId, metrics);
});
```

**Why:** Testable without mocking framework internals, swappable implementations (mock → real API), reusable across components

---

### Pattern 3: Optimistic Updates with Rollback
**What:** Update UI immediately, reconcile with "backend" (mock) asynchronously

**When:** User actions that trigger state changes (create job, deploy model)

**Example:**
```typescript
// In Training Jobs Store
createJob: (config: JobConfig) => {
  const optimisticJob: TrainingJob = {
    id: generateId(),
    status: 'initializing',
    config,
    createdAt: Date.now(),
    metrics: []
  };

  // Immediate UI update
  set(state => ({ jobs: [...state.jobs, optimisticJob] }));

  // Simulate async backend processing
  setTimeout(() => {
    set(state => ({
      jobs: state.jobs.map(job =>
        job.id === optimisticJob.id
          ? { ...job, status: 'running' }
          : job
      )
    }));

    // Start mock data generation
    simulator.startSimulation(optimisticJob.id, ...);
  }, 500);
}
```

**Why:** Perceived performance, realistic transition states, matches real async behavior

---

### Pattern 4: Time-Series Data Windowing
**What:** Limit in-memory metrics to recent window, aggregate older data

**When:** Real-time charts with potentially unbounded data

**Example:**
```typescript
interface MetricsStore {
  // Last 100 points at full resolution
  recentMetrics: Metric[];
  // Older data aggregated to minute/hour buckets
  historicalMetrics: AggregatedMetric[];

  addMetric: (metric: Metric) => {
    set(state => {
      const recent = [...state.recentMetrics, metric].slice(-100);

      // If we're dropping points, aggregate them
      if (state.recentMetrics.length >= 100) {
        const dropped = state.recentMetrics[0];
        const historical = aggregateToWindow(dropped, state.historicalMetrics);
        return { recentMetrics: recent, historicalMetrics: historical };
      }

      return { recentMetrics: recent };
    });
  }
}
```

**Why:** Prevents memory leaks, maintains chart performance, realistic for production systems

---

### Pattern 5: Component Composition for Reusable Widgets
**What:** Dashboard cards as composable primitives

**When:** Multiple views need similar metric displays

**Example:**
```typescript
// Reusable primitives
<MetricCard
  title="Training Jobs"
  value={activeJobs}
  trend={+12}
  icon={<RocketIcon />}
/>

<ChartCard title="Loss Over Time">
  <LineChart data={lossMetrics} />
</ChartCard>

// Composed in Dashboard Overview
<DashboardGrid>
  <MetricCard title="Active Jobs" value={activeJobsCount} />
  <MetricCard title="Deployed Models" value={deployedCount} />
  <ChartCard title="Recent Training Runs">
    <TrainingHistoryChart jobs={recentJobs} />
  </ChartCard>
</DashboardGrid>

// Reused in Training Monitor (different layout)
<MonitorLayout>
  <ChartCard title="Loss Curve">
    <LossChart metrics={currentJob.metrics} />
  </ChartCard>
  <MetricCard title="Current Epoch" value={currentEpoch} />
</MonitorLayout>
```

**Why:** Design consistency, reduced duplication, easier theming/styling changes

---

### Pattern 6: Route-Based Code Splitting
**What:** Lazy load page components, keep shared state/services in main bundle

**When:** Next.js App Router with multiple distinct views

**Example:**
```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react';
import DashboardSkeleton from '@/components/skeletons/Dashboard';

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardOverview />
    </Suspense>
  );
}

// app/training/monitor/[jobId]/page.tsx
const TrainingMonitor = lazy(() => import('@/components/TrainingMonitor'));

export default function MonitorPage({ params }: { params: { jobId: string } }) {
  return (
    <Suspense fallback={<MonitorSkeleton />}>
      <TrainingMonitor jobId={params.jobId} />
    </Suspense>
  );
}
```

**Why:** Faster initial load, automatic by Next.js App Router, natural boundary for features

## Anti-Patterns to Avoid

### Anti-Pattern 1: Prop Drilling Through Many Layers
**What:** Passing store accessors or data through 3+ component levels

**Why bad:** Tight coupling, difficult refactoring, unclear data dependencies

**Instead:** Use context/store hooks at consumption point, not at root
```typescript
// BAD
<Dashboard stores={allStores}>
  <Overview stores={allStores}>
    <MetricCard store={allStores.metrics} />
  </Overview>
</Dashboard>

// GOOD
function MetricCard() {
  const metrics = useMetricsStore(state => state.latest);
  // Direct access where needed
}
```

---

### Anti-Pattern 2: Mixing Mock Logic with Business Logic
**What:** Hardcoding `if (process.env.NODE_ENV === 'development')` throughout components

**Why bad:** Impossible to remove mock code for production, unclear boundaries

**Instead:** Dependency injection via service layer
```typescript
// BAD
function TrainingMonitor() {
  const metrics = useMemo(() => {
    if (process.env.MOCK_DATA) {
      return generateMockMetrics();
    } else {
      return fetchRealMetrics();
    }
  }, []);
}

// GOOD
// services/metricsProvider.ts
export const metricsProvider =
  process.env.NEXT_PUBLIC_USE_MOCK === 'true'
    ? new MockMetricsService()
    : new RealMetricsService();

// Component doesn't know or care
function TrainingMonitor() {
  const metrics = useMetrics(); // Uses injected provider
}
```

---

### Anti-Pattern 3: Polling Without Cleanup
**What:** setInterval in useEffect without clearing on unmount

**Why bad:** Memory leaks, background tab performance issues, stale updates

**Instead:** Proper cleanup and visibility awareness
```typescript
// BAD
useEffect(() => {
  setInterval(() => fetchMetrics(), 1000);
}, []);

// GOOD
useEffect(() => {
  const interval = setInterval(() => {
    if (document.visibilityState === 'visible') {
      fetchMetrics();
    }
  }, 1000);

  return () => clearInterval(interval);
}, [fetchMetrics]);
```

---

### Anti-Pattern 4: Storing Derived Data in State
**What:** Caching calculations that could be computed from existing state

**Why bad:** State synchronization bugs, unnecessary re-renders

**Instead:** Compute on render or use selectors
```typescript
// BAD
const [jobs, setJobs] = useState([]);
const [activeJobsCount, setActiveJobsCount] = useState(0);

// Now you need to keep these in sync!

// GOOD
const jobs = useTrainingJobsStore(state => state.jobs);
const activeJobsCount = jobs.filter(j => j.status === 'running').length;

// Or with selector (memoized)
const activeJobsCount = useTrainingJobsStore(
  state => state.jobs.filter(j => j.status === 'running').length
);
```

---

### Anti-Pattern 5: Overly Generic Components
**What:** Single `<Chart>` component that handles all visualization types via props

**Why bad:** Props explosion, conditional rendering complexity, poor type safety

**Instead:** Specific components with shared primitives
```typescript
// BAD
<Chart
  type="line"
  data={lossData}
  xAxis="epoch"
  yAxis="loss"
  showGrid={true}
  showTooltip={true}
  colors={['blue']}
  // 30+ more props...
/>

// GOOD
<LossChart data={lossData} />
<LatencyChart data={latencyData} />
<ThroughputChart data={throughputData} />

// Shared primitives internally
function LossChart({ data }) {
  return (
    <RechartsLineChart data={data}>
      <XAxis dataKey="epoch" />
      <YAxis dataKey="loss" scale="log" />
      <Line stroke="var(--loss-color)" />
    </RechartsLineChart>
  );
}
```

## Scalability Considerations

| Concern | At MVP (5 screens) | At Enhanced (10+ screens) | At Production Scale |
|---------|-------------------|---------------------------|---------------------|
| **State Management** | React Context sufficient | Zustand for global stores | Consider Redux Toolkit for devtools, persistence |
| **Data Fetching** | Direct API calls in components | React Query/SWR for caching | + Optimistic updates, retry logic, request deduplication |
| **Real-Time Updates** | setInterval polling (1s) | Server-Sent Events (SSE) or WebSocket | WebSocket with reconnection, backpressure handling |
| **Chart Performance** | Recharts with raw data | Data downsampling, canvas rendering | WebGL (e.g., Plotly.js), Web Workers for computation |
| **Bundle Size** | Single bundle (~500KB) | Route-based splitting | Dynamic imports, tree shaking, CDN for charts |
| **Type Safety** | Basic TypeScript | Zod schemas for API boundaries | Generated types from OpenAPI, runtime validation |

## Build Order Recommendations

### Phase 1: Foundation (Dependency: None)
**Why first:** Establishes contracts, enables parallel development

1. **Type Definitions** - Define all interfaces (Job, Model, Metrics, etc.)
2. **Mock Data Services** - TrainingMetricsSimulator, LFM catalog loader
3. **Store Scaffolding** - Empty stores with typed interfaces
4. **Layout Shell** - Navigation, route structure, welcome modal

**Deliverable:** Can navigate between empty screens, see welcome modal

---

### Phase 2: Static Views (Dependency: Phase 1)
**Why second:** No complex state management, validates component patterns

1. **Dashboard Overview (empty state)** - Layout, placeholder cards
2. **Training Config (form only)** - Model search UI, parameter inputs (no submission)
3. **Reusable Components** - MetricCard, ChartCard, StatusBadge primitives

**Deliverable:** All screens render, forms collect input (but don't submit)

---

### Phase 3: State Integration (Dependency: Phase 2)
**Why third:** Connects UI to data layer

1. **Training Jobs Store Implementation** - createJob, updateJobMetrics, job lifecycle
2. **Model Catalog Store** - HF API integration, LFM catalog loading
3. **Metrics Store** - Time-series accumulation, windowing logic
4. **Training Config Submission** - Wire form to createJob, navigate to monitor

**Deliverable:** Can create a job, navigate to monitor (no visualization yet)

---

### Phase 4: Real-Time Visualization (Dependency: Phase 3)
**Why fourth:** Most complex, requires working state layer

1. **Training Monitor Charts** - Loss curve, epoch progress, ETA calculation
2. **Mock Data Generation** - Realistic metric simulation, start/stop lifecycle
3. **Polling/Subscription** - Connect monitor to live updates
4. **Status State Machine** - initializing → running → completed/failed

**Deliverable:** End-to-end training flow with live charts

---

### Phase 5: Deployment Simulation (Dependency: Phase 4)
**Why fifth:** Extends training flow, adds second domain (inference)

1. **Deploy Action** - Mark job as deployed, add to catalog
2. **Inference Metrics Generation** - Request volume, latency, error rate mocks
3. **Deployed Models View** - Table/cards of deployed models with live stats
4. **Dashboard Aggregations** - Pull from both training + deployment stores

**Deliverable:** Complete lifecycle: configure → train → deploy → monitor

---

### Phase 6: Polish & Edge Cases (Dependency: Phase 5)
**Why last:** Requires full feature set to test error scenarios

1. **Error States** - Failed training jobs, API errors, empty states
2. **Loading Skeletons** - Suspense boundaries, skeleton components
3. **Responsive Design** - Mobile/tablet layouts for all views
4. **Performance Optimization** - Memoization, virtualization if needed

**Deliverable:** Production-quality portfolio piece

## Critical Dependencies

```
Type Definitions ──→ All other phases (everything depends on types)

Mock Data Services ──→ State Integration (stores need data sources)

State Integration ──→ Real-Time Visualization (charts need data)
                   └──→ Deployment Simulation (uses same patterns)

Real-Time Viz ──→ Dashboard Aggregations (shows training metrics)
Deployment Sim ──→ Dashboard Aggregations (shows inference metrics)

Layout Shell ──→ Static Views (need routes to exist)
Static Views ──→ State Integration (wire up forms)
```

**Key insight:** Type definitions and mock services are force multipliers - invest here first to enable parallel work on UI and state.

## Technology-Specific Recommendations

### Next.js App Router Patterns

**1. Server Components for Static Content**
```typescript
// app/dashboard/page.tsx - Server Component (default)
export default function DashboardPage() {
  // This runs on server, can fetch at build time
  const lfmModels = loadLFMCatalog(); // Synchronous file read

  return <DashboardOverview lfmModels={lfmModels} />;
}
```

**2. Client Components for Interactive State**
```typescript
// components/TrainingMonitor.tsx
'use client';

export function TrainingMonitor() {
  const metrics = useMetricsStore(); // Client-side state
  // Interactive charts, real-time updates
}
```

**3. Route Handlers for Mock API**
```typescript
// app/api/models/search/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  // Proxy to Hugging Face or return cached results
  const results = await searchHuggingFace(query);
  return Response.json(results);
}
```

**Why:** Leverage server rendering for initial load, client rendering for interactivity, route handlers for API abstraction

### Zustand Store Pattern (Recommended)

```typescript
// stores/trainingJobs.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface TrainingJobsStore {
  jobs: TrainingJob[];
  activeJobId: string | null;
  createJob: (config: JobConfig) => void;
  updateJobMetrics: (jobId: string, metrics: Metrics) => void;
}

export const useTrainingJobsStore = create<TrainingJobsStore>()(
  devtools(
    persist(
      (set) => ({
        jobs: [],
        activeJobId: null,

        createJob: (config) => set((state) => ({
          jobs: [...state.jobs, createJobFromConfig(config)],
          activeJobId: createJobFromConfig(config).id
        })),

        updateJobMetrics: (jobId, metrics) => set((state) => ({
          jobs: state.jobs.map(job =>
            job.id === jobId
              ? { ...job, metrics: [...job.metrics, metrics] }
              : job
          )
        }))
      }),
      { name: 'training-jobs-storage' }
    )
  )
);
```

**Why Zustand over Context:**
- No provider wrapper hell
- Built-in devtools integration
- Optional persistence (survive refresh during demo)
- Better performance (selective subscriptions)
- Simpler API for this use case

**Why not Redux:**
- Overkill for mock data
- More boilerplate
- Training Jobs Store is simple CRUD, not complex workflows

## Confidence Assessment

**Overall Confidence: MEDIUM**

**Rationale:**
- Patterns based on established ML platforms (W&B, MLflow, TensorBoard) from training data
- Next.js + TypeScript + Zustand patterns are well-documented and stable
- No external research tools available to verify current 2026 best practices
- Mock data architecture is simpler than production (less real-world validation needed)
- Component patterns derived from common React/Next.js conventions

**What would increase confidence to HIGH:**
- Access to current ML dashboard open-source repositories
- Official Next.js 14+ App Router architecture guides
- Recent blog posts on production ML platform frontend architecture
- Verification with Context7 for specific library patterns

**Known gaps:**
- Real-time update patterns may have evolved (SSE vs WebSocket vs React Server Components streaming)
- Charting library landscape may have shifted (Recharts still recommended?)
- State management preferences may have changed in Next.js ecosystem
- Mock data generation patterns specific to ML metrics (need domain validation)

## Sources

**Note:** External research tools were unavailable. This architecture is based on:

1. **Training data knowledge** of ML platform patterns (W&B, MLflow, Kubeflow, TensorBoard) - MEDIUM confidence
2. **Established React/Next.js patterns** from training data - MEDIUM confidence
3. **Project requirements** provided in context - HIGH confidence for alignment with stated goals

**Recommendation:** Validate this architecture against:
- Current Next.js App Router documentation (2026 version)
- Recent ML platform dashboard repositories (GitHub search for "ml dashboard" or "mlops ui")
- Recharts vs alternatives (Victory, Visx, Plotly.js) for 2026 ecosystem

This architecture should be considered a strong starting hypothesis requiring validation with current sources.
