# Phase 1: Foundation & Database - Research

**Researched:** 2026-02-15
**Domain:** Next.js 16 App Router, ShadCN/ui theming, Neon Postgres integration, Vercel deployment
**Confidence:** HIGH

## Summary

Phase 1 establishes the technical foundation for Vapor: a Next.js 16 application with custom Liquid AI theming, responsive sidebar navigation, dark mode support, and Neon Postgres database integration deployed to Vercel. The stack is current and stable as of February 2026.

**Next.js 16** (released October 2025) is production-ready with Turbopack as the default bundler, React 19.2 support, and breaking changes to async request APIs that require all dynamic APIs (cookies, headers, params) to be awaited. The App Router pattern is mature and well-documented.

**ShadCN/ui** provides a component library built on Radix UI primitives with full theming support via CSS variables. Custom color palettes for light/dark modes are straightforward to implement. The official sidebar component is composable and supports collapsible, responsive layouts.

**Neon Postgres** integrates with Next.js via the `@neondatabase/serverless` driver, which works in edge/serverless environments using HTTPS/WebSocket instead of TCP. Connection strings are set via environment variables. Database migrations are typically handled with Drizzle ORM or Prisma.

**Vercel deployment** is streamlined for Next.js 16 with automatic GitHub integration. Environment variables must follow the `NEXT_PUBLIC_` prefix pattern for client-side access. Database connections use separate pooled (app runtime) and direct (migrations) connection strings.

**Primary recommendation:** Use Next.js 16 with Turbopack (default), ShadCN/ui sidebar component, next-themes for dark mode, Neon serverless driver for database, and deploy to Vercel with environment variables configured in dashboard.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6+ | App framework with App Router | Latest stable, Turbopack by default, React 19.2 support |
| React | 19.2+ | UI framework | Required by Next.js 16, includes View Transitions and useEffectEvent |
| TypeScript | 5.1.0+ | Type safety | Required minimum for Next.js 16 |
| Tailwind CSS | 4.x | Utility-first CSS | ShadCN/ui requirement, v4 is latest |
| ShadCN/ui | 2.3.0+ (Tailwind v4) | Component library | Radix-based, themeable, official sidebar component |
| @neondatabase/serverless | Latest | Postgres driver | Low-latency, serverless-optimized, WebSocket/HTTPS transport |
| next-themes | Latest | Theme management | Seamless dark mode, localStorage persistence, no flash |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Drizzle ORM | Latest | Database schema + migrations | Type-safe queries, better DX than raw SQL |
| Zod | Latest | Schema validation | Form validation, environment variable validation |
| clsx / tailwind-merge | Latest | Conditional classnames | ShadCN/ui pattern for component variants |
| Lucide React | Latest | Icon library | ShadCN/ui default, consistent with ecosystem |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| ShadCN/ui | Headless UI, Radix directly | ShadCN provides pre-styled components, faster setup |
| next-themes | Custom hook with localStorage | next-themes handles SSR/hydration, system preference detection |
| Neon | Supabase, PlanetScale | Neon has better serverless performance, database branching for previews |
| Drizzle ORM | Prisma, raw SQL | Drizzle lighter weight, Prisma has better migrations UI |

**Installation:**
```bash
# Create Next.js 16 app with TypeScript and Tailwind
npx create-next-app@latest vapor-liquid-ai-dash --typescript --tailwind --app --no-src

# Install ShadCN/ui
npx shadcn@latest init

# Add sidebar component
npx shadcn@latest add sidebar

# Install dark mode support
npm install next-themes

# Install Neon database driver
npm install @neondatabase/serverless

# Install Drizzle ORM (optional but recommended)
npm install drizzle-orm drizzle-kit
npm install -D @types/node

# Install utilities
npm install zod clsx tailwind-merge lucide-react
```

## Architecture Patterns

