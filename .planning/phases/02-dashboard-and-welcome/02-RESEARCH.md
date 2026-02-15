# Phase 2: Dashboard & Welcome - Research

**Researched:** 2026-02-15
**Domain:** Dashboard UI patterns, welcome modals, metrics cards, status indicators, localStorage state management
**Confidence:** HIGH

## Summary

Phase 2 builds the dashboard landing page with summary metrics cards, recent training jobs, and a first-time visitor welcome modal. The stack leverages ShadCN/ui Card, Dialog, and Badge components in Next.js 16 with Server Components for data fetching and Client Components for interactive modals with localStorage persistence.

**Dashboard patterns in 2026** emphasize card-based metric layouts with clear visual hierarchy: each card displays a single metric or set of related metrics with context (current value, trend, benchmark). Status indicators combine multiple elements (color, icon, text, shape) for accessibility. The Carbon Design System recommends at least three visual elements for WCAG compliance — color alone is insufficient for color-blind users.

**Welcome modals** are standard onboarding UX: 90% of new user onboarding sequences begin with a welcome message in a modal. Best practice for 2026 is minimalist modals shown at the perfect moment (right after first visit) with clear CTAs and dismissal options. The floating button pattern allows users to reopen dismissed modals without navigation disruption.

**Next.js 16 data architecture** uses Server Components for database queries (Drizzle ORM with Neon) and Client Components only where interactivity is required (modal state, localStorage). Data flows from Server Components as props to Client Components, maintaining server-side security while enabling rich interactions.

**Primary recommendation:** Build dashboard as Server Component fetching training job data via Drizzle ORM. Use ShadCN Card components for metrics, Badge components for status indicators. Implement welcome modal as Client Component with Dialog primitive, storing dismissal state in localStorage via custom useLocalStorage hook. Add floating action button (Button with fixed positioning) to reopen modal.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App Router framework | Already installed, Server Components for data fetching |
| React | 19.2.4 | UI framework | Already installed, includes `use` hook for streaming |
| ShadCN/ui Card | Latest | Metrics card layout | Official component, composable structure (Header, Content, Footer) |
| ShadCN/ui Dialog | Latest | Welcome modal | Radix primitive, accessible, focus trapping, keyboard nav |
| ShadCN/ui Badge | Latest | Status indicators | Multiple variants (default, secondary, destructive, outline) |
| Drizzle ORM | 0.45.1 | Database queries | Already installed, type-safe Server Component queries |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @faker-js/faker | Latest | Mock data generation | Realistic training job data during development |
| Lucide React | 0.564.0 | Icons for cards and status | Already installed, consistent with ShadCN ecosystem |
| React `cache` | Built-in | Deduplicate queries | Wrap database queries for automatic request memoization |
| React `Suspense` | Built-in | Streaming loading states | Wrap async components for progressive rendering |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| ShadCN Dialog | Custom modal | Dialog handles focus trap, ESC key, overlay dismiss automatically |
| Custom localStorage hook | Direct localStorage calls | Hook handles SSR safety, JSON serialization, event syncing |
| faker.js | Hand-written mock data | faker.js generates realistic varied data, saves time |
| Server Component queries | Client-side fetching (SWR) | Server Components reduce client bundle, faster initial load |

**Installation:**
```bash
# Add missing ShadCN components
pnpm dlx shadcn@latest add card dialog badge

# Add faker.js for mock data generation
pnpm add -D @faker-js/faker
```

## Architecture Patterns

### Recommended Component Structure
```
app/(dashboard)/
├── page.tsx                      # Dashboard Server Component (data fetching)
├── components/
│   ├── dashboard-metrics.tsx     # Server Component: summary cards
│   ├── recent-jobs-list.tsx      # Server Component: training jobs table
│   ├── welcome-modal.tsx         # Client Component: first-time visitor modal
│   └── welcome-fab.tsx           # Client Component: floating action button
lib/
├── db/
│   └── queries.ts                # Database query functions (cached)
└── hooks/
    └── use-local-storage.ts      # Custom hook for localStorage state
```

