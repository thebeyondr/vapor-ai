# Phase 3: Model Discovery - Research

**Researched:** 2026-02-15
**Domain:** HuggingFace API integration, model search/display, AI model recommendations
**Confidence:** HIGH

## Summary

Phase 3 requires integrating HuggingFace Hub API to enable model discovery, implementing debounced search with graceful fallback, displaying curated Liquid AI LFM models, and providing natural language model recommendations. The research confirms that `@huggingface/hub` is the official, actively maintained library for Hub API integration with full TypeScript support. For search patterns, Next.js 16's App Router with `use-debounce` library provides the standard implementation. Natural language recommendations can be achieved via Server Actions calling HuggingFace Inference API or client-side transformers.js for privacy-first solutions.

**Primary recommendation:** Use `@huggingface/hub` for Hub API integration, `use-debounce` for search debouncing, Next.js 16 `use cache` directive for fallback caching, and Server Actions with `@huggingface/inference` for model recommendations.

**Key findings:**
- `@huggingface/hub` provides `listModels()` with powerful filtering (author, tags, pipeline_tag, etc.)
- HuggingFace Hub API has rate limits; free tier shows limits in billing dashboard
- Liquid AI's LFM models are actively maintained on HuggingFace with clear modality groupings
- Next.js 16 deprecates `unstable_cache` in favor of `use cache` directive
- Server/Client component boundaries critical for search input vs results display

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@huggingface/hub` | Latest | Hub API interaction (list/search models) | Official HuggingFace library, TypeScript support, actively maintained |
| `use-debounce` | Latest | Debounce search input | SSR-compatible, React 19-ready, widely adopted pattern |
| Next.js 16 cache | Built-in | API response caching & fallback | Native framework feature replacing `unstable_cache` |
| `@huggingface/inference` | Latest | AI inference for recommendations | Official library, supports all HuggingFace models |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@huggingface/transformers` | Latest (v4+) | Client-side NLP (optional) | If privacy-first recommendations needed |
| `zod` | 4.3.6 (installed) | API response validation | Already in project for validation |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@huggingface/hub` | Direct REST API | More control but lose TypeScript types, error handling, and retry logic |
| Server Actions | API routes | Server Actions provide better DX, automatic type safety, and colocation |
| `use-debounce` | Custom debounce hook | Library is battle-tested and handles edge cases (SSR, cleanup) |

**Installation:**
```bash
pnpm add @huggingface/hub @huggingface/inference use-debounce
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── (dashboard)/
│   ├── training/
│   │   ├── page.tsx                    # Server Component wrapper
│   │   ├── components/
│   │   │   ├── model-search.tsx        # Client Component (search input)
│   │   │   ├── model-grid.tsx          # Server Component (results display)
│   │   │   ├── model-card.tsx          # Server Component
│   │   │   ├── liquid-lfm-section.tsx  # Server Component (curated models)
│   │   │   └── ai-recommender.tsx      # Client Component (natural language input)
│   │   └── actions.ts                  # Server Actions (search, recommend)
│   └── api/
│       └── models/
│           └── route.ts                # Optional: only if client-side fetch needed
lib/
├── huggingface/
│   ├── client.ts                       # HuggingFace Hub client setup
│   ├── search.ts                       # Model search logic with caching
│   ├── liquid-lfm.ts                   # Curated Liquid AI model data
│   └── types.ts                        # TypeScript types for models
└── utils/
    └── cache.ts                        # Cache helpers with fallback logic
```

### Pattern 1: Debounced Search with Server Actions
**What:** Client Component captures input, debounces it, calls Server Action to query HuggingFace
**When to use:** Always for search functionality - provides best UX and performance

**Example:**
```typescript
// app/(dashboard)/training/components/model-search.tsx
"use client";

import { useDebouncedCallback } from "use-debounce";
import { useTransition } from "react";
import { searchModels } from "../actions";

export function ModelSearch() {
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState([]);

  const handleSearch = useDebouncedCallback(async (query: string) => {
    startTransition(async () => {
      const models = await searchModels(query);
      setResults(models);
    });
  }, 300);

  return (
    <div>
      <input
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search models..."
      />
      {isPending && <span>Searching...</span>}
      {/* Results display */}
    </div>
  );
}
```

### Pattern 2: Cached HuggingFace API Calls
**What:** Use Next.js 16 `use cache` directive to cache API responses with revalidation
**When to use:** All HuggingFace API calls to reduce rate limit hits and improve performance

**Example:**
```typescript
// lib/huggingface/search.ts
"use cache";
import { listModels } from "@huggingface/hub";
import { cacheTag } from "next/cache";

