# Technology Stack

**Project:** Vapor - Enterprise ML Platform Dashboard
**Researched:** 2026-02-15
**Confidence:** MEDIUM (based on training data through January 2025, unable to verify with external sources)

## Executive Summary

The prescribed stack (Next.js 14+, TypeScript, TailwindCSS, ShadCN/ui, Recharts) is well-aligned with 2025 enterprise dashboard standards. This stack provides excellent developer experience, component reusability, and type safety. Additional recommendations focus on state management, API integration, and real-time simulation utilities.

**Key validation:** This stack matches what companies like Vercel, Linear, and Cal.com use for production dashboards. For a portfolio project targeting Liquid AI's hiring team, it demonstrates modern React patterns and enterprise-grade architecture.

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Next.js** | 15.x (App Router) | Full-stack React framework | Industry standard for React SPAs in 2025. App Router provides server components, streaming, and optimized data fetching. Next.js 15 includes stable React 19 support and Turbopack improvements. |
| **React** | 19.x | UI library | Comes with Next.js 15. React 19 provides async components, improved hydration, and Actions. |
| **TypeScript** | 5.7+ | Type safety | Strict mode catches errors at compile time. Essential for enterprise dashboards with complex data models. TS 5.7 has improved type inference. |
| **Node.js** | 20.x LTS | Runtime | Next.js requires Node 18.18+. Use Node 20 LTS for stability and long-term support. |

**Rationale:** Next.js 15 is the current stable version as of late 2024/early 2025. The App Router is now production-ready and the recommended approach for new projects. While the project context mentions "Next.js 14+", using 15.x is advisable for the latest optimizations.

**Confidence:** HIGH (Next.js versioning stable, well-documented)

---

### UI Framework & Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **TailwindCSS** | 3.4+ | Utility-first CSS | Rapid prototyping, consistent design system, excellent for dashboard layouts. Small bundle size with JIT compilation. |
| **ShadCN/ui** | Latest (component library) | Accessible React components | Copy-paste components (not npm package) built on Radix UI. Full control over code, excellent accessibility, TypeScript-first. Perfect for enterprise dashboards. |
| **Radix UI** | Latest primitives | Headless UI components | Underlying primitives for ShadCN/ui. Provides accessible dropdowns, dialogs, tooltips. |
| **class-variance-authority** | 0.7+ | Component variants | Powers ShadCN/ui variant system. Type-safe component API with Tailwind. |
| **tailwind-merge** | 2.5+ | Classname utility | Merges Tailwind classes without conflicts. Essential for component composition. |
| **clsx** | 2.1+ | Conditional classnames | Clean syntax for dynamic className logic. |

**Rationale:** ShadCN/ui is the dominant choice for enterprise React dashboards in 2025. Unlike MUI or Ant Design, you own the code and can customize freely. Tailwind + ShadCN is faster than writing custom CSS and more maintainable than CSS-in-JS.

**Confidence:** HIGH (ShadCN/ui widely adopted, Tailwind 3.4 stable)

---

### Data Visualization

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Recharts** | 2.12+ | Charts & graphs | React-first charting library. Composable API, responsive, good TypeScript support. Best for dashboard line/bar/area charts. |
| **@tanstack/react-table** | 8.20+ | Data tables | Modern, headless table library. Sorting, filtering, pagination built-in. Essential for "Deployed Models" view. |

**Alternatives considered:**
- **Chart.js/react-chartjs-2:** More features, but imperative API doesn't fit React patterns
- **Victory:** Good, but heavier bundle size
- **Tremor:** Built on Recharts, but adds opinionated styling that conflicts with custom design

**Recharts rationale:** Declarative JSX API fits Next.js patterns. Sufficient for training metrics (loss curves, accuracy over time). Lighter than D3.js for this use case.

**Confidence:** MEDIUM (Recharts stable, but newer alternatives like Tremor gaining traction)

---

