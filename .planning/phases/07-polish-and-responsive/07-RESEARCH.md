# Phase 7: Polish & Responsive - Research

**Researched:** 2026-02-15
**Domain:** UI/UX polish, responsive design, loading states, animations
**Confidence:** HIGH

## Summary

Phase 7 focuses on elevating the user experience through comprehensive polish: loading states (skeletons/spinners), empty states with CTAs, responsive design across devices (desktop/tablet/mobile), smooth page transitions with Framer Motion, and realistic ML-domain chart values.

The existing stack is well-positioned for this phase: Tailwind v4 with built-in container queries, shadcn/ui components (Skeleton, Spinner), Recharts with ResponsiveContainer already in use, and the sidebar component with built-in mobile responsiveness. The primary additions are Framer Motion for page transitions and systematic empty state patterns.

**Primary recommendation:** Use a layered approach: (1) Add skeleton/spinner loading states to all async operations, (2) Design empty states with domain-specific CTAs, (3) Leverage Tailwind v4 container queries for component-level responsiveness, (4) Implement Framer Motion with FrozenRouter pattern for App Router compatibility, (5) Normalize chart data to realistic ML training ranges (loss: 0.1-5.0, GPU utilization: 40-85%, learning rates: 0.001-0.01).

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **framer-motion** | ^11.18.0 | Page transitions & animations | Industry standard for React animations with Next.js App Router support via FrozenRouter pattern |
| **@shadcn/ui skeleton** | latest | Loading placeholders | Official shadcn component with Tailwind v4 compatibility |
| **@shadcn/ui spinner** | latest | Action loading indicators | Official component using lucide-react LoaderIcon with animate-spin |
| **Tailwind v4** | 4.1.18 (installed) | Responsive design | Built-in container queries, mobile-first breakpoints, no config file needed |
| **Recharts ResponsiveContainer** | 3.7.0 (installed) | Chart responsiveness | Standard wrapper for responsive charts across devices |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **use-debounce** | 10.1.0 (installed) | Performance optimization | Debounce expensive operations during window resize |
| **React Suspense** | (built-in) | Server component loading | Streaming SSR with loading.tsx boundaries |
| **lucide-react** | 0.564.0 (installed) | Empty state icons | Contextual icons for empty states (FolderOpen, FileText, etc.) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Framer Motion | React Spring | React Spring has better physics-based animations, but Framer Motion has better Next.js App Router support and simpler API |
| Skeleton component | Custom shimmer CSS | Custom CSS provides more control but skeleton component ensures consistency with design system |
| Container queries | Media queries only | Container queries enable component-level responsiveness; media queries are viewport-only but have wider support |

**Installation:**
```bash
pnpm install framer-motion
pnpm dlx shadcn@latest add skeleton
pnpm dlx shadcn@latest add spinner
```

## Architecture Patterns

### Recommended Project Structure
```
app/(dashboard)/
├── components/
│   ├── empty-states/        # Reusable empty state components
│   │   ├── empty-jobs.tsx
│   │   ├── empty-deployments.tsx
│   │   └── empty-search.tsx
│   └── loading/             # Loading state components
│       ├── table-skeleton.tsx
│       ├── card-skeleton.tsx
│       └── chart-skeleton.tsx
├── lib/
│   └── constants/
│       └── ml-metrics.ts    # Realistic ML value ranges
└── providers/
    └── layout-transition.tsx # Framer Motion wrapper
```

### Pattern 1: Skeleton Loading States
**What:** Replace blank spaces during async operations with skeleton placeholders that match final content structure
**When to use:** All async data fetching (lists, tables, charts, cards)
**Example:**
```typescript
// Source: https://ui.shadcn.com/docs/components/skeleton
import { Skeleton } from "@/components/ui/skeleton"

export function CardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  )
}

// Usage with React Suspense
<Suspense fallback={<CardSkeleton />}>
  <AsyncDataCard />
</Suspense>
```

### Pattern 2: Empty States with CTAs
**What:** Purpose-built screens when data doesn't exist yet, with helpful CTAs to populate
**When to use:** Empty lists, cleared states, no search results
**Example:**
```typescript
// Source: https://www.eleken.co/blog-posts/empty-state-ux
import { FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

export function EmptyJobs() {
  return (
    <Card className="flex flex-col items-center justify-center p-12 text-center">
      <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No training jobs yet</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        Start your first training job to fine-tune models on your data
      </p>
      <Button asChild>
        <Link href="/training">Start Training</Link>
      </Button>
    </Card>
  )
}
```