### Pattern 1: Server Component Dashboard with Metrics Cards
**What:** Fetch data in Server Component, render cards with summary metrics
**When to use:** Dashboard landing pages displaying database-sourced metrics
**Example:**
```typescript
// app/(dashboard)/page.tsx
import { db } from '@/lib/db/client'
import { trainingJobs } from '@/lib/db/schema'
import { eq, count, and } from 'drizzle-orm'
import { DashboardMetrics } from './components/dashboard-metrics'
import { RecentJobsList } from './components/recent-jobs-list'
import { WelcomeModal } from './components/welcome-modal'

export default async function DashboardPage() {
  // Parallel data fetching
  const [activeJobs, completedJobs, recentJobs] = await Promise.all([
    db.select({ count: count() })
      .from(trainingJobs)
      .where(eq(trainingJobs.status, 'running')),
    db.select({ count: count() })
      .from(trainingJobs)
      .where(eq(trainingJobs.status, 'complete')),
    db.select()
      .from(trainingJobs)
      .orderBy(trainingJobs.createdAt, 'desc')
      .limit(5),
  ])

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Monitor your training jobs and model deployments
        </p>
      </div>

      <DashboardMetrics
        activeJobs={activeJobs[0].count}
        completedJobs={completedJobs[0].count}
      />

      <RecentJobsList jobs={recentJobs} />

      <WelcomeModal />
    </div>
  )
}
```

### Pattern 2: Metrics Card Layout
**What:** Grid of summary cards with icon, value, label, and optional trend
**When to use:** Displaying KPIs and summary statistics
**Example:**
```typescript
// app/(dashboard)/components/dashboard-metrics.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, CheckCircle2, Clock } from 'lucide-react'

type MetricsProps = {
  activeJobs: number
  completedJobs: number
}

export function DashboardMetrics({ activeJobs, completedJobs }: MetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeJobs}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Currently running
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedJobs}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Total successful
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Last hour</div>
          <p className="text-xs text-muted-foreground mt-1">
            Latest updates
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Pattern 3: Status Badges for Training Jobs
**What:** Combine color, icon, and text for accessible status indicators
**When to use:** Displaying job/task states (queued, running, complete, failed)
**Example:**
```typescript
// app/(dashboard)/components/status-badge.tsx
import { Badge } from '@/components/ui/badge'
import { Circle } from 'lucide-react'

type Status = 'queued' | 'running' | 'complete' | 'failed'