export async function searchHuggingFaceModels(query: string) {
  "use cache";
  cacheTag("hf-models");

  try {
    const models = [];
    for await (const model of listModels({
      search: { query },
      limit: 20,
    })) {
      models.push(model);
    }
    return { success: true, data: models };
  } catch (error) {
    console.error("HuggingFace API error:", error);
    return { success: false, data: [], error: "API unavailable" };
  }
}
```

### Pattern 3: Graceful Fallback Architecture
**What:** Try HuggingFace API first, fall back to cached/static data on error
**When to use:** All external API calls to ensure resilience

**Example:**
```typescript
// lib/huggingface/client.ts
import { listModels } from "@huggingface/hub";
import { LIQUID_LFM_FALLBACK } from "./liquid-lfm";

export async function getLiquidModels() {
  try {
    const models = [];
    for await (const model of listModels({
      search: { owner: "LiquidAI" },
      limit: 50,
    })) {
      models.push(model);
    }
    return models.length > 0 ? models : LIQUID_LFM_FALLBACK;
  } catch (error) {
    console.warn("Falling back to static Liquid AI models");
    return LIQUID_LFM_FALLBACK;
  }
}
```

### Pattern 4: Server Component for Display, Client Component for Input
**What:** Split search input (client) from results display (server) at component boundary
**When to use:** Search interfaces - maximizes server-side rendering while enabling interactivity

**Example:**
```typescript
// app/(dashboard)/training/page.tsx (Server Component)
import { ModelSearch } from "./components/model-search";
import { LiquidLFMSection } from "./components/liquid-lfm-section";

export default async function TrainingPage() {
  // Server-rendered curated models
  const liquidModels = await getLiquidModels();

  return (
    <div>
      <h1>Model Discovery</h1>
      <LiquidLFMSection models={liquidModels} />
      <ModelSearch /> {/* Client Component boundary */}
    </div>
  );
}
```

### Anti-Patterns to Avoid

- **Marking entire page as Client Component:** Only mark interactive parts (`"use client"` on search input, not page)
- **No debouncing on search:** Every keystroke = API call = rate limit + poor UX
- **Hard-coding API tokens in client code:** Use Server Actions/API routes to keep tokens secret
- **No error boundaries around API calls:** Always handle 429 (rate limit) and network errors
- **Updating URL on every debounced change:** Causes browser history clutter; use `replace: true` with `useRouter`

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Debouncing | Custom setTimeout/clearTimeout | `use-debounce` | Handles cleanup, SSR, React 19 transitions, maxWait, leading/trailing |
| HuggingFace API client | Fetch wrapper | `@huggingface/hub` | Rate limit handling, pagination, TypeScript types, retry logic |
| Model filtering/search | Client-side filtering | HuggingFace API params | API supports powerful filters (author, tags, pipeline_tag) - more accurate than client filtering |
| Cache management | Manual localStorage/state | Next.js `use cache` | Automatic revalidation, stale-while-revalidate, server-side, tag-based purging |
| Natural language parsing | Regex/keyword matching | LLM inference via `@huggingface/inference` | LLMs understand intent better than keyword matching |

**Key insight:** HuggingFace ecosystem has mature tooling - custom solutions lose TypeScript safety, error handling, and battle-tested edge case handling.

## Common Pitfalls

### Pitfall 1: Rate Limiting Without Fallback
**What goes wrong:** App breaks when free tier rate limit hit (429 errors)
**Why it happens:** No caching strategy, no fallback data, aggressive polling
**How to avoid:**
  - Use Next.js `use cache` with `revalidate` time (e.g., 300 seconds)
  - Implement exponential backoff on 429 responses
  - Always have static fallback data for critical models (Liquid LFMs)
  - Monitor rate limit headers (`X-RateLimit-Remaining`)
**Warning signs:** Console shows repeated 429 errors, users report blank search results

### Pitfall 2: CORS Errors with HuggingFace API
**What goes wrong:** Browser blocks requests to HuggingFace endpoints
**Why it happens:** Calling API directly from client-side code (no CORS headers for your domain)
**How to avoid:**
  - Always use Server Actions or API routes for HuggingFace calls
  - Never put access tokens in client code
  - Use `@huggingface/hub` on server only
**Warning signs:** "CORS policy: No 'Access-Control-Allow-Origin' header" in browser console

### Pitfall 3: Race Conditions with Debounced Search
**What goes wrong:** Old search results display after newer ones (user types "react", then "vue", sees React results)
**Why it happens:** API responses arrive out of order
**How to avoid:**
  - Use `useTransition` from React 19 to handle async state
  - Track request ID and discard stale responses
  - `use-debounce` with `leading: false` prevents premature requests
**Warning signs:** Search results sometimes show wrong query's data, flickering results

### Pitfall 4: Mixing Server and Client Component Boundaries Incorrectly
**What goes wrong:** "You're importing a component that needs X, but it only works in a Client Component"
**Why it happens:** Using `useState` in Server Component, or calling Server Action directly in Server Component
**How to avoid:**
  - Search input = Client Component (`onChange`, `useState`)
  - Results display = Server Component (better performance, SEO)
  - Use Server Actions as bridge between client input and server data
**Warning signs:** Build errors about hooks in Server Components, unexpected re-renders

### Pitfall 5: No Loading States for Async Operations
**What goes wrong:** Users see blank screen or stale data while search executes
**Why it happens:** Not tracking `isPending` state from `useTransition`
**How to avoid:**
  - Always use `useTransition` for async Server Actions
  - Show skeleton loaders or spinners during `isPending`
  - Disable input during search to prevent spam
**Warning signs:** Users report app "feeling frozen" during searches

## Code Examples

Verified patterns from official sources:

### Listing Models with Filtering
```typescript
// Source: https://huggingface.co/docs/huggingface.js/main/hub/README
import { listModels } from "@huggingface/hub";

