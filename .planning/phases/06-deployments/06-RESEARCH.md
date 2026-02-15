# Phase 6: Deployments - Research

**Researched:** 2026-02-15
**Domain:** Model deployment dashboard, inference metrics visualization, data tables with filtering/sorting
**Confidence:** HIGH

## Summary

Phase 6 implements a deployments dashboard where users can "deploy" completed training jobs and view deployed models with simulated inference statistics. This is the final major feature phase that completes the ML lifecycle story: discover → configure → train → deploy → monitor.

The research confirms that modern deployment monitoring dashboards track key inference metrics including request volume, latency percentiles (P50/P95/P99), error rates, and deployment status. TanStack Table (v8) with ShadCN UI provides the industry-standard solution for sortable, filterable data tables in React. The key architectural decision is separating deployment records (persistent metadata) from inference metrics (time-series data that can be simulated on-demand), using semantic versioning for model versions, and implementing a "deploy" action that creates deployment records from completed training jobs.

Realistic inference metrics follow patterns from production ML systems: P50 latency (median user experience) typically 50-200ms for small models, P95 latency (95th percentile SLA target) 2-5x P50, request rates vary by deployment scale (1-1000 req/sec), and error rates under 1% for healthy deployments. Deployment status progression follows: deploying → active → paused/failed, with active deployments being the primary focus.

**Primary recommendation:** Build a deployments page with TanStack Table for sortable/filterable table, implement a "deploy" Server Action on completed training jobs, create deployments schema table with semantic versioning, and simulate inference metrics using realistic distributions (latency follows log-normal, request volume follows daily patterns, error rates use random spikes).

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/react-table | ^8.20+ | Headless table with sorting/filtering | Industry standard for data tables, headless design pairs perfectly with ShadCN, extensive feature set |
| drizzle-orm | ^0.45.1 (installed) | Database ORM | Already in use, will persist deployment records and optionally cache metrics |
| date-fns | ^4.x (installed) | Date formatting | Already installed from Phase 5, will format deployment timestamps |
| lucide-react | (installed) | Icons | Already in use, deployment status icons (Rocket, CheckCircle, Pause, AlertTriangle) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| ShadCN Table | (CLI install) | Table UI primitives | Base table components that TanStack Table renders into |
| ShadCN Badge | (installed) | Status indicators | Deployment status badges (active/deploying/paused/failed) |
| ShadCN Card | (installed) | Container components | Deployment detail cards and metrics cards |
| ShadCN Select | (installed) | Filter dropdowns | Status filter, model filter for table |
| ShadCN Input | (installed) | Search input | Model name search/filter |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| TanStack Table | AG Grid, React Table v7 | TanStack Table v8 is free, lightweight, headless (AG Grid enterprise features cost $$, v7 is deprecated) |
| Client-side table | Server-side pagination | Client-side simpler for demo scale (< 100 deployments), server-side needed for 1000s+ |
| Separate metrics table | JSON column in deployments | Separate table better for time-series, allows future expansion to real metrics history |
| Real-time metrics | Static/cached metrics | Static sufficient for demo, real-time adds WebSocket complexity without portfolio value |

**Installation:**
```bash
# Install TanStack Table
pnpm add @tanstack/react-table

# Add ShadCN components (table is a multi-file component)
npx shadcn add table
```

## Architecture Patterns

### Recommended Project Structure
```
app/(dashboard)/deployments/
├── page.tsx                        # Deployments list with TanStack Table (Phase 6 - NEW)
├── [id]/
│   ├── page.tsx                    # Individual deployment detail view (Phase 6 - NEW)
│   └── components/
│       ├── inference-stats.tsx     # Metrics cards (req volume, latency, errors) (Phase 6 - NEW)
│       └── deployment-controls.tsx # Pause/resume/delete actions (Phase 6 - NEW)
├── components/
│   ├── deployments-table.tsx       # TanStack Table implementation (Phase 6 - NEW)
│   └── deployment-columns.tsx      # Table column definitions (Phase 6 - NEW)
└── actions.ts                      # Server Actions (deploy, pause, resume, delete) (Phase 6 - NEW)

lib/
├── services/
│   └── inference-simulator.ts      # Metrics generation service (Phase 6 - NEW)
├── db/
│   └── schema.ts                   # Add deployments table (Phase 6 - MODIFY)
└── validations/
    └── deployment.ts               # Deployment validation schemas (Phase 6 - NEW)
```