const statusConfig = {
  queued: {
    label: 'Queued',
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  },
  running: {
    label: 'Running',
    variant: 'default' as const,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  complete: {
    label: 'Complete',
    variant: 'outline' as const,
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  failed: {
    label: 'Failed',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
}

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status]

  return (
    <Badge variant={config.variant} className={config.className}>
      <Circle className="mr-1 h-2 w-2 fill-current" />
      {config.label}
    </Badge>
  )
}
```

### Pattern 4: Welcome Modal with localStorage Dismissal
**What:** Client Component modal shown on first visit, persists dismissal state
**When to use:** First-time user onboarding, feature announcements
**Example:**
```typescript
// app/(dashboard)/components/welcome-modal.tsx
'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { useState } from 'react'

export function WelcomeModal() {
  const [hasSeenWelcome, setHasSeenWelcome] = useLocalStorage('vapor-welcome-seen', false)
  const [isOpen, setIsOpen] = useState(!hasSeenWelcome)

  const handleDismiss = () => {
    setHasSeenWelcome(true)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome to Vapor</DialogTitle>
          <DialogDescription>
            A demonstration of Liquid AI's LFMs with an accessible training interface.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            This is a portfolio project showcasing:
          </p>
          <ul className="list-disc list-inside text-sm space-y-2 text-muted-foreground">
            <li>Liquid AI's Liquid Foundation Models</li>
            <li>Simulated training workflows</li>
            <li>Real-time metrics visualization</li>
          </ul>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleDismiss}>
            Got it
          </Button>
          <Button onClick={handleDismiss}>
            Start Training
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### Pattern 5: useLocalStorage Custom Hook
**What:** Safe localStorage access with SSR handling, JSON serialization, event syncing
**When to use:** Persisting user preferences, dismissal states, UI state
**Example:**
```typescript
// lib/hooks/use-local-storage.ts
'use client'

import { useState, useEffect } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize state with function to avoid re-execution on re-renders
  const [storedValue, setStoredValue] = useState<T>(() => {
    // SSR safety: return initial value if window is undefined
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Update localStorage when state changes
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      // Allow value to be a function (like useState)
      const valueToStore = value instanceof Function ? value(storedValue) : value

      setStoredValue(valueToStore)

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))

        // Dispatch custom event to sync across tabs/components
        window.dispatchEvent(new Event('local-storage'))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const item = window.localStorage.getItem(key)
        if (item) {
          setStoredValue(JSON.parse(item))
        }
      } catch (error) {
        console.warn(`Error handling storage change for key "${key}":`, error)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('local-storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('local-storage', handleStorageChange)
    }
  }, [key])

  return [storedValue, setValue]
}
```

### Pattern 6: Floating Action Button to Reopen Modal
**What:** Fixed-position button in corner, reopens dismissed modal
**When to use:** Non-intrusive access to help, announcements, settings
**Example:**
```typescript
// app/(dashboard)/components/welcome-fab.tsx
'use client'

import { Button } from '@/components/ui/button'
import { HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type WelcomeFABProps = {
  onClick: () => void
  hasSeenWelcome: boolean
}

export function WelcomeFAB({ onClick, hasSeenWelcome }: WelcomeFABProps) {
  // Only show FAB if user has dismissed the modal
  if (!hasSeenWelcome) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            size="icon"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
          >
            <HelpCircle className="h-6 w-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Show welcome message</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Usage in welcome-modal.tsx:
// <WelcomeFAB onClick={() => setIsOpen(true)} hasSeenWelcome={hasSeenWelcome} />
```

### Pattern 7: Cached Database Queries
**What:** Wrap database queries with React `cache` for automatic deduplication
**When to use:** Shared queries called multiple times in component tree
**Example:**
```typescript
// lib/db/queries.ts
import { cache } from 'react'
import { db } from './client'
import { trainingJobs } from './schema'
import { eq, desc } from 'drizzle-orm'

// Cached query - automatically deduplicated within request
export const getRecentJobs = cache(async (limit: number = 10) => {
  return db
    .select()
    .from(trainingJobs)
    .orderBy(desc(trainingJobs.createdAt))
    .limit(limit)
})

export const getJobById = cache(async (id: number) => {
  const jobs = await db
    .select()
    .from(trainingJobs)
    .where(eq(trainingJobs.id, id))
    .limit(1)

  return jobs[0] || null
})

// Usage in Server Component:
// const jobs = await getRecentJobs(5)
```

### Anti-Patterns to Avoid
- **Accessing localStorage in Server Components:** localStorage is browser-only API. Always use Client Components with 'use client' directive.
- **Color-only status indicators:** Not accessible. Always combine color + icon + text for WCAG compliance.
- **Awaiting data in sequence when parallel is possible:** Use `Promise.all` for independent queries to reduce latency.
- **Manual localStorage JSON serialization:** Custom hook handles this with error boundaries, avoiding runtime crashes.
- **Modal without escape hatch:** Always provide close button, ESC key, and overlay click dismissal (ShadCN Dialog handles this).
- **Empty dashboard cards:** Show loading skeletons or empty states with CTAs, never blank cards.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal focus management | Custom modal with manual focus trap | ShadCN Dialog | Handles focus trap, ESC key, overlay dismiss, ARIA attributes automatically |
| localStorage state syncing | Direct localStorage.setItem calls | useLocalStorage hook | Handles SSR safety, JSON parse/stringify, cross-tab syncing, error boundaries |
| Status badge styling | Hardcoded className strings per status | Config object + Badge variants | Centralized status config, easier to maintain, dark mode support |
| Data fetching deduplication | Manual request tracking | React `cache` function | Automatic deduplication within request, built-in memoization |
| Mock data generation | Hand-written test data | @faker-js/faker | Realistic varied data, saves time, 70+ locales, consistent seeding |
| Loading states | Empty divs during data fetch | React Suspense + loading.tsx | Streaming, progressive rendering, built-in Next.js pattern |

**Key insight:** Dashboard UX is well-established. Follow accessibility standards (Carbon Design System, WCAG), use ShadCN primitives for modals/badges, and leverage Next.js 16 Server Components for efficient data loading. Don't reinvent modal management or localStorage patterns — use proven libraries.

## Common Pitfalls

### Pitfall 1: localStorage Accessed in Server Component
**What goes wrong:** Runtime error "localStorage is not defined" during server render
**Why it happens:** localStorage is browser-only API, Server Components run on server
**How to avoid:**
- Mark any component using localStorage with `'use client'` directive
- Check `typeof window !== 'undefined'` before accessing localStorage
- Use useEffect hook to safely access browser APIs after hydration
- Never import localStorage-dependent code in Server Components
**Warning signs:** Build-time or runtime errors mentioning "window is not defined" or "localStorage is not defined"

### Pitfall 2: Dialog State Not Controlled Properly
**What goes wrong:** Modal can't reopen after dismissal, or stays open unexpectedly
**Why it happens:** Mixing controlled and uncontrolled Dialog patterns, or not persisting dismissal state
**How to avoid:**
- Use controlled pattern: `<Dialog open={isOpen} onOpenChange={setIsOpen}>`
- Store dismissal state in localStorage, not just component state
- FAB component must update isOpen state to true when clicked
- Ensure state updates trigger re-renders in Client Component
**Warning signs:** Modal doesn't reopen, modal ignores open state changes, modal opens on every page load

### Pitfall 3: Missing Dark Mode Variants for Status Badges
**What goes wrong:** Status badges have poor contrast or wrong colors in dark mode
**Why it happens:** Only defining light mode colors, forgetting dark: prefix
**How to avoid:**
- Define both light and dark colors: `bg-blue-100 dark:bg-blue-900`
- Test all status badges in both themes immediately
- Use semantic color names from theme CSS variables where possible
- Check contrast ratios meet WCAG AA standard (4.5:1)
**Warning signs:** Badges invisible or hard to read in dark mode, user complaints about accessibility

### Pitfall 4: Sequential Database Queries Causing Slow Loads
**What goes wrong:** Dashboard takes 2-3 seconds to load when it should be instant
**Why it happens:** Awaiting queries one-by-one instead of parallel execution
**How to avoid:**
```typescript
// ❌ BAD: Sequential (200ms + 200ms + 200ms = 600ms)
const active = await getActiveJobs()
const completed = await getCompletedJobs()
const recent = await getRecentJobs()

// ✅ GOOD: Parallel (max of 200ms)
const [active, completed, recent] = await Promise.all([
  getActiveJobs(),
  getCompletedJobs(),
  getRecentJobs(),
])
```
**Warning signs:** Slow dashboard loads, waterfalling requests in DevTools Network tab

### Pitfall 5: Hardcoded Metric Values Instead of Database Queries
**What goes wrong:** Dashboard shows stale/incorrect counts, doesn't reflect actual data
**Why it happens:** Using placeholder values during development, forgetting to connect real queries
**How to avoid:**
- Connect database queries from the start, use faker.js to seed realistic test data
- Use TypeScript to enforce data structure from Server Component props
- Add loading states to show data is being fetched
- Test with empty database to verify counts are dynamic
**Warning signs:** Metrics never change, counts don't match database records, hardcoded numbers in code

### Pitfall 6: Welcome Modal Shown Every Page Navigation
**What goes wrong:** Modal pops up on every dashboard visit, even after dismissal
**Why it happens:** Not checking localStorage state before showing modal, or clearing state incorrectly
**How to avoid:**
- Initialize modal state from localStorage: `const [isOpen, setIsOpen] = useState(!hasSeenWelcome)`
- Set localStorage flag on dismissal: `setHasSeenWelcome(true)`
- Don't clear localStorage on navigation/unmount
- Test in incognito mode to verify first-time experience
**Warning signs:** Modal shows every time user visits dashboard, dismissal doesn't persist

## Code Examples

Verified patterns from official sources:

### ShadCN Card Installation and Basic Usage
```bash
# Add Card component
pnpm dlx shadcn@latest add card
```

```typescript
// Basic card structure
// Source: https://ui.shadcn.com/docs/components/radix/card
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Active Training Jobs</CardTitle>
    <CardDescription>Jobs currently running</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-3xl font-bold">12</p>
  </CardContent>
  <CardFooter>
    <Button>View All</Button>
  </CardFooter>
</Card>
```

### ShadCN Dialog Installation and Controlled Pattern
```bash
# Add Dialog component
pnpm dlx shadcn@latest add dialog
```

```typescript
// Controlled dialog pattern
// Source: https://ui.shadcn.com/docs/components/radix/dialog
'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function WelcomeDialog() {
  const [open, setOpen] = useState(true)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome</DialogTitle>
          <DialogDescription>Get started with Vapor</DialogDescription>
        </DialogHeader>
        <Button onClick={() => setOpen(false)}>Close</Button>
      </DialogContent>
    </Dialog>
  )
}
```

### ShadCN Badge Installation and Variants
```bash
# Add Badge component
pnpm dlx shadcn@latest add badge
```

```typescript
// Badge variants for status indicators
// Source: https://ui.shadcn.com/docs/components/radix/badge
import { Badge } from "@/components/ui/badge"

<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

### Next.js 16 Parallel Data Fetching in Server Component
```typescript
// Parallel queries with Promise.all
// Source: https://nextjs.org/docs/app/getting-started/fetching-data
import { db } from '@/lib/db/client'
import { trainingJobs } from '@/lib/db/schema'
import { count, eq } from 'drizzle-orm'

export default async function DashboardPage() {
  // Start all queries simultaneously
  const activeJobsPromise = db
    .select({ count: count() })
    .from(trainingJobs)
    .where(eq(trainingJobs.status, 'running'))

  const completedJobsPromise = db
    .select({ count: count() })
    .from(trainingJobs)
    .where(eq(trainingJobs.status, 'complete'))

  // Wait for all to complete
  const [activeResult, completedResult] = await Promise.all([
    activeJobsPromise,
    completedJobsPromise,
  ])

  return (
    <div>
      <p>Active: {activeResult[0].count}</p>
      <p>Completed: {completedResult[0].count}</p>
    </div>
  )
}
```

### Mock Data Generation with Faker.js
```typescript
// Generate realistic training job data
// Source: https://github.com/faker-js/faker
import { faker } from '@faker-js/faker'
import { trainingJobs } from '@/lib/db/schema'

// Set seed for consistent data across development
faker.seed(123)

function generateMockJobs(count: number) {
  return Array.from({ length: count }, () => ({
    name: faker.company.catchPhrase(),
    status: faker.helpers.arrayElement(['queued', 'running', 'complete', 'failed'] as const),
    modelName: `LFM-${faker.helpers.arrayElement(['1B', '3B', 'Nano'])}`,
    epochs: faker.number.int({ min: 5, max: 50 }),
    learningRate: faker.number.float({ min: 0.0001, max: 0.01, fractionDigits: 4 }),
    createdAt: faker.date.recent({ days: 7 }),
  }))
}

// Usage:
const mockJobs = generateMockJobs(10)
// Insert into database during seeding
await db.insert(trainingJobs).values(mockJobs)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-side data fetching (useEffect) | Server Component queries | Next.js 13+ (2023) | Faster initial loads, smaller client bundles, better SEO |
| Manual localStorage handling | useLocalStorage hooks | Community standard 2022+ | SSR safety, JSON serialization, cross-tab syncing |
| Color-only status indicators | Multi-element status (color + icon + text) | WCAG 2.1 (2018) | Accessible to color-blind users, better UX |
| Custom modal components | Radix/ShadCN Dialog primitives | 2023+ | Better accessibility, keyboard nav, focus management |
| fetch in useEffect | React `cache` + Server Components | React 18/19 (2024+) | Request deduplication, automatic memoization |
| Material UI card grids | ShadCN Card component | 2024+ | Smaller bundles, full design control, Tailwind integration |
| Inline status strings | Status config objects | Design system pattern | Centralized definitions, easier theming, maintainability |

**Deprecated/outdated:**
- **Client Components for all UI:** Next.js 16 defaults to Server Components, use Client only for interactivity
- **useSWR/React Query for server data:** Prefer Server Components for initial load, use SWR only for client-side polling
- **Custom focus trap hooks:** ShadCN Dialog handles this via Radix primitives
- **localStorage without SSR checks:** Modern hooks handle `typeof window !== 'undefined'` automatically
- **Promise.allSettled for critical queries:** Use Promise.all and let errors bubble for proper error boundaries

## Open Questions

1. **Welcome Modal Content Specificity**
   - What we know: Modal should explain "why this was built" and "what to try"
   - What's unclear: Exact copy — should it mention Liquid AI explicitly, or focus on portfolio/demo nature?
   - Recommendation: Draft copy in PLAN, keep it short (3-4 bullets), link to training page as primary CTA

2. **Metrics Card Visual Design**
   - What we know: Cards should show active jobs, deployed models, recent activity
   - What's unclear: Should cards show trends (↑ 12% vs last week) in Phase 2, or defer to later phases?
   - Recommendation: Start simple (just current values), add trends in Phase 5/6 when we have historical data

3. **Floating Button Positioning**
   - What we know: FAB should allow reopening dismissed modal
   - What's unclear: Bottom-right corner (standard), or top-right near theme toggle?
   - Recommendation: Bottom-right (less visual clutter, doesn't compete with navigation)

4. **Mock Data Strategy**
   - What we know: Need realistic training job data for dashboard
   - What's unclear: Seed database with faker.js data, or generate on-the-fly in Server Component?
   - Recommendation: Create database seed script with faker.js, run once during setup for consistent demo data

## Sources

### Primary (HIGH confidence)
- [ShadCN Card Component](https://ui.shadcn.com/docs/components/radix/card) - Component structure, API, examples
- [ShadCN Dialog Component](https://ui.shadcn.com/docs/components/radix/dialog) - Controlled pattern, accessibility features
- [ShadCN Badge Component](https://ui.shadcn.com/docs/components/radix/badge) - Variants, styling, icon integration
- [Next.js 16 Data Fetching](https://nextjs.org/docs/app/getting-starting/fetching-data) - Server Components, parallel queries, caching
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) - When to use each, data passing patterns
- [Carbon Design System - Status Indicators](https://carbondesignsystem.com/patterns/status-indicator-pattern/) - WCAG-compliant patterns, multi-element approach

### Secondary (MEDIUM confidence)
- [useHooks - useLocalStorage](https://usehooks.com/uselocalstorage) - Custom hook pattern, SSR handling
- [usehooks-ts - useLocalStorage](https://usehooks-ts.com/react-hook/use-local-storage) - TypeScript implementation, event syncing
- [Faker.js Documentation](https://github.com/faker-js/faker) - Mock data generation, seeding, locales
- [Appcues - User Onboarding UX Patterns](https://www.appcues.com/blog/user-onboarding-ui-ux-patterns) - Welcome modal best practices
- [UserPilot - Modal UX Design for SaaS](https://userpilot.com/blog/modal-ux-design/) - Modal positioning, timing, dismissal patterns
- [Dashboard Design Principles 2026](https://www.designrush.com/agency/ui-ux-design/dashboard/trends/dashboard-design-principles) - Card layouts, metrics display
- [PatternFly Dashboard Guidelines](https://www.patternfly.org/patterns/dashboard/design-guidelines/) - Card grid patterns, summary metrics

### Tertiary (LOW confidence)
- [Pencil & Paper - Dashboard UX Patterns](https://www.pencilandpaper.io/articles/ux-pattern-analysis-data-dashboards) - Trend cards, utilization patterns
- [Mobbin - Badge UI Design](https://mobbin.com/glossary/badge) - Badge shapes, color patterns
- [SetProduct - Badge UI Design](https://www.setproduct.com/blog/badge-ui-design) - Accessibility considerations

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All ShadCN components verified with official docs, Next.js patterns from v16 documentation
- Architecture: HIGH - Patterns sourced from Next.js official docs, ShadCN examples, Carbon Design System
- Pitfalls: HIGH - Common localStorage/SSR issues well-documented, status badge accessibility from WCAG standards
- UX Patterns: MEDIUM - Welcome modal patterns from UX blogs (Appcues, UserPilot), not official standards

**Research date:** 2026-02-15
**Valid until:** ~2026-03-15 (30 days, stack is stable, UX patterns evolve slowly)

**Notes:**
- ShadCN Card, Dialog, Badge are official components with stable APIs
- localStorage patterns are well-established, useLocalStorage hook pattern is community standard
- Dashboard metrics patterns follow Carbon Design System and WCAG 2.1 accessibility guidelines
- Server Component data fetching is Next.js 16 recommended approach
- faker.js is industry standard for mock data, version-stable
- Welcome modal UX follows 2026 best practices: minimal, contextual, dismissible