### Pattern 3: Responsive Design with Container Queries
**What:** Use Tailwind v4 @container queries for component-level responsiveness
**When to use:** Reusable components that need to adapt to their container, not just viewport
**Example:**
```typescript
// Source: https://tailwindcss.com/docs/responsive-design
export function MetricsCard() {
  return (
    <div className="@container">
      {/* Stack on small containers, row on larger containers */}
      <div className="flex flex-col @md:flex-row gap-4">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">Active Jobs</p>
          <p className="text-2xl @lg:text-3xl font-bold">12</p>
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl @lg:text-3xl font-bold">48</p>
        </div>
      </div>
    </div>
  )
}
```

### Pattern 4: Framer Motion Page Transitions (Next.js App Router)
**What:** Smooth page transitions using FrozenRouter pattern to prevent App Router unmounting during animations
**When to use:** Root layout for app-wide transitions
**Example:**
```typescript
// Source: https://www.imcorfitz.com/posts/adding-framer-motion-page-transitions-to-next-js-app-router
"use client"

import { useContext, useEffect, useRef } from "react"
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { useSelectedLayoutSegment } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"

// Preserve previous router context during animations
function FrozenRouter({ children }: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext)
  const prevContext = useRef(context)
  const segment = useSelectedLayoutSegment()
  const prevSegment = useRef(segment)

  useEffect(() => {
    prevContext.current = context
    prevSegment.current = segment
  }, [context, segment])

  const changed = segment !== prevSegment.current &&
    segment !== undefined &&
    prevSegment.current !== undefined

  return (
    <LayoutRouterContext.Provider value={changed ? prevContext.current : context}>
      {children}
    </LayoutRouterContext.Provider>
  )
}

export function LayoutTransition({ children }: { children: React.ReactNode }) {
  const segment = useSelectedLayoutSegment()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={segment}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  )
}

// Usage in app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }) {
  return <LayoutTransition>{children}</LayoutTransition>
}
```

### Pattern 5: Responsive Charts
**What:** Recharts ResponsiveContainer with mobile-friendly axis labels and tooltips
**When to use:** All chart components
**Example:**
```typescript
// Source: https://www.dhiwise.com/post/simplify-data-visualization-with-recharts-responsivecontainer
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis } from "recharts"

export function LossChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <XAxis
          dataKey="step"
          // Hide label on mobile, show on desktop
          label={{ value: "Training Step", position: "insideBottom", className: "hidden md:block" }}
          // Reduce tick count on mobile
          tickCount={window.innerWidth < 768 ? 5 : 10}
        />
        <YAxis
          domain={[0, "dataMax + 0.5"]}
          // More compact label on mobile
          width={window.innerWidth < 768 ? 40 : 60}
        />
        <Line type="monotone" dataKey="loss" stroke="hsl(var(--chart-1))" />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

### Pattern 6: Spinner for Action Loading
**What:** Inline spinner component for button/action loading states
**When to use:** Form submissions, API mutations, button actions
**Example:**
```typescript
// Source: https://ui.shadcn.com/docs/components/radix/spinner
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"