### Recommended Project Structure
```
vapor-liquid-ai-dash/
├── app/                         # Next.js App Router
│   ├── (dashboard)/             # Route group for dashboard layout
│   │   ├── layout.tsx           # Sidebar layout wrapper
│   │   ├── page.tsx             # Dashboard home
│   │   ├── training/            # Training config page
│   │   └── deployments/         # Deployments page
│   ├── layout.tsx               # Root layout (theme provider)
│   ├── globals.css              # Tailwind + theme CSS variables
│   └── providers.tsx            # Client-side providers (ThemeProvider)
├── components/
│   ├── ui/                      # ShadCN/ui components
│   ├── sidebar/                 # Custom sidebar navigation
│   └── theme-toggle.tsx         # Dark mode toggle button
├── lib/
│   ├── db/
│   │   ├── schema.ts            # Drizzle schema definitions
│   │   ├── client.ts            # Database connection
│   │   └── migrations/          # SQL migration files
│   ├── utils.ts                 # cn() helper, utilities
│   └── env.ts                   # Environment variable validation (Zod)
├── drizzle.config.ts            # Drizzle Kit configuration
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind + theme colors
├── tsconfig.json                # TypeScript config
└── .env.local                   # Local environment variables
```

### Pattern 1: ShadCN/ui Sidebar Navigation
**What:** Composable sidebar with collapsible sections, routing, and responsive behavior
**When to use:** Multi-page dashboard with primary navigation
**Example:**
```typescript
// app/(dashboard)/layout.tsx
import { SidebarProvider, Sidebar, SidebarContent } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar/app-sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  )
}

// components/sidebar/app-sidebar.tsx
import { Home, Settings, Database } from "lucide-react"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"

const items = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Training", url: "/training", icon: Settings },
  { title: "Deployments", url: "/deployments", icon: Database },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
```

### Pattern 2: Custom Theme with Dark Mode
**What:** Define custom color palette via CSS variables, toggle with next-themes
**When to use:** Every ShadCN/ui project requiring custom branding
**Example:**
```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Liquid AI inspired palette - adjust based on actual brand colors */
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;
    --primary: 221 83% 53%;        /* Blue accent */
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222 47% 11%;
    --accent: 210 40% 96%;
    --accent-foreground: 222 47% 11%;
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;
    --border: 214 32% 91%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222 47% 11%;
    --foreground: 210 40% 98%;
    --primary: 217 91% 60%;
    --primary-foreground: 222 47% 11%;
    --secondary: 217 33% 17%;
    --secondary-foreground: 210 40% 98%;
    --accent: 217 33% 17%;
    --accent-foreground: 210 40% 98%;
    --muted: 217 33% 17%;
    --muted-foreground: 215 20% 65%;
    --border: 217 33% 17%;
  }
}
```

```typescript
// app/providers.tsx
'use client'
import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  )
}

// app/layout.tsx
import { Providers } from './providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

// components/theme-toggle.tsx
'use client'
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
```

### Pattern 3: Neon Database Connection with Environment Variables
**What:** Configure Neon connection using serverless driver with environment variable validation
**When to use:** All database operations in Next.js serverless/edge environments
**Example:**
```typescript
// lib/env.ts (environment variable validation)
import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
})

export const env = envSchema.parse(process.env)

// lib/db/client.ts
import { neon } from '@neondatabase/serverless'
import { env } from '@/lib/env'

export const sql = neon(env.DATABASE_URL)

// Usage in Server Component
async function getTrainingJobs() {
  const jobs = await sql`SELECT * FROM training_jobs ORDER BY created_at DESC LIMIT 10`
  return jobs
}
```

```typescript
// With Drizzle ORM (recommended)
// lib/db/schema.ts
import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'

export const trainingJobs = pgTable('training_jobs', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// lib/db/client.ts
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { env } from '@/lib/env'
import * as schema from './schema'

const sql = neon(env.DATABASE_URL)
export const db = drizzle(sql, { schema })

// drizzle.config.ts
import type { Config } from 'drizzle-kit'
import { env } from './lib/env'

export default {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
} satisfies Config
```

### Pattern 4: Async Request APIs in Next.js 16
**What:** All dynamic APIs (params, searchParams, cookies, headers) must be awaited
**When to use:** All Server Components and Route Handlers using dynamic data
**Example:**
```typescript
// app/(dashboard)/training/[id]/page.tsx
import { cookies, headers } from 'next/headers'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TrainingPage({ params, searchParams }: Props) {
  // MUST await params in Next.js 16
  const { id } = await params
  const query = await searchParams

  // MUST await cookies/headers
  const cookieStore = await cookies()
  const headersList = await headers()

  // Now use the values
  const job = await getTrainingJob(id)

  return <div>{job.name}</div>
}
```