// Search by owner
for await (const model of listModels({
  search: { owner: "LiquidAI" },
  accessToken: process.env.HUGGINGFACE_TOKEN // Optional for public models
})) {
  console.log(model.name, model.downloads);
}

// Filter by tags and task
for await (const model of listModels({
  search: {
    query: "text-generation",
    tags: ["pytorch", "transformers"]
  },
  limit: 10
})) {
  console.log(model);
}
```

### Model Info Fetching
```typescript
// Source: https://huggingface.co/docs/huggingface.js/main/hub/README
import { modelInfo } from "@huggingface/hub";

const model = await modelInfo({
  name: "LiquidAI/LFM2-1.2B",
  accessToken: process.env.HUGGINGFACE_TOKEN
});

console.log(model.pipeline_tag); // e.g., "text-generation"
console.log(model.tags);         // e.g., ["pytorch", "transformers"]
console.log(model.downloads);    // e.g., 12453
```

### Debounced Search with useTransition
```typescript
// Source: https://www.npmjs.com/package/use-debounce
"use client";

import { useState, useTransition } from "react";
import { useDebouncedCallback } from "use-debounce";

export function SearchInput({ onSearch }) {
  const [isPending, startTransition] = useTransition();

  const debouncedSearch = useDebouncedCallback((value: string) => {
    startTransition(() => {
      onSearch(value);
    });
  }, 300);

  return (
    <div>
      <input
        type="search"
        onChange={(e) => debouncedSearch(e.target.value)}
        placeholder="Search models..."
      />
      {isPending && <Spinner />}
    </div>
  );
}
```

### Next.js 16 Cache with Revalidation
```typescript
// Source: https://nextjs.org/docs/app/api-reference/directives/use-cache
"use cache";
import { cacheTag } from "next/cache";

export async function getCachedModels(query: string) {
  "use cache";
  cacheTag("hf-search", `query-${query}`);

  // This result is cached and revalidated every 5 minutes
  const models = await searchHuggingFace(query);
  return models;
}

// Revalidate specific tag when needed
import { revalidateTag } from "next/cache";
await revalidateTag("hf-search");
```

### Server Action with Error Handling
```typescript
// Source: https://nextjs.org/docs/app/guides/forms
"use server";

import { listModels } from "@huggingface/hub";
import { z } from "zod";

const searchSchema = z.object({
  query: z.string().min(1).max(100),
});

export async function searchModels(query: string) {
  const parsed = searchSchema.safeParse({ query });
  if (!parsed.success) {
    return { error: "Invalid search query" };
  }

  try {
    const models = [];
    for await (const model of listModels({
      search: { query: parsed.data.query },
      limit: 20,
    })) {
      models.push(model);
    }
    return { success: true, data: models };
  } catch (error) {
    if (error.response?.status === 429) {
      return { error: "Rate limit exceeded. Please try again later." };
    }
    return { error: "Search failed. Please try again." };
  }
}
```

### AI Model Recommendation via Inference API
```typescript
// Source: https://huggingface.co/docs/huggingface.js/en/index
import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HUGGINGFACE_TOKEN);