### State Management

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Zustand** | 5.x | Client state management | Lightweight, minimal boilerplate. Perfect for dashboard UI state (selected models, filter states). |
| **React Query (TanStack Query)** | 5.x | Server state management | Caching, background refetching, optimistic updates. Essential for HuggingFace API integration. |

**Why not Redux?**
- Zustand provides 80% of Redux functionality with 20% of the boilerplate
- Redux Toolkit is good, but overkill for a 1-week portfolio project
- Zustand's dev tools are sufficient for debugging

**Why React Query?**
- HuggingFace API calls need caching and error handling
- Automatic background refetching for "real-time" simulation
- Optimistic updates for training job submissions

**Confidence:** HIGH (Both libraries are 2025 standards)

---

### Forms & Validation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **React Hook Form** | 7.53+ | Form state management | Minimal re-renders, excellent TypeScript support. Needed for training config forms. |
| **Zod** | 3.23+ | Schema validation | Type-safe validation. Define schema once, get both runtime validation and TypeScript types. |

**Use case:** Training configuration form has complex validation (model selection, hyperparameters, constraints). React Hook Form + Zod is the 2025 standard for this.

**Confidence:** HIGH (Industry standard combo)

---

### API Integration

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **@huggingface/hub** | 0.15+ | HuggingFace API client | Official TypeScript client for HF API. Type-safe model search and metadata. |
| **Next.js Route Handlers** | (built-in) | API routes | Server-side API calls to HF, mock data endpoints. Keeps API keys secure. |

**Why Route Handlers over external API client?**
- HuggingFace API keys should never touch the client
- Route Handlers provide built-in caching
- Can mix real HF API with mock data seamlessly

**Confidence:** MEDIUM (@huggingface/hub exists, but version may differ)

---

### Real-Time Simulation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **use-interval** | (custom hook) | Periodic state updates | Simple setInterval wrapper for training progress simulation. |
| **framer-motion** | 11.x | Animations | Smooth transitions for metric updates, page transitions. Makes dashboard feel polished. |

**Why not WebSockets?**
- This is mock data, not real training jobs
- setInterval + React Query is simpler for simulation
- Can upgrade to Server-Sent Events later if needed

**Confidence:** MEDIUM (Framer Motion 11.x timing uncertain)

---

### Developer Experience

| Technology | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **ESLint** | 9.x | Linting | Next.js includes config. Add custom rules for imports, unused vars. |
| **Prettier** | 3.x | Code formatting | Consistent code style. Use with eslint-plugin-prettier. |
| **TypeScript ESLint** | 8.x | TS-specific linting | Strict type checking, no-explicit-any enforcement. |
| **Husky** | 9.x | Git hooks | Pre-commit linting and type checking. |
| **lint-staged** | 15.x | Staged file linting | Only lint changed files for faster commits. |

**Confidence:** MEDIUM (version numbers may be off, but tools are standard)

---

### Testing (Optional for 1-week timeline)

| Technology | Version | Purpose | Why |
|---------|---------|---------|-----|
| **Vitest** | 2.x | Unit testing | Faster than Jest, better ESM support. |
| **Testing Library** | 16.x | Component testing | User-centric testing. |
| **Playwright** | 1.48+ | E2E testing | Modern, faster than Cypress. |

**Recommendation for portfolio project:** Skip comprehensive testing given 1-week timeline. Add a few smoke tests for critical flows if time permits.

**Confidence:** LOW (testing may not be needed)

---

### Deployment & Infrastructure

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Vercel** | N/A | Hosting platform | Zero-config Next.js deployment. Free tier sufficient. Automatic HTTPS, global CDN. |
| **Vercel Analytics** | (built-in) | Performance monitoring | Track Core Web Vitals. Shows attention to performance. |
| **Environment Variables** | (Vercel) | Config management | Store HuggingFace API key, feature flags. |

**Why Vercel over alternatives?**
- Next.js is built by Vercel (best integration)
- Deploy preview for every commit
- Edge Functions for Route Handlers
- Free for portfolio projects

**Confidence:** HIGH (Vercel is the standard for Next.js)