### Anti-Patterns to Avoid
- **Synchronous dynamic API access:** Next.js 16 fully removes synchronous access to cookies/headers/params. Always await.
- **NEXT_PUBLIC_ for secrets:** Never expose API keys or database URLs to client. Only use prefix for truly public values.
- **Custom dark mode without next-themes:** Handling SSR/hydration and system preference detection is error-prone. Use next-themes.
- **TCP-based Postgres drivers in serverless:** Use `@neondatabase/serverless`, not `pg` or `postgres` packages.
- **Hardcoded colors instead of CSS variables:** ShadCN theming depends on CSS variables. Define colors in globals.css, not Tailwind config.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dark mode toggle | Custom localStorage + class toggling | next-themes | Handles SSR hydration, system preference detection, tab syncing, no flash of unstyled content |
| Sidebar navigation | Custom responsive drawer | ShadCN/ui Sidebar | Handles collapsible state, mobile overlay, keyboard navigation, accessibility |
| Database connection pooling | Custom connection manager | Neon serverless driver | Built-in connection pooling, optimized for serverless cold starts |
| Form validation | Manual error state management | Zod + React Hook Form | Type-safe schemas, runtime validation, better error messages |
| CSS variable theming | Manual theme switching logic | ShadCN/ui theming system | Pre-configured color tokens, dark mode variants, consistent component styling |
| Environment variable validation | Runtime checks in code | Zod schema validation | Type safety, fail-fast on startup, clear error messages |

**Key insight:** Next.js 16 + ShadCN/ui ecosystem has mature solutions for common patterns. Building custom solutions adds maintenance burden and misses edge cases (hydration issues, accessibility, mobile responsiveness).

## Common Pitfalls

### Pitfall 1: Forgetting to Await Dynamic APIs
**What goes wrong:** Runtime errors in Next.js 16 when accessing params/searchParams/cookies synchronously
**Why it happens:** Next.js 15 had temporary backward compatibility; Next.js 16 fully removes it
**How to avoid:**
- Always await params, searchParams, cookies(), headers(), draftMode()
- Use TypeScript types: `params: Promise<{ id: string }>`
- Run `npx @next/codemod@canary upgrade latest` to auto-migrate
**Warning signs:** TypeScript errors about accessing properties on Promise, runtime errors in production

### Pitfall 2: Exposing Secrets via NEXT_PUBLIC_ Prefix
**What goes wrong:** Database URLs, API keys visible in client-side JavaScript bundle
**Why it happens:** Misunderstanding when to use NEXT_PUBLIC_ prefix
**How to avoid:**
- Server-only variables: NO prefix (e.g., `DATABASE_URL`)
- Client-accessible variables: `NEXT_PUBLIC_` prefix (e.g., `NEXT_PUBLIC_APP_URL`)
- Validate environment variables with Zod on app startup
- Use Vercel dashboard to set production environment variables
**Warning signs:** Secrets visible in browser DevTools Network tab, build output warnings

### Pitfall 3: Dark Mode Hydration Flash
**What goes wrong:** Brief flash of light mode before dark mode applies on page load
**Why it happens:** Theme state not synchronized between server and client
**How to avoid:**
- Use `suppressHydrationWarning` on html element
- Set `attribute="class"` in ThemeProvider for Tailwind
- Use `defaultTheme="system"` and `enableSystem` for OS preference detection
- Ensure ThemeProvider wraps entire app in root layout
**Warning signs:** Visible theme flicker on page load, console warnings about hydration mismatch

### Pitfall 4: Incorrect Neon Connection String for Migrations
**What goes wrong:** Migrations fail with timeout errors or permission denied
**Why it happens:** Using pooled connection string for migrations instead of direct connection
**How to avoid:**
- Pooled connection (app runtime): `DATABASE_URL` with `-pooler` suffix
- Direct connection (migrations): `DATABASE_URL_UNPOOLED` without pooler
- Configure Drizzle Kit to use unpooled connection
- Check Neon dashboard for correct connection strings
**Warning signs:** Migration commands hang or timeout, "prepared statement already exists" errors

### Pitfall 5: Turbopack vs Webpack Configuration Conflicts
**What goes wrong:** Build fails with "webpack configuration found" error
**Why it happens:** Next.js 16 uses Turbopack by default, but custom webpack config exists
**How to avoid:**
- Remove custom webpack config if not needed
- Use `--webpack` flag if you must keep webpack
- Migrate webpack loaders to Turbopack equivalents
- Check plugins for hidden webpack configurations
**Warning signs:** Build failures on Next.js 16 upgrade, warnings about webpack config