export function DeployButton() {
  const [isDeploying, setIsDeploying] = useState(false)

  return (
    <Button disabled={isDeploying} onClick={handleDeploy}>
      {isDeploying ? (
        <>
          <Spinner className="size-4 mr-2" />
          Deploying...
        </>
      ) : (
        "Deploy Model"
      )}
    </Button>
  )
}
```

### Anti-Patterns to Avoid
- **Viewport-only responsive design:** Don't rely solely on `md:` `lg:` breakpoints; use `@container` queries for truly reusable components
- **Blank loading screens:** Never show a completely blank page; always show skeletons that match final content structure
- **Generic empty states:** Avoid "No data found" with no context; provide specific messaging and next actions
- **Animating layout-affecting properties:** Don't animate `width`, `height`, `top`, `left`; use `transform` and `opacity` for performance
- **Ignoring prefers-reduced-motion:** Always respect user accessibility settings with `useReducedMotion` hook
- **Unrealistic chart ranges:** Don't show loss values from 0-100 or GPU utilization at 100%; use domain-appropriate realistic ranges

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Loading skeletons | Custom div-based placeholders | `@shadcn/ui skeleton` | Consistent with design system, Tailwind v4 compatible, handles RTL layouts |
| Spinner animations | CSS keyframe spinners | `@shadcn/ui spinner` (lucide-react + animate-spin) | Accessible with ARIA attributes, consistent sizing, themeable |
| Page transitions in App Router | Custom route change detection | FrozenRouter + LayoutTransition pattern | Handles App Router's aggressive unmounting, prevents animation jank |
| Container-based responsive | JavaScript ResizeObserver | Tailwind v4 @container queries | Native CSS, better performance, no JS needed |
| Chart responsiveness | Manual dimension calculations | Recharts ResponsiveContainer | Handles window resize, maintains aspect ratio, debounced updates |
| Empty state templates | Ad-hoc empty divs | Reusable EmptyState components | Consistency, proper ARIA labels, standard CTA patterns |
| Reduced motion detection | Custom matchMedia | Framer Motion's useReducedMotion hook | Handles accessibility, automatic animation disabling, React integration |

**Key insight:** UI polish touches every component, so consistency matters more than customization. Use design system components and established patterns to avoid creating subtle UX inconsistencies across the app.

## Common Pitfalls

### Pitfall 1: Layout Shift from Loading States
**What goes wrong:** Skeletons don't match final content dimensions, causing jarring layout shifts (poor CLS score)
**Why it happens:** Generic skeleton dimensions that don't account for actual content size
**How to avoid:** Match skeleton dimensions exactly to final rendered content; use same card/padding/spacing structure
**Warning signs:** Content "jumps" when loading completes; scrollbar appears/disappears suddenly

### Pitfall 2: Framer Motion Breaks on App Router Navigation
**What goes wrong:** Animations don't complete; pages flash instead of smoothly transitioning
**Why it happens:** Next.js App Router aggressively updates context, unmounting components mid-animation
**How to avoid:** Use FrozenRouter pattern to freeze router context during exit animations
**Warning signs:** Exit animations never play; only enter animations work; console errors about context changes

### Pitfall 3: Mobile Charts with Unreadable Labels
**What goes wrong:** Chart axis labels overlap, tooltips are too large, data points too dense
**Why it happens:** Desktop-optimized charts don't adjust for smaller touch targets and viewport sizes
**How to avoid:** Use Tailwind breakpoints to adjust tickCount, label visibility, and margin/padding; increase touch target sizes
**Warning signs:** Axis labels overlap on mobile; tooltips cut off screen edges; zoomed-out pinching needed to read charts

### Pitfall 4: Empty States Without Context
**What goes wrong:** User sees "No data" but doesn't understand why or what to do next
**Why it happens:** Generic empty state messages without domain context or CTAs
**How to avoid:** Provide specific messaging ("No training jobs yet" not "No data"), explain why state is empty, always include relevant CTA
**Warning signs:** User confusion about next steps; high bounce rates from empty pages; support questions about "missing" features

### Pitfall 5: Animating Expensive Properties
**What goes wrong:** Animations feel janky, drop frames, or cause performance issues
**Why it happens:** Animating properties that trigger layout recalculation (width, height, top, left, margin)
**How to avoid:** Only animate `transform` and `opacity` for smooth 60fps; use Framer Motion's `layout` prop for layout animations
**Warning signs:** Animation stutter; frame drops in DevTools performance panel; poor FPS on mobile

### Pitfall 6: Sidebar v3 Syntax in Tailwind v4
**What goes wrong:** Sidebar widths don't apply; CSS variables don't work as expected
**Why it happens:** ShadCN sidebar ships with Tailwind v3 syntax `w-[--sidebar-width]` which must be `w-(--sidebar-width)` in v4
**How to avoid:** Audit all ShadCN components after install; replace `[--var]` with `(--var)` for CSS variable references
**Warning signs:** Sidebar width stuck at default; CSS variables in bracket notation not working

### Pitfall 7: Unrealistic ML Metrics Break Credibility
**What goes wrong:** Charts show GPU at 100% constantly, loss values from 0-1000, learning rate 1.0
**Why it happens:** Random data generation without domain knowledge or realistic constraints
**How to avoid:** Use ML-appropriate ranges (loss: 0.1-5.0, GPU: 40-85%, learning rate: 0.001-0.01, accuracy: 0.6-0.95)
**Warning signs:** Metrics look "too perfect" or impossibly consistent; values outside normal ML ranges; domain experts notice immediately

### Pitfall 8: Missing Reduced Motion Support
**What goes wrong:** Users with motion sensitivity experience discomfort or accessibility issues
**Why it happens:** Animations implemented without checking `prefers-reduced-motion` media query
**How to avoid:** Use Framer Motion's `useReducedMotion` hook or MotionConfig's `reducedMotion="user"` setting; replace transform animations with opacity-only
**Warning signs:** WCAG accessibility violations; user complaints about motion sickness; failing automated accessibility audits

## Code Examples

Verified patterns from official sources:

### Table Skeleton Loading
```typescript
// Source: https://ui.shadcn.com/docs/components/skeleton
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead><Skeleton className="h-4 w-24" /></TableHead>
          <TableHead><Skeleton className="h-4 w-32" /></TableHead>
          <TableHead><Skeleton className="h-4 w-20" /></TableHead>
          <TableHead><Skeleton className="h-4 w-16" /></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// Usage in page.tsx