### Pattern 1: Deployments Table Schema with Versioning
**What:** Store deployment records with semantic versioning, linking to completed training jobs
**When to use:** Always for deployment tracking - enables rollback, A/B testing, audit trail
**Example:**
```typescript
// lib/db/schema.ts
export const deployments = pgTable("deployments", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => trainingJobs.id, { onDelete: 'restrict' }),
  modelName: varchar("model_name", { length: 255 }).notNull(), // Denormalized from job
  version: varchar("version", { length: 50 }).notNull(), // Semantic version: v1.0.0, v1.1.0
  status: text("status", { enum: ["deploying", "active", "paused", "failed"] }).notNull().default("deploying"),
  endpoint: varchar("endpoint", { length: 500 }), // Simulated API endpoint
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
  deployedBy: varchar("deployed_by", { length: 100 }).default("system"), // Future: user attribution
});

// Index for efficient lookups
export const deploymentsJobIdIdx = index("deployments_job_id_idx")
  .on(deployments.jobId);

export const deploymentsStatusIdx = index("deployments_status_idx")
  .on(deployments.status);
```
**Source:** [Machine Learning Model Versioning: Top Tools & Best Practices](https://lakefs.io/blog/model-versioning/)

### Pattern 2: Simulated Inference Metrics (On-Demand Generation)
**What:** Generate realistic inference metrics using statistical distributions instead of storing time-series
**When to use:** Demo applications where real metrics don't exist, saves database complexity
**Example:**
```typescript
// lib/services/inference-simulator.ts
interface InferenceMetrics {
  requestVolume: number;    // Requests per second
  p50Latency: number;       // Median latency (ms)
  p95Latency: number;       // 95th percentile latency (ms)
  p99Latency: number;       // 99th percentile latency (ms)
  errorRate: number;        // Percentage (0-100)
  successRate: number;      // Percentage (0-100)
}

export class InferenceSimulator {
  /**
   * Generate realistic inference metrics based on deployment age and model size
   * Uses log-normal distribution for latency (realistic for network/compute)
   * Source: Production ML monitoring best practices
   */
  generateMetrics(deployment: {
    id: number;
    modelName: string;
    createdAt: Date;
    status: string;
  }): InferenceMetrics {
    // Base metrics vary by model size (inferred from name)
    const isNano = deployment.modelName.toLowerCase().includes('nano');
    const baseP50 = isNano ? 50 : 120;  // Nano models faster

    // P95 is typically 2-4x P50 in healthy systems
    const p50Latency = baseP50 + this.randomGaussian(0, 10);
    const p95Latency = p50Latency * (2.5 + this.randomGaussian(0, 0.3));
    const p99Latency = p95Latency * (1.5 + this.randomGaussian(0, 0.2));

    // Request volume based on deployment age (ramps up over time)
    const ageHours = (Date.now() - deployment.createdAt.getTime()) / (1000 * 60 * 60);
    const maturityFactor = Math.min(1, ageHours / 24); // Full traffic after 24h
    const baseVolume = isNano ? 100 : 50; // Nano gets more traffic (cheaper)
    const requestVolume = baseVolume * maturityFactor + this.randomGaussian(0, baseVolume * 0.1);

    // Error rate: healthy < 1%, occasional spikes
    const baseErrorRate = 0.3; // 0.3% baseline
    const spike = Math.random() < 0.05 ? this.randomGaussian(2, 0.5) : 0; // 5% chance of spike
    const errorRate = Math.max(0, Math.min(5, baseErrorRate + spike));

    // Paused/failed deployments have zero traffic
    if (deployment.status !== 'active') {
      return {
        requestVolume: 0,
        p50Latency: 0,
        p95Latency: 0,
        p99Latency: 0,
        errorRate: 0,
        successRate: 0,
      };
    }

    return {
      requestVolume: Math.max(0, requestVolume),
      p50Latency: Math.max(10, p50Latency),
      p95Latency: Math.max(20, p95Latency),
      p99Latency: Math.max(30, p99Latency),
      errorRate: Math.round(errorRate * 100) / 100,
      successRate: Math.round((100 - errorRate) * 100) / 100,
    };
  }

  private randomGaussian(mean: number, stdDev: number): number {
    // Box-Muller transform for Gaussian distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z0 * stdDev;
  }
}
```
**Sources:**
- [Measuring Inference Latency and Throughput](https://apxml.com/courses/quantized-llm-deployment/chapter-3-performance-evaluation-quantized-llms/measuring-inference-latency-throughput)
- [P50 vs P95 vs P99 Latency Explained](https://oneuptime.com/blog/post/2025-09-15-p50-vs-p95-vs-p99-latency-percentiles/view)

### Pattern 3: TanStack Table with Client-Side Sorting/Filtering
**What:** Use TanStack Table v8 with React Table hooks for sortable, filterable columns
**When to use:** Data tables requiring user interaction (sorting, filtering, search)
**Example:**
```typescript
// app/(dashboard)/deployments/components/deployments-table.tsx
"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface DeploymentsTableProps {
  data: Array<{
    id: number;
    modelName: string;
    version: string;
    status: string;
    createdAt: Date;
    requestVolume: number;
    p95Latency: number;
    errorRate: number;
  }>;
  columns: ColumnDef<any>[];
}

export function DeploymentsTable({ data, columns }: DeploymentsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="space-y-4">
      {/* Search filter */}
      <Input
        placeholder="Filter by model name..."
        value={(table.getColumn("modelName")?.getFilterValue() as string) ?? ""}
        onChange={(e) => table.getColumn("modelName")?.setFilterValue(e.target.value)}
        className="max-w-sm"
      />

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {/* Render header with sorting */}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {/* Render cell */}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```
**Sources:**
- [TanStack Table v8 Documentation](https://tanstack.com/table/v8)
- [ShadCN Data Table Component](https://v3.shadcn.com/docs/components/data-table)

### Pattern 4: Server Action for Deploying Training Jobs
**What:** Server Action that creates deployment record from completed training job
**When to use:** Converting training artifacts to production deployments
**Example:**
```typescript
// app/(dashboard)/deployments/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { trainingJobs, deployments } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";

type DeployResponse =
  | { success: true; deploymentId: number }
  | { success: false; error: string };

export async function deployTrainingJob(jobId: number): Promise<DeployResponse> {
  try {
    // 1. Validate job exists and is complete
    const [job] = await db
      .select()
      .from(trainingJobs)
      .where(eq(trainingJobs.id, jobId));

    if (!job) {
      return { success: false, error: "Training job not found" };
    }

    if (job.status !== "complete") {
      return { success: false, error: "Only completed training jobs can be deployed" };
    }

    // 2. Generate next version number for this model
    const [versionCount] = await db
      .select({ count: count() })
      .from(deployments)
      .where(eq(deployments.modelName, job.modelName));

    const nextVersion = `v1.${versionCount?.count ?? 0}.0`; // Semantic versioning

    // 3. Create deployment record
    const [newDeployment] = await db
      .insert(deployments)
      .values({
        jobId: job.id,
        modelName: job.modelName,
        version: nextVersion,
        status: "active", // Skip "deploying" state for demo (instant deployment)
        endpoint: `/api/inference/${job.modelName.toLowerCase().replace(/\s+/g, '-')}/${nextVersion}`,
      })
      .returning({ id: deployments.id });

    // 4. Revalidate relevant paths
    revalidatePath("/deployments");
    revalidatePath("/training/jobs");
    revalidatePath("/");

    return { success: true, deploymentId: newDeployment.id };

  } catch (error) {
    console.error("Failed to deploy training job:", error);
    return { success: false, error: "Failed to create deployment" };
  }
}
```
**Source:** [Model Versioning Infrastructure: Managing ML Artifacts at Scale](https://introl.com/blog/model-versioning-infrastructure-mlops-artifact-management-guide-2025)

### Pattern 5: Deployment Status with Color-Coded Badges
**What:** Extend existing StatusBadge pattern with deployment-specific statuses
**When to use:** Displaying deployment health in tables and detail views
**Example:**
```typescript
// app/(dashboard)/components/deployment-status-badge.tsx
import { Badge } from "@/components/ui/badge";
import { Rocket, CheckCircle, Pause, XCircle } from "lucide-react";

type DeploymentStatus = "deploying" | "active" | "paused" | "failed";

const statusConfig = {
  deploying: {
    label: "Deploying",
    variant: "outline" as const,
    className: "border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    icon: Rocket,
  },
  active: {
    label: "Active",
    variant: "outline" as const,
    className: "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400",
    icon: CheckCircle,
  },
  paused: {
    label: "Paused",
    variant: "outline" as const,
    className: "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    icon: Pause,
  },
  failed: {
    label: "Failed",
    variant: "outline" as const,
    className: "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400",
    icon: XCircle,
  },
};

export function DeploymentStatusBadge({ status }: { status: DeploymentStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
}
```
**Source:** [Status indicators - Carbon Design System](https://carbondesignsystem.com/patterns/status-indicator-pattern/)

### Anti-Patterns to Avoid

- **Storing all metrics history:** For a demo, simulated on-demand metrics are sufficient. Don't create complex time-series tables unless showing historical charts.
- **Real deployment infrastructure:** Don't attempt actual model serving, API endpoints, or container orchestration. Simulate with status fields and mock endpoints.
- **Over-complicated versioning:** Semantic versioning (major.minor.patch) is standard, but for a demo, simple auto-increment (v1.0.0, v1.1.0, v1.2.0) is clearer than git SHAs or timestamps.
- **Server-side pagination for small datasets:** TanStack Table client-side filtering/sorting is perfect for < 100 deployments. Don't add server pagination complexity.
- **Not linking to training jobs:** Deployments should always reference their source training job for traceability.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Table sorting/filtering | Custom sort/filter logic | TanStack Table hooks | Handles complex sorting (multi-column, custom comparators), filtering (global search, column filters), and state management |
| Data table UI | Custom table markup | ShadCN Table + TanStack Table | Accessibility (keyboard nav, ARIA labels), responsive design, dark mode support all handled |
| Latency percentiles calculation | Manual percentile math | Pre-calculated percentiles or statistical libraries | Percentile calculation requires sorting and quantile algorithms - error-prone to implement |
| Semantic version parsing | Regex version parsing | semver library (if needed) | Handles edge cases (pre-release tags, build metadata, range comparisons) |
| Relative timestamps | Manual date math | date-fns formatDistanceToNow | Handles edge cases (pluralization, localization, time zones) |

**Key insight:** TanStack Table is headless - it manages table state (sorting, filtering, pagination) but doesn't render markup. This pairs perfectly with ShadCN's Table components (which provide styled markup but no logic). Don't try to combine them in the wrong direction (e.g., using ShadCN Table alone without TanStack for complex features).

## Common Pitfalls

### Pitfall 1: Forgetting to Link Deployments to Training Jobs
**What goes wrong:** Deployments are orphaned, user can't trace back to training configuration/metrics.
**Why it happens:** Focusing on deployment table independently of training flow.
**How to avoid:** Always include `jobId` foreign key in deployments table, show training job link in deployment detail view, validate job exists and is complete before deploying.
**Warning signs:** User asks "which training run created this deployment?" and there's no way to tell.

### Pitfall 2: TanStack Table Column Definition Type Mismatches
**What goes wrong:** TypeScript errors like "Property 'X' does not exist on type" in column accessors.
**Why it happens:** Column definitions typed with generic `any` instead of specific row type.
**How to avoid:** Define row type interface and use in `ColumnDef<RowType>[]`:
```typescript
interface DeploymentRow {
  id: number;
  modelName: string;
  version: string;
  status: string;
  // ... all fields used in columns
}

const columns: ColumnDef<DeploymentRow>[] = [
  {
    accessorKey: "modelName",
    header: "Model",
  },
  // ...
];
```
**Warning signs:** TypeScript errors in column definitions, autocomplete not working.

**Source:** [TanStack Table - Column Defs Guide](https://tanstack.com/table/v8/docs/guide/column-defs)

### Pitfall 3: Not Handling Empty Deployment State
**What goes wrong:** Blank page or error when no deployments exist yet.
**Why it happens:** Rendering table without checking for empty data.
**How to avoid:** Add empty state UI before table:
```typescript
{deployments.length === 0 ? (
  <div className="text-center py-12">
    <p className="text-muted-foreground">No deployments yet</p>
    <Button asChild className="mt-4">
      <Link href="/training/jobs">Deploy a Training Job</Link>
    </Button>
  </div>
) : (
  <DeploymentsTable data={deployments} columns={columns} />
)}
```
**Warning signs:** User confusion on first visit, poor onboarding experience.

### Pitfall 4: Unrealistic Inference Metrics
**What goes wrong:** Metrics don't look believable (e.g., P95 < P50, error rate > 50%, latency in seconds).
**Why it happens:** Random number generation without understanding real-world distributions.
**How to avoid:** Use realistic ranges based on research:
- P50 latency: 50-200ms for small models
- P95 latency: 2-4x P50 (not random)
- P99 latency: 1.5-2x P95
- Error rate: < 1% for healthy, spikes to 2-5% occasionally
- Request volume: scales with deployment age and model size
**Warning signs:** Reviewer with ML experience spots fake-looking numbers.

**Source:** [Key metrics for LLM inference](https://bentoml.com/llm/inference-optimization/llm-inference-metrics)

### Pitfall 5: Deploying Non-Complete Training Jobs
**What goes wrong:** Failed or running jobs get deployed, breaking the logical flow.
**Why it happens:** Missing validation in deploy action.
**How to avoid:** Explicitly check `job.status === "complete"` before allowing deployment:
```typescript
if (job.status !== "complete") {
  return { success: false, error: "Only completed training jobs can be deployed" };
}
```
**Warning signs:** Users can deploy jobs that are still running or failed.

### Pitfall 6: Table Sorting Breaks with null Values
**What goes wrong:** Sorting by metrics column causes errors when some deployments have null/zero metrics.
**Why it happens:** TanStack Table default sort doesn't handle nulls gracefully.
**How to avoid:** Use custom sort function for numeric columns:
```typescript
{
  accessorKey: "requestVolume",
  header: "Req/sec",
  sortingFn: (rowA, rowB, columnId) => {
    const a = rowA.getValue(columnId) as number ?? 0;
    const b = rowB.getValue(columnId) as number ?? 0;
    return a - b;
  },
}
```
**Warning signs:** Console errors when sorting, inconsistent sort order.

## Code Examples

### Complete Deployments Table Column Definitions
```typescript
// app/(dashboard)/deployments/components/deployment-columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeploymentStatusBadge } from "@/app/(dashboard)/components/deployment-status-badge";
import Link from "next/link";

interface DeploymentRow {
  id: number;
  modelName: string;
  version: string;
  status: "deploying" | "active" | "paused" | "failed";
  createdAt: Date;
  requestVolume: number;
  p95Latency: number;
  errorRate: number;
}

export const deploymentColumns: ColumnDef<DeploymentRow>[] = [
  {
    accessorKey: "modelName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Model Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <Link
          href={`/deployments/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.original.modelName}
        </Link>
      );
    },
  },
  {
    accessorKey: "version",
    header: "Version",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.version}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <DeploymentStatusBadge status={row.original.status} />,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "requestVolume",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Req/sec
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const volume = row.original.requestVolume;
      return <span>{volume > 0 ? volume.toFixed(1) : "—"}</span>;
    },
    sortingFn: (rowA, rowB, columnId) => {
      const a = (rowA.getValue(columnId) as number) ?? 0;
      const b = (rowB.getValue(columnId) as number) ?? 0;
      return a - b;
    },
  },
  {
    accessorKey: "p95Latency",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          P95 Latency
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const latency = row.original.p95Latency;
      return <span>{latency > 0 ? `${latency.toFixed(0)}ms` : "—"}</span>;
    },
  },
  {
    accessorKey: "errorRate",
    header: "Error Rate",
    cell: ({ row }) => {
      const rate = row.original.errorRate;
      const isHigh = rate > 1;
      return (
        <span className={isHigh ? "text-red-600 dark:text-red-400" : ""}>
          {rate > 0 ? `${rate.toFixed(2)}%` : "—"}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Deployed
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(row.original.createdAt, { addSuffix: true })}
        </span>
      );
    },
    sortingFn: (rowA, rowB) => {
      return rowA.original.createdAt.getTime() - rowB.original.createdAt.getTime();
    },
  },
];
```

### Inference Metrics Display Cards
```typescript
// app/(dashboard)/deployments/[id]/components/inference-stats.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Zap, AlertCircle, TrendingUp } from "lucide-react";