---

## Supporting Libraries

### Utilities

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **date-fns** | 4.x | Date formatting | Format training timestamps, time-ago displays. Lighter than Moment.js. |
| **nanoid** | 5.x | ID generation | Generate unique IDs for mock training jobs. |
| **lucide-react** | Latest | Icons | Icon library used by ShadCN/ui. Consistent with component design. |

### Mock Data Generation

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **@faker-js/faker** | 9.x | Realistic mock data | Generate fake model metadata, user names, deployment stats. |
| **msw** | 2.x | API mocking | Mock HuggingFace API responses during development. Optional but useful. |

**Confidence:** MEDIUM (specific versions uncertain)

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| **Framework** | Next.js 15 | Remix, Vite+React | Next.js has better static export, Vercel integration. Remix is great but overkill. |
| **UI Components** | ShadCN/ui | MUI, Ant Design, Chakra | ShadCN gives full control, better for portfolio. MUI feels dated. Chakra v3 in beta. |
| **Charts** | Recharts | Chart.js, Victory, Visx | Recharts balances simplicity and power. Visx is too low-level. |
| **State** | Zustand | Redux Toolkit, Jotai | Zustand is simpler. Redux is enterprise standard but heavy. Jotai is interesting but less proven. |
| **Styling** | Tailwind | CSS Modules, Styled Components | Tailwind is faster. CSS-in-JS has runtime cost. CSS Modules lack composability. |
| **Forms** | React Hook Form | Formik, TanStack Form | RHF is the 2025 standard. Formik maintenance slowed. TanStack Form too new. |
| **Validation** | Zod | Yup, Joi | Zod has better TS integration. Yup is older standard. Joi is backend-focused. |

---

## Installation

### Core Setup

```bash
# Create Next.js app with TypeScript, Tailwind, App Router
npx create-next-app@latest vapor-liquid-ai-dash --typescript --tailwind --app --no-src-dir --import-alias "@/*"

cd vapor-liquid-ai-dash

# Next.js 15 comes with React 19 and Tailwind 3.4 pre-configured
```

### UI Components

```bash
# Initialize ShadCN/ui (interactive - choose defaults)
npx shadcn@latest init

# Install components needed for dashboard
npx shadcn@latest add button card input select dialog dropdown-menu table tabs badge avatar separator skeleton
```

### Core Dependencies

```bash
npm install @tanstack/react-query recharts zustand react-hook-form zod @hookform/resolvers
npm install @huggingface/hub
npm install framer-motion
npm install date-fns nanoid
```

### Dev Dependencies

```bash
npm install -D @types/node @types/react @types/react-dom
npm install -D eslint-config-prettier prettier
npm install -D @faker-js/faker
npm install -D husky lint-staged
```

### Optional (if adding testing)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test
```

---

## Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "type-check": "tsc --noEmit",
    "prepare": "husky install"
  }
}
```

---

## Configuration Notes

### TypeScript Strict Mode

```json
// tsconfig.json - ensure these are enabled
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Tailwind Configuration

```js
// tailwind.config.ts - ensure dark mode
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // ShadCN/ui adds custom colors here
    },
  },
}
```

### Environment Variables

```bash
# .env.local
HUGGINGFACE_API_KEY=your_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Confidence Assessment

| Component | Confidence | Notes |
|-----------|------------|-------|
| Next.js 15 | HIGH | Stable release, well-documented |
| React 19 | HIGH | Shipped with Next.js 15 |
| TypeScript 5.7 | HIGH | Current stable version |
| TailwindCSS | HIGH | Version 3.4+ stable |
| ShadCN/ui | HIGH | Widely adopted, active development |
| Recharts | MEDIUM | Stable but alternatives emerging |
| Zustand | HIGH | Industry standard for lightweight state |
| React Query | HIGH | De facto server state library |
| React Hook Form | HIGH | Form standard in 2025 |
| Zod | HIGH | Validation standard |
| @huggingface/hub | LOW | Exists but version uncertain, may need verification |
| Framer Motion | MEDIUM | Stable but version number uncertain |
| Deployment tools | MEDIUM | Versions estimated based on training data |