### Pitfall 6: Missing Dark Mode Color Definitions
**What goes wrong:** Some UI elements don't change color in dark mode, jarring visual inconsistencies
**Why it happens:** Forgot to define dark mode variants for custom colors
**How to avoid:**
- Always define both `:root` and `.dark` variants for every custom color
- Test dark mode immediately after adding new colors
- Use Tailwind `dark:` prefix for component-specific overrides
- Validate theme in both light and dark modes before committing
**Warning signs:** Components with unchanged colors in dark mode, contrast accessibility issues

## Code Examples

Verified patterns from official sources:

### Next.js 16 Project Initialization
```bash
# Create new Next.js 16 app (latest stable)
# Source: https://nextjs.org/docs/app/getting-started
npx create-next-app@latest vapor-liquid-ai-dash

# Prompts:
# ✓ Use TypeScript? Yes
# ✓ Use ESLint? Yes
# ✓ Use Tailwind CSS? Yes
# ✓ Use `src/` directory? No
# ✓ Use App Router? Yes
# ✓ Customize import alias? No (@/* default)

cd vapor-liquid-ai-dash
```

### ShadCN/ui Setup with Custom Theme
```bash
# Initialize ShadCN/ui
# Source: https://ui.shadcn.com/docs/installation/next
npx shadcn@latest init

# Prompts:
# ✓ Style: Default
# ✓ Base color: Slate (customize in globals.css later)
# ✓ CSS variables: Yes

# Add sidebar component
npx shadcn@latest add sidebar

# Add other common components
npx shadcn@latest add button card badge
```

### Vercel Deployment with Environment Variables
```bash
# Install Vercel CLI (optional, for local preview)
npm i -g vercel

# Deploy to Vercel (automatic with GitHub integration)
# 1. Push to GitHub
git add .
git commit -m "feat: initial Next.js 16 setup"
git push origin main

# 2. Import project in Vercel dashboard
# 3. Add environment variables in Vercel dashboard:
#    - DATABASE_URL (Neon connection string)
#    - NODE_ENV=production (auto-set by Vercel)

# Environment variable structure:
# .env.local (local development, NOT committed)
DATABASE_URL="postgresql://user:pass@host.neon.tech/db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Vercel dashboard (production)
# DATABASE_URL: Use Neon integration or manual string
# NEXT_PUBLIC_APP_URL: Auto-set by Vercel
```