interface InferenceStatsProps {
  metrics: {
    requestVolume: number;
    p50Latency: number;
    p95Latency: number;
    p99Latency: number;
    errorRate: number;
    successRate: number;
  };
}

export function InferenceStats({ metrics }: InferenceStatsProps) {
  const stats = [
    {
      title: "Request Volume",
      value: metrics.requestVolume > 0 ? `${metrics.requestVolume.toFixed(1)} req/sec` : "No traffic",
      icon: Activity,
      description: "Current request rate",
    },
    {
      title: "P50 Latency",
      value: `${metrics.p50Latency.toFixed(0)}ms`,
      icon: Zap,
      description: "Median response time",
      className: metrics.p50Latency > 200 ? "text-amber-600 dark:text-amber-400" : "",
    },
    {
      title: "P95 Latency",
      value: `${metrics.p95Latency.toFixed(0)}ms`,
      icon: TrendingUp,
      description: "95th percentile (SLA target)",
      className: metrics.p95Latency > 500 ? "text-red-600 dark:text-red-400" : "",
    },
    {
      title: "Error Rate",
      value: `${metrics.errorRate.toFixed(2)}%`,
      icon: AlertCircle,
      description: `${metrics.successRate.toFixed(2)}% success rate`,
      className: metrics.errorRate > 1 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.className || ""}`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| React Table v7 | TanStack Table v8 | 2022 | Headless, framework-agnostic, TypeScript-first, 30% smaller bundle |
| AG Grid free tier | TanStack Table + ShadCN | 2023+ | Zero cost, full customization, no vendor lock-in |
| Manual semantic versioning | Model registry systems | 2024-2025 | Automated version tracking, lineage, rollback capabilities |
| Prometheus + Grafana | Integrated observability (Braintrust, Datadog) | 2025-2026 | LLM-specific metrics (token usage, cost), auto-instrumentation |
| Custom metrics aggregation | Pre-aggregated percentiles | Always | Store P50/P95/P99 in database instead of recalculating from raw latencies |

**Deprecated/outdated:**
- **React Table v7:** Deprecated in favor of TanStack Table v8 (October 2022)
- **AG Grid for simple tables:** Overkill when TanStack Table + ShadCN is free and lighter
- **Git SHA as model version:** Hard to interpret, prefer semantic versioning for clarity
- **Storing all raw latency values:** Percentiles are sufficient, raw values inflate database

## Realistic Deployment Metrics Ranges

Based on current ML production best practices (2026):

| Metric | Healthy Range | Warning Threshold | Critical Threshold |
|--------|---------------|-------------------|-------------------|
| P50 Latency (small models) | 50-120ms | > 200ms | > 500ms |
| P95 Latency | 2-4x P50 | > 5x P50 | > 10x P50 |
| P99 Latency | 1.5-2x P95 | > 3x P95 | > 5x P95 |
| Error Rate | < 0.5% | 0.5-2% | > 2% |
| Request Volume (varies) | Stable ±20% | Drops > 50% | Zero traffic |

**Source:** [Monitoring ML systems in production](https://www.evidentlyai.com/blog/ml-monitoring-metrics)

**Model size impact:**
- Nano models (< 1B params): P50 ~50ms, high request volume (cheap to run)
- Small models (1-3B params): P50 ~120ms, moderate volume
- Large models (7B+ params): P50 ~300ms+, low volume (expensive, use for quality)

## Open Questions

1. **Should deployments support A/B testing or canary deployments?**
   - What we know: Real production systems use gradual rollouts (canary: 5% traffic → 50% → 100%)
   - What's unclear: Whether this adds portfolio value or just complexity for a demo
   - Recommendation: Skip for Phase 6. Single-version deployments are clearer. Could add "traffic split" in Phase 7 polish if time permits.

2. **Do we need deployment health checks or uptime monitoring?**
   - What we know: Production systems ping endpoints to verify deployment is responsive
   - What's unclear: Whether simulated health checks add value without real infrastructure
   - Recommendation: Simple "active/paused/failed" status is sufficient. Don't simulate health checks.

3. **Should inference metrics be stored historically or generated on-demand?**
   - What we know: Real systems store time-series metrics for charts, alerts, analysis
   - What's unclear: Whether demo needs historical trends or just current snapshot
   - Recommendation: On-demand generation for Phase 6 (simpler). If time permits in Phase 7, add a simple "last 7 days" chart using mock time-series data.

4. **What happens to deployments when training job is deleted?**
   - What we know: Foreign key with `onDelete: 'restrict'` prevents deleting job if deployment exists
   - What's unclear: Whether to allow cascade delete or require manual deployment cleanup
   - Recommendation: Use `restrict` (prevents accidents), show error message directing user to pause/delete deployment first.

## Sources

### Primary (HIGH confidence)
- [TanStack Table v8 Documentation](https://tanstack.com/table/v8) - Official TanStack Table docs
- [ShadCN Data Table Component](https://v3.shadcn.com/docs/components/data-table) - Official ShadCN table integration guide
- [Machine Learning Model Versioning: Top Tools & Best Practices](https://lakefs.io/blog/model-versioning/) - Model versioning patterns
- [P50 vs P95 vs P99 Latency Explained](https://oneuptime.com/blog/post/2025-09-15-p50-vs-p95-vs-p99-latency-percentiles/view) - Percentile definitions
- [Key metrics for LLM inference](https://bentoml.com/llm/inference-optimization/llm-inference-metrics) - LLM-specific metrics
- [date-fns formatDistanceToNow](https://date-fns.org/docs/formatDistanceToNow) - Official date-fns docs

### Secondary (MEDIUM confidence)
- [How to Create Latency Monitoring](https://oneuptime.com/blog/post/2026-01-30-llmops-latency-monitoring/view) - LLM latency monitoring patterns (Jan 2026)
- [7 Best LLM Observability Tools](https://www.truefoundry.com/blog/llm-observability-tools) - Industry tools survey
- [Measuring Inference Latency and Throughput](https://apxml.com/courses/quantized-llm-deployment/chapter-3-performance-evaluation-quantized-llms/measuring-inference-latency-throughput) - Metrics measurement guide
- [Monitoring ML systems in production](https://www.evidentlyai.com/blog/ml-monitoring-metrics) - Monitoring best practices
- [Advanced Shadcn Table: Server-Side Sort, Filter, Paginate](https://next.jqueryscript.net/shadcn-ui/advanced-shadcn-table/) - Advanced table patterns
- [Building Dynamic Tables in Next.js with Shadcn and TanStack](https://devpalma.com/en/posts/shadcn-tables) - Tutorial
- [Semantic Versioning for ML models](https://gerben-oostra.medium.com/semantic-versioning-for-ml-models-8315d03907bf) - Versioning strategies
- [Model Versioning Infrastructure](https://introl.com/blog/model-versioning-infrastructure-mlops-artifact-management-guide-2025) - MLOps infrastructure guide (2025)
- [Status indicators - Carbon Design System](https://carbondesignsystem.com/patterns/status-indicator-pattern/) - Status badge patterns

### Tertiary (LOW confidence - for context only)
- Various GitHub discussions on TanStack Table patterns (verified against official docs)
- Community blog posts on deployment monitoring (cross-referenced with authoritative sources)

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** - TanStack Table v8 is industry standard as of 2026, ShadCN integration is official
- Architecture: **HIGH** - Deployment schema patterns verified by MLOps guides, inference metrics distributions based on production monitoring research
- Pitfalls: **MEDIUM-HIGH** - TanStack Table type issues are common (documented in GitHub issues), metric realism is based on multiple observability sources
- Inference metrics: **MEDIUM** - Ranges are realistic based on production ML monitoring guides, but not Liquid AI-specific

**Research date:** 2026-02-15
**Valid until:** 2026-03-15 (30 days - stack is stable, deployment patterns evolve slowly)

**Key limitations:**
- No official Liquid AI deployment documentation available
- Inference metrics are simulated - real production values would vary by infrastructure
- TanStack Table patterns verified through documentation, but specific ShadCN integration details will require testing

**Next steps for planner:**
1. Create schema migration plan (add `deployments` table with versioning)
2. Install missing dependencies (TanStack Table, ShadCN table component)
3. Create inference simulator service in lib/services/inference-simulator.ts
4. Build deployments table page with TanStack Table + filtering/sorting
5. Implement "deploy" Server Action from training monitor
6. Add deployment detail page with inference metrics cards
7. Update dashboard to show deployment counts/stats