export default async function DeploymentsPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={10} />}>
      <DeploymentsTable />
    </Suspense>
  )
}
```

### Empty State with CTA Pattern
```typescript
// Source: https://www.eleken.co/blog-posts/empty-state-ux
import { FolderOpen, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  actionLabel: string
  actionHref: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <Icon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          {description}
        </p>
        <Button asChild>
          <Link href={actionHref}>
            <Plus className="size-4 mr-2" />
            {actionLabel}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

// Usage
<EmptyState
  icon={FolderOpen}
  title="No training jobs yet"
  description="Start your first training job to fine-tune models on your data"
  actionLabel="Start Training"
  actionHref="/training"
/>
```

### Responsive Container Query Card
```typescript
// Source: https://tailwindcss.com/docs/responsive-design
export function MetricsCard({ title, value, change }) {
  return (
    <Card className="@container">
      <CardContent className="p-6">
        {/* Stack on small containers, row on larger */}
        <div className="flex flex-col @md:flex-row @md:items-center @md:justify-between gap-2">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            {/* Smaller text in small containers */}
            <p className="text-2xl @lg:text-3xl font-bold">{value}</p>
          </div>
          {/* Badge hidden in small containers */}
          <Badge className="hidden @md:inline-flex self-start @md:self-auto">
            {change}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
```

### Accessible Framer Motion with Reduced Motion
```typescript
// Source: https://motion.dev/docs/react-accessibility
import { motion, useReducedMotion } from "framer-motion"

export function AnimatedCard({ children }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -20 }}
      transition={{ duration: shouldReduceMotion ? 0.01 : 0.3 }}
    >
      {children}
    </motion.div>
  )
}

// Alternative: Global config
import { MotionConfig } from "framer-motion"

export function Providers({ children }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  )
}
```

### Realistic ML Metrics Constants
```typescript
// Source: https://developers.google.com/machine-learning/crash-course/overfitting/interpreting-loss-curves
// and https://neptune.ai/blog/optimizing-gpu-usage-during-model-training-with-neptune

export const ML_METRIC_RANGES = {
  // Loss typically starts 2-5, decreases to 0.1-1.0 for good convergence
  loss: {
    initial: { min: 2.0, max: 5.0 },
    converged: { min: 0.1, max: 1.0 },
    typical: { min: 0.3, max: 3.0 },
  },

  // GPU utilization: 40-85% is realistic (not 100%)
  // Source: NVIDIA research shows 43-52% for distributed training
  gpuUtilization: {
    low: { min: 25, max: 40 },
    good: { min: 40, max: 60 },
    excellent: { min: 60, max: 85 },
  },

  // Learning rates typically 0.001 to 0.01
  learningRate: {
    small: 0.0001,
    typical: 0.001,
    large: 0.01,
  },

  // Batch sizes: 32-512 is common
  batchSize: [32, 64, 128, 256, 512],

  // Accuracy: starts 0.4-0.6, improves to 0.75-0.95
  accuracy: {
    initial: { min: 0.4, max: 0.6 },
    trained: { min: 0.75, max: 0.95 },
  },

  // Epochs: 10-100 typical (not thousands)
  epochs: {
    quick: 10,
    standard: 50,
    thorough: 100,
  },
}