### Database Schema Example with Drizzle
```typescript
// lib/db/schema.ts
// Source: https://orm.drizzle.team/docs/tutorials/drizzle-nextjs-neon
import { pgTable, serial, text, timestamp, varchar, integer } from 'drizzle-orm/pg-core'

export const trainingJobs = pgTable('training_jobs', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  status: text('status', { enum: ['queued', 'running', 'complete', 'failed'] }).notNull(),
  modelName: varchar('model_name', { length: 255 }).notNull(),
  epochs: integer('epochs').notNull(),
  learningRate: varchar('learning_rate', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Run migration
// npm run drizzle-kit push (development)
// npm run drizzle-kit generate && npm run drizzle-kit migrate (production)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Webpack bundler | Turbopack bundler | Next.js 16 (Oct 2025) | 2-5x faster builds, development server starts in <1s |
| Synchronous dynamic APIs | Async dynamic APIs | Next.js 16 (breaking) | Must await params, searchParams, cookies, headers |
| Pages Router | App Router | Next.js 13+ | Server Components, streaming, better layouts |
| Manual theme switching | next-themes library | Community standard 2023+ | No hydration flash, system preference support |
| TCP Postgres drivers | Serverless drivers | Serverless era 2024+ | Works in edge/serverless, lower latency |
| Component libraries (MUI, Ant) | Headless + ShadCN/ui | 2024+ | Smaller bundles, full design control |
| React 18 | React 19.2 | Next.js 16 default | View Transitions, useEffectEvent, better Suspense |

**Deprecated/outdated:**
- **middleware.ts filename**: Renamed to `proxy.ts` in Next.js 16 (edge runtime not supported in proxy)
- **experimental.dynamicIO flag**: Renamed to `cacheComponents` in Next.js 16
- **experimental.ppr flag**: Removed, use `cacheComponents` instead
- **next lint command**: Removed in Next.js 16, use ESLint CLI directly
- **images.domains config**: Deprecated, use `images.remotePatterns` for security
- **next/legacy/image**: Deprecated, use `next/image` directly

## Open Questions

1. **Liquid AI Brand Colors**
   - What we know: Liquid AI is a real company with Liquid Foundation Models (LFMs), but no official brand guidelines found in public search
   - What's unclear: Exact hex codes for primary/secondary/accent colors, logo usage guidelines
   - Recommendation: Visit https://www.liquid.ai/ and extract colors from website using browser DevTools, or use generic blue/purple palette inspired by AI/ML aesthetic (blues suggest trust/tech, purples suggest innovation)

2. **Database Branching for Vercel Previews**
   - What we know: Neon supports database branching for preview environments, Vercel auto-creates preview deployments
   - What's unclear: Whether Vapor needs this complexity for v1 (single developer, 1-week timeline)
   - Recommendation: Use single production database for v1, add branching in v2 if needed (YAGNI principle)

3. **Migration Strategy**
   - What we know: Drizzle Kit can push schemas directly (dev) or generate SQL migrations (prod)
   - What's unclear: Whether to use Drizzle push vs migrations for rapid iteration phase
   - Recommendation: Use `drizzle-kit push` in v1 for speed, switch to proper migrations if schema stabilizes

## Sources

### Primary (HIGH confidence)
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16) - Breaking changes, async APIs, Turbopack defaults
- [Next.js 16 Release Notes](https://nextjs.org/blog/next-16) - Features, performance benchmarks, React 19.2
- [ShadCN/ui Installation for Next.js](https://ui.shadcn.com/docs/installation/next) - Setup steps, theming
- [ShadCN/ui Sidebar Component](https://ui.shadcn.com/docs/components/radix/sidebar) - Component API, examples
- [ShadCN/ui Dark Mode for Next.js](https://ui.shadcn.com/docs/dark-mode/next) - next-themes integration
- [Neon Next.js Integration Guide](https://neon.com/docs/guides/nextjs) - Connection patterns, Server Components vs Server Actions
- [Neon Serverless Driver](https://neon.com/docs/serverless/serverless-driver) - Package usage, WebSocket configuration
- [Drizzle ORM with Neon Tutorial](https://orm.drizzle.team/docs/tutorials/drizzle-nextjs-neon) - Schema definition, migrations

### Secondary (MEDIUM confidence)
- [Vercel Environment Variables Docs](https://vercel.com/docs/environment-variables) - NEXT_PUBLIC_ pattern, system variables
- [Complete Guide to Deploying Next.js on Vercel](https://eastondev.com/blog/en/posts/dev/20251220-nextjs-vercel-deploy-guide/) - Environment variable best practices
- [Common Mistakes with Next.js App Router](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them) - Pitfalls and solutions
- [Next.js 16 Complete Guide (CodeLynx)](https://codelynx.dev/posts/nextjs-16-complete-guide) - Breaking changes overview
- [App Router Pitfalls (Imidef)](https://imidef.com/en/2026-02-11-app-router-pitfalls) - Recent pitfall analysis (Feb 2026)

### Tertiary (LOW confidence)
- [Liquid AI Website](https://www.liquid.ai/) - Company info (colors require manual extraction)
- [shadcn/ui Sidebar Template Examples](https://ui.shadcn.com/blocks/sidebar) - Pre-built patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All packages verified with official docs, versions confirmed current as of Feb 2026
- Architecture: HIGH - Patterns sourced from official Next.js, ShadCN/ui, Neon documentation
- Pitfalls: HIGH - Verified with Next.js 16 upgrade guide, Vercel blog, recent community posts

**Research date:** 2026-02-15
**Valid until:** ~2026-03-15 (30 days, stack is stable but Next.js releases frequently)

**Notes:**
- Next.js 16 is cutting-edge (released Oct 2025), async API changes require careful migration
- Turbopack is production-ready and significantly faster than Webpack
- Neon + Vercel integration is mature and well-documented
- ShadCN/ui sidebar component is official and actively maintained
- Liquid AI brand colors require manual extraction from website (not in public docs)