export async function recommendModel(userGoal: string) {
  const prompt = `Given this training goal: "${userGoal}"

Recommend the best Liquid AI LFM model from these options:
- LFM2-1.2B (text generation, 1.2B params)
- LFM2-350M (nano, 350M params)
- LFM2.5-VL-1.6B (vision-language, 1.6B params)
- LFM2.5-Audio-1.5B (audio, 1.5B params)

Respond with model name and brief reason.`;

  const result = await client.chatCompletion({
    model: "meta-llama/Llama-3.1-8B-Instruct",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 150,
  });

  return result.choices[0].message.content;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `unstable_cache` | `use cache` directive | Next.js 16 (2026) | Simpler syntax, better TypeScript support, cache tagging |
| `useDebounce` (value) | `useDebouncedCallback` + `useTransition` | React 19 (2024) | Better async handling, built-in pending states |
| API Routes | Server Actions | Next.js 13+ (2023) | Less boilerplate, automatic type safety, colocation |
| Client-side filtering | Server-side HuggingFace filters | Always preferred | Accurate results, reduced bundle size, better performance |
| Transformers Python | Transformers.js v4 | 2026 | Full browser support, WebGPU acceleration, no server needed |

**Deprecated/outdated:**
- `unstable_cache`: Replaced by `use cache` in Next.js 16 - migrate to new directive
- Fetch with manual cache headers: Use `use cache` instead for automatic management
- `getServerSideProps`: App Router uses Server Components and Server Actions
- Manual debounce with `setTimeout`: Use `use-debounce` library for SSR safety

## Open Questions

1. **HuggingFace API Rate Limits for Free Tier**
   - What we know: Rate limits exist, visible in billing dashboard, 429 errors returned
   - What's unclear: Exact requests/minute limit for unauthenticated vs. free authenticated
   - Recommendation: Implement caching aggressively (5+ min revalidation), always have fallback data, monitor in production

2. **Liquid AI Model Metadata Completeness**
   - What we know: Models exist on HuggingFace, some have detailed model cards
   - What's unclear: Whether all LFMs have standardized tags for filtering by modality
   - Recommendation: Maintain curated static list of Liquid LFMs with manual modality grouping, augment with API data

3. **Natural Language Recommendation Accuracy**
   - What we know: LLMs can interpret intent and suggest models
   - What's unclear: How accurate suggestions are without fine-tuning on model catalog
   - Recommendation: Use prompt engineering with model catalog in context, start with simple rule-based fallback

4. **Client-Side vs Server-Side Model Recommendations**
   - What we know: Transformers.js enables browser inference, Server Actions call HuggingFace Inference API
   - What's unclear: Whether latency/UX justifies client-side complexity for this demo
   - Recommendation: Start with Server Actions (simpler), migrate to transformers.js in Phase 7 if needed for "wow factor"

## Sources

### Primary (HIGH confidence)
- [@huggingface/hub npm](https://www.npmjs.com/package/@huggingface/hub) - Official library documentation
- [HuggingFace Hub API Docs](https://huggingface.co/docs/huggingface.js/main/hub/README) - API methods and examples
- [Next.js 16 use cache](https://nextjs.org/docs/app/api-reference/directives/use-cache) - Cache directive documentation
- [Next.js Server Actions](https://nextjs.org/docs/app/guides/forms) - Form handling patterns
- [use-debounce npm](https://www.npmjs.com/package/use-debounce) - React debouncing library
- [LiquidAI on HuggingFace](https://huggingface.co/LiquidAI) - Official Liquid AI models

### Secondary (MEDIUM confidence)
- [Next.js Search Patterns](https://nextjs.org/learn/dashboard-app/adding-search-and-pagination) - Official tutorial on search implementation
- [React Server Components Guide](https://nextjs.org/docs/app/getting-started/server-and-client-components) - Server/Client boundaries
- [HuggingFace Rate Limits](https://huggingface.co/docs/hub/en/rate-limits) - Rate limiting documentation
- [Stale-While-Revalidate Pattern](https://www.debugbear.com/docs/stale-while-revalidate) - Caching strategy explanation
- [React Error Boundaries Guide](https://oneuptime.com/blog/post/2026-01-15-react-error-boundaries/view) - Error handling patterns

### Tertiary (LOW confidence - for validation)
- Medium articles on Next.js search patterns - Multiple implementations, verify against official docs
- Forum discussions on CORS with HuggingFace - Anecdotal but shows common issues
- WebLLM/Transformers.js guides - Alternative approaches, not primary recommendation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via official docs and npm, actively maintained
- Architecture: HIGH - Patterns from Next.js official docs and HuggingFace official examples
- Pitfalls: MEDIUM-HIGH - CORS/rate limiting verified in forums, race conditions from React docs, component boundaries from Next.js docs
- Liquid AI models: HIGH - Verified via HuggingFace organization page, models exist and are documented
- Natural language recommendations: MEDIUM - Inference API verified, but accuracy for this use case needs testing

**Research date:** 2026-02-15
**Valid until:** 2026-03-15 (30 days - stable ecosystem)

**Notes for planner:**
- No Context7 available for these libraries (used WebFetch + WebSearch)
- All stack recommendations verified with multiple sources
- Phase can be implemented with high confidence using documented patterns
- Fallback strategies are critical given rate limiting concerns
- Natural language recommendations should start simple (Server Actions) before adding complexity