// Helper to generate realistic loss curve
export function generateRealisticLossCurve(steps: number) {
  const data = []
  const initialLoss = 3.5
  const finalLoss = 0.3

  for (let i = 0; i < steps; i++) {
    // Exponential decay with some noise
    const progress = i / steps
    const baseLoss = initialLoss * Math.exp(-4 * progress) + finalLoss
    const noise = (Math.random() - 0.5) * 0.1
    const loss = Math.max(0.05, baseLoss + noise)

    data.push({
      step: i,
      loss: parseFloat(loss.toFixed(4)),
      epoch: Math.floor((i / steps) * 50),
    })
  }

  return data
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Viewport-only responsive (media queries) | Container queries (`@container`) | Tailwind v4 (2024) | Components can be truly reusable; responsiveness based on container not viewport |
| Manual ResizeObserver for charts | Recharts ResponsiveContainer | Recharts 2.0+ (2022) | Built-in debounced resize handling; no custom JS needed |
| Pages Router page transitions | App Router with FrozenRouter pattern | Next.js 13+ App Router (2023) | App Router's streaming requires context freezing to prevent animation breaks |
| Generic "Loading..." text | Skeleton screens matching content | UX trend (2020+) | Perceived performance improvement; users see structure immediately |
| Spinner-only loading | Skeleton + Spinner hybrid | Modern practice (2023+) | Skeletons for data fetch, spinners for actions (deploy, submit) |
| Custom animation libraries | Framer Motion with useReducedMotion | WCAG 2.1+ requirement (2018) | Accessibility compliance; respects user motion preferences |
| Tailwind v3 `w-[--var]` syntax | Tailwind v4 `w-(--var)` syntax | Tailwind v4 (2024) | Explicit CSS variable syntax; auto-var inference removed |

**Deprecated/outdated:**
- **Framer Motion's `initial={false}` for no animation:** Use `useReducedMotion` hook instead for accessibility
- **Manual window.matchMedia for mobile detection:** Use Tailwind breakpoints or existing `useIsMobile` hook
- **@tailwindcss/container-queries plugin:** Now built into Tailwind v4 core, plugin no longer needed
- **Generic "No data" messages:** Modern UX requires specific context and CTAs for empty states

## Open Questions

1. **Should page transitions be app-wide or per-route-group?**
   - What we know: FrozenRouter works in root layout; can also be scoped to (dashboard) group
   - What's unclear: Whether analytics/marketing pages should have different transition styles
   - Recommendation: Start with (dashboard)-scoped transitions; keeps marketing pages snappy, app pages polished

2. **What's the right skeleton strategy for nested Suspense boundaries?**
   - What we know: Can nest `<Suspense>` boundaries for progressive loading; each needs own fallback
   - What's unclear: Whether to show page-level skeleton first or component-level skeletons immediately
   - Recommendation: Use layout.tsx loading.tsx for route-level skeleton, Suspense for component-level data (charts, tables)

3. **How to handle reduced motion for chart animations?**
   - What we know: Framer Motion has `useReducedMotion`; Recharts has `animationDuration` prop
   - What's unclear: Whether to completely disable chart animations or just reduce duration
   - Recommendation: Reduce `animationDuration` from 300ms to 0ms when `prefers-reduced-motion` is active; keeps functionality, respects accessibility

4. **Should empty states be server or client components?**
   - What we know: Empty states are often conditional based on data length; data is server-fetched
   - What's unclear: Whether to server-render empty state or use client-side conditional
   - Recommendation: Server-render empty states by checking data length in server component before rendering table/list; no client JS needed

## Sources

### Primary (HIGH confidence)
- [shadcn/ui Skeleton Component](https://ui.shadcn.com/docs/components/skeleton) - Official component docs, installation, usage
- [shadcn/ui Spinner Component](https://ui.shadcn.com/docs/components/radix/spinner) - Official spinner docs with lucide-react
- [shadcn/ui Sidebar Component](https://ui.shadcn.com/docs/components/radix/sidebar) - Responsive sidebar patterns, mobile handling
- [Tailwind CSS v4 Responsive Design](https://tailwindcss.com/docs/responsive-design) - Breakpoints, container queries, mobile-first approach
- [Framer Motion: Solving App Router Transitions](https://www.imcorfitz.com/posts/adding-framer-motion-page-transitions-to-next-js-app-router) - Complete FrozenRouter pattern implementation
- [React Suspense Documentation](https://react.dev/reference/react/Suspense) - Official React Suspense patterns
- [Google ML: Interpreting Loss Curves](https://developers.google.com/machine-learning/crash-course/overfitting/interpreting-loss-curves) - Realistic loss progression patterns
- [Motion: Create Accessible Animations](https://motion.dev/docs/react-accessibility) - Reduced motion implementation

### Secondary (MEDIUM confidence)
- [Empty State UX Examples and Design Rules](https://www.eleken.co/blog-posts/empty-state-ux) - Practical patterns, CTA guidelines, verified with multiple design systems
- [Recharts ResponsiveContainer Guide](https://www.dhiwise.com/post/simplify-data-visualization-with-recharts-responsivecontainer) - Implementation patterns, verified with official docs
- [Neptune.ai: Optimizing GPU Usage](https://neptune.ai/blog/optimizing-gpu-usage-during-model-training-with-neptune) - GPU utilization ranges (40-85% realistic), verified against NVIDIA research
- [Databricks: How Not to Scale Deep Learning](https://www.databricks.com/blog/2019/08/15/how-not-to-scale-deep-learning-in-6-easy-steps.html) - Batch size, learning rate relationships
- [Next.js Loading UI and Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming) - loading.tsx patterns with Suspense
- [Tailwind Container Queries (v4)](https://tailkits.com/blog/tailwind-container-queries/) - @container usage patterns
- [Framer Motion Performance Best Practices](https://blog.pixelfreestudio.com/how-to-use-framer-motion-for-advanced-animations-in-react/) - transform/opacity optimization
- [Skeleton Loading CSS Shimmer](https://codewithbilal.medium.com/how-to-create-a-skeleton-loading-shimmer-effect-with-pure-css-7f9041ec9134) - CSS animation techniques

### Tertiary (LOW confidence, needs validation)
- Web search findings on empty state design patterns (multiple sources agree on 1-3 word CTA, verb-first, sentence case)
- Web search findings on sidebar responsive patterns (off-canvas, mini-variant, breakpoint approaches are common)
- Web search findings on skeleton shimmer effects (linear-gradient with @keyframes is standard approach)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified through official docs and package.json; Framer Motion Next.js App Router pattern confirmed via multiple sources
- Architecture: HIGH - Patterns extracted from official docs (shadcn, Tailwind, Framer Motion) and verified implementations
- Pitfalls: MEDIUM-HIGH - Layout shift, animation breaks, mobile charts are documented issues; Tailwind v4 sidebar syntax confirmed from project memory; ML metrics verified against Google/NVIDIA research
- Realistic ML values: MEDIUM - Loss curve patterns verified (Google ML course), GPU utilization ranges verified (Neptune.ai, NVIDIA research), but specific ranges may vary by model type
- Empty states: MEDIUM - Design patterns consistent across multiple UX sources, but specific implementation details should be validated with actual user testing

**Research date:** 2026-02-15
**Valid until:** 2026-03-17 (30 days - stable domains like responsive design and loading patterns)

**Key assumption requiring validation:**
- Framer Motion compatibility with React 19 and Next.js 16 (research sources cover Next.js 15/React 18; need to verify no breaking changes)
- Container query browser support is universal (may need fallback for older browsers, though Tailwind v4 assumes modern browser baseline)

**Areas of full confidence (can state as fact):**
- Tailwind v4 has built-in container queries with @container syntax
- shadcn/ui Skeleton and Spinner components exist and are Tailwind v4 compatible
- Next.js App Router requires FrozenRouter pattern for smooth Framer Motion transitions
- Recharts ResponsiveContainer handles chart responsiveness automatically
- Project already has Recharts, Tailwind v4, shadcn/ui, lucide-react, and use-debounce installed

**Areas requiring implementation validation:**
- Exact Framer Motion animation timing values (0.2s vs 0.3s) should be tuned based on feel
- Specific skeleton dimensions should match actual rendered components
- ML metric ranges should be validated against actual LiquidAI model training logs if available
- Empty state CTAs should be A/B tested for conversion if metrics collection exists