**Overall Confidence:** MEDIUM-HIGH

Stack is solid and represents 2025 best practices. Main uncertainty is in specific version numbers for supporting libraries. Core framework choices (Next.js, React, TypeScript, Tailwind, ShadCN) are high confidence.

---

## Stack Anti-Patterns to Avoid

### Don't Mix Styling Paradigms
**Bad:** Using Tailwind + Styled Components + CSS Modules
**Why:** Inconsistent, confusing, larger bundle
**Do:** Stick to Tailwind + ShadCN's approach

### Don't Over-Abstract Components
**Bad:** Creating 10 wrapper components for every ShadCN component
**Why:** Premature abstraction for a 1-week project
**Do:** Use ShadCN components directly, abstract only if used 3+ times

### Don't Mix State Management Paradigms
**Bad:** Using Zustand + Redux + Context API all at once
**Why:** Confusing state sources, hard to debug
**Do:** Zustand for client state, React Query for server state, Context for theme only

### Don't Over-Fetch Data
**Bad:** Fetching entire HuggingFace model list on every search keystroke
**Why:** Rate limits, slow UX
**Do:** Debounce search, use React Query caching

### Don't Skip TypeScript Strictness
**Bad:** Using `any` types to move faster
**Why:** Defeats purpose of TypeScript, will bite you later
**Do:** Use `unknown` and narrow types, invest in type safety upfront

---

## Project-Specific Recommendations

### For "Vapor" ML Dashboard

**Priority 1: Component Architecture**
- Create layout components first (DashboardLayout, SideNav, TopNav)
- Build page skeletons with mock data
- Add real HF API integration last

**Priority 2: Type Safety**
- Define types for: Model metadata, Training config, Training job, Deployment
- Use Zod schemas for runtime validation
- Generate TypeScript types from Zod schemas

**Priority 3: Visual Polish**
- Framer Motion for page transitions
- Skeleton loaders during data fetch
- Empty states for all views
- Responsive design (test mobile even if primarily desktop)

**Priority 4: Brand Alignment**
- Extract Liquid AI colors from website/branding
- Define in Tailwind config as custom colors
- Use consistently across dashboard

**Libraries to Add Later (if time permits):**
- `react-hot-toast` for notifications (training started/completed)
- `cmdk` for command palette (nice-to-have for portfolio impact)
- `sonner` alternative toast library (lighter than react-hot-toast)

---

## Sources

**Note:** Unable to verify with external sources due to tool restrictions. This stack is based on:

1. **Training data through January 2025:** Industry trends, framework adoption, library maturity
2. **Project requirements:** Next.js 14+ prescribed, 1-week timeline, portfolio focus
3. **Enterprise dashboard patterns:** Common patterns from Linear, Vercel, Retool-style tools

**Verification needed:**
- Exact version numbers for all libraries (check npm/official docs)
- @huggingface/hub API and capabilities
- Next.js 15 stable release status (may still be 14.x in early 2025)
- Recharts current version and feature set

**Recommended validation steps:**
1. Check `npm view next version` for current Next.js version
2. Verify ShadCN/ui installation process hasn't changed
3. Test @huggingface/hub library or use direct API calls if package unavailable
4. Confirm Recharts supports needed chart types (line, area, bar)

---

## Summary

**Prescribed stack is solid.** Next.js 15 + TypeScript + Tailwind + ShadCN/ui + Recharts represents 2025 best practices for enterprise dashboards.

**Key additions:**
- **State:** Zustand + React Query
- **Forms:** React Hook Form + Zod
- **Data tables:** TanStack Table
- **Animation:** Framer Motion
- **Utils:** date-fns, nanoid, lucide-react

**Confidence:** MEDIUM-HIGH on approach, MEDIUM on specific versions (unable to verify with external sources).

**Next steps:** Validate exact versions with npm/official docs when setting up project.
