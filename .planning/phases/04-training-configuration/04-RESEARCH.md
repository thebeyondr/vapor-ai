# Phase 04: Training Configuration - Research

**Researched:** 2026-02-15
**Domain:** Form validation, database mutation, training job management
**Confidence:** HIGH

## Summary

Phase 4 implements a training configuration form where users select a base model (from Phase 3's LFM catalog or search results) and configure hyperparameters to create a training job. The form must validate inputs using Zod schemas, submit data via Next.js Server Actions, persist jobs to Neon Postgres using Drizzle ORM, and provide immediate user feedback.

The research confirms that the React Hook Form + Zod + Server Actions pattern is well-established and production-ready as of February 2026. ShadCN provides official form components built on this stack. Drizzle ORM supports clean insert mutations with `db.insert(table).values({...})`. The key architectural decision is using **uncontrolled components** for performance and following the **error-as-data** pattern (returning validation errors instead of throwing exceptions).

**Primary recommendation:** Build a single-page training configuration form using ShadCN's Form component with React Hook Form, Zod validation (shared client/server), and a Server Action that inserts into the `trainingJobs` table. Use `revalidatePath` + `redirect` after successful submission to navigate to the training jobs list.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-hook-form | ^7.60.0 | Form state management | Industry standard, uncontrolled components minimize re-renders (3 renders vs 30+ with controlled) |
| zod | ^4.3.6 (installed) | Schema validation | Type-safe validation, shared client/server schemas, TypeScript inference |
| @hookform/resolvers | ^5.1.1 | RHF + Zod integration | Official bridge, provides `zodResolver` for seamless integration |
| ShadCN Form | (CLI install) | Form UI primitives | Official ShadCN component, composable Field/Label/Control/Message primitives |
| drizzle-orm | ^0.45.1 (installed) | Database ORM | Type-safe SQL, insert/update/delete methods, server-only safety |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| ShadCN Input | (installed) | Text/number inputs | All form fields (name, learning rate, epochs, batch size) |
| ShadCN Label | (CLI install) | Form labels | Accessibility and styling consistency |
| ShadCN Select | (CLI install) | Model selection dropdown | When choosing base model from curated list |
| Next.js redirect | Built-in | Post-submit navigation | After successful job creation |
| Next.js revalidatePath | Built-in | Cache invalidation | Before redirect to ensure fresh data |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| React Hook Form | Formik, React Final Form | RHF has better performance (uncontrolled), wider adoption in 2026 |
| Zod | Yup, Joi, ArkType, Valibot | Zod has best TypeScript integration and z.infer utility |
| Server Actions | tRPC, API routes | Server Actions eliminate boilerplate, built-in Next.js 15+ |

**Installation:**
```bash
# Install missing dependencies
pnpm add react-hook-form @hookform/resolvers

# Add ShadCN components
npx shadcn add form
npx shadcn add label
npx shadcn add select
```

## Architecture Patterns

### Recommended Project Structure
```
app/(dashboard)/training/
├── page.tsx                    # Model discovery page (Phase 3)
├── configure/
│   ├── page.tsx                # Training configuration form (Phase 4 - NEW)
│   └── actions.ts              # createTrainingJob Server Action (Phase 4 - NEW)
├── components/
│   ├── training-config-form.tsx  # Client component form (Phase 4 - NEW)
│   └── hyperparameter-fields.tsx # Reusable hyperparameter inputs (Phase 4 - NEW)
└── actions.ts                  # Existing searchModels, recommendModel (Phase 3)

lib/
└── validations/
    └── training-job.ts         # Shared Zod schemas (Phase 4 - NEW)
```

### Pattern 1: Shared Zod Schema (Client + Server Validation)
**What:** Define validation schema once, use in both client-side RHF and server-side action.
**When to use:** All forms with Server Actions - prevents validation bypass.
**Example:**
```typescript
// lib/validations/training-job.ts
import { z } from "zod";

export const trainingJobSchema = z.object({
  name: z.string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be less than 100 characters"),
  modelId: z.string()
    .min(1, "Please select a base model"),
  learningRate: z.number()
    .min(0.000001, "Learning rate must be at least 1e-6")
    .max(1, "Learning rate must be at most 1")
    .refine((val) => val > 0, { message: "Learning rate must be positive" }),
  epochs: z.number()
    .int("Epochs must be a whole number")
    .min(1, "At least 1 epoch required")
    .max(100, "Maximum 100 epochs"),
  batchSize: z.number()
    .int("Batch size must be a whole number")
    .min(1, "Batch size must be at least 1")
    .max(128, "Batch size must be at most 128")
    .refine((val) => val % 2 === 0, {
      message: "Batch size should be a power of 2 (e.g., 2, 4, 8, 16, 32)"
    })
});

export type TrainingJobInput = z.infer<typeof trainingJobSchema>;
```
**Source:** [Handling Forms in Next.js with React Hook Form, Zod, and Server Actions](https://medium.com/@techwithtwin/handling-forms-in-next-js-with-react-hook-form-zod-and-server-actions-e148d4dc6dc1)

### Pattern 2: React Hook Form with zodResolver
**What:** Uncontrolled form with client-side validation via zodResolver.
**When to use:** All client-side forms requiring validation.
**Example:**
```typescript
// app/(dashboard)/training/components/training-config-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trainingJobSchema, type TrainingJobInput } from "@/lib/validations/training-job";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createTrainingJob } from "../configure/actions";
import { useRouter } from "next/navigation";

export function TrainingConfigForm({ modelId }: { modelId?: string }) {
  const router = useRouter();
  const form = useForm<TrainingJobInput>({
    resolver: zodResolver(trainingJobSchema),
    defaultValues: {
      name: "",
      modelId: modelId || "",
      learningRate: 0.0002,  // Recommended for LoRA fine-tuning
      epochs: 3,             // 3-5 typical for LLM fine-tuning
      batchSize: 16,         // Start with 16 or 32
    },
  });

  async function onSubmit(data: TrainingJobInput) {
    const result = await createTrainingJob(data);

    if (!result.success) {
      // Display server-side validation errors
      form.setError("root", { message: result.error });
      return;
    }

    // Success: redirect to training jobs list
    router.push(`/training/jobs/${result.jobId}`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Training Job Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., LFM-3B-finance-finetune" {...field} />
              </FormControl>
              <FormDescription>A descriptive name for this training run</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="learningRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Learning Rate</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.000001"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormDescription>Recommended: 0.0001 - 0.0002 for LoRA</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Epochs and BatchSize fields follow same pattern */}

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creating..." : "Create Training Job"}
        </Button>
      </form>
    </Form>
  );
}
```
**Source:** [React Hook Form - shadcn/ui](https://ui.shadcn.com/docs/forms/react-hook-form)

### Pattern 3: Server Action with Error-as-Data
**What:** Return validation errors as response data instead of throwing exceptions.
**When to use:** All Server Actions handling form submissions.
**Example:**
```typescript
// app/(dashboard)/training/configure/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { trainingJobs } from "@/lib/db/schema";
import { trainingJobSchema, type TrainingJobInput } from "@/lib/validations/training-job";

type CreateJobResponse =
  | { success: true; jobId: number }
  | { success: false; error: string };

export async function createTrainingJob(input: TrainingJobInput): Promise<CreateJobResponse> {
  // Server-side validation (defense in depth)
  const validated = trainingJobSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Invalid input"
    };
  }

  try {
    // Insert training job into database
    const [newJob] = await db.insert(trainingJobs).values({
      name: validated.data.name,
      modelName: validated.data.modelId,
      learningRate: validated.data.learningRate,
      epochs: validated.data.epochs,
      batchSize: validated.data.batchSize,
      status: "queued",
    }).returning({ id: trainingJobs.id });

    // Revalidate training jobs list cache
    revalidatePath("/training/jobs");

    // Return success with job ID (redirect happens client-side)
    return { success: true, jobId: newJob.id };

  } catch (error) {
    console.error("Failed to create training job:", error);
    return {
      success: false,
      error: "Failed to create training job. Please try again."
    };
  }
}
```
**Source:** [Next.js Server Actions Error Handling: A Production-Ready Guide](https://medium.com/@pawantripathi648/next-js-server-actions-error-handling-the-pattern-i-wish-i-knew-earlier-e717f28f2f75)

### Pattern 4: Drizzle Insert with Returning
**What:** Use `.returning()` to get inserted row data without extra query.
**When to use:** When you need the inserted ID or other auto-generated fields.
**Example:**
```typescript
const [newJob] = await db.insert(trainingJobs).values({
  name: "Test Job",
  modelName: "liquid/lfm-3b",
  learningRate: 0.0002,
  epochs: 3,
  batchSize: 16,
}).returning({ id: trainingJobs.id, createdAt: trainingJobs.createdAt });

console.log(`Created job ${newJob.id} at ${newJob.createdAt}`);
```
**Source:** [Drizzle ORM - Todo App with Neon Postgres](https://orm.drizzle.team/docs/tutorials/drizzle-nextjs-neon)

### Pattern 5: Database Schema with Auto-Timestamps
**What:** Use `.defaultNow()` for createdAt and `.$onUpdate()` for updatedAt.
**When to use:** All tables requiring audit timestamps.
**Example:**
```typescript
// lib/db/schema.ts (enhancement to existing table)
export const trainingJobs = pgTable("training_jobs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  status: text("status", { enum: ["queued", "running", "complete", "failed"] }).notNull().default("queued"),
  modelName: varchar("model_name", { length: 255 }).notNull(),
  epochs: integer("epochs").notNull().default(3),
  learningRate: real("learning_rate").notNull().default(0.0002),
  batchSize: integer("batch_size").notNull().default(16),  // NEW COLUMN
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});
```
**Source:** [Drizzle ORM - SQL Timestamp as a default value](https://orm.drizzle.team/docs/guides/timestamp-default-value)

### Anti-Patterns to Avoid

- **Throwing errors in Server Actions for validation failures:** Use error-as-data pattern. Throwing triggers Error Boundaries, terrible UX for form validation.
- **Not validating on server:** Client validation can be bypassed. Always use `safeParse()` in Server Actions.
- **Using controlled components unnecessarily:** React Hook Form optimizes for uncontrolled. Only use `<Controller>` for UI libraries that require it.
- **Not calling revalidatePath before redirect:** Redirect may show stale cached data. Always `revalidatePath` first.
- **Hardcoded default values in JSX:** Define defaults in `useForm({ defaultValues })` for consistency.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form validation | Custom validator functions | Zod schema with `zodResolver` | Handles edge cases (type coercion, refinements, async validation), TypeScript inference |
| Form state management | useState for each field | React Hook Form | 3 renders vs 30+, handles validation, errors, dirty state, submission |
| Number input parsing | Manual parseFloat/parseInt | RHF `valueAsNumber` + Zod `.number()` | Handles NaN, Infinity, empty string edge cases |
| Error messages | Custom error object mapping | Zod error messages + FormMessage | Automatic field-level error association |
| Database timestamps | Manual Date.now() in insert | Drizzle `.defaultNow()` and `.$onUpdate()` | Server-side clock, timezone-aware, atomic |
| Optimistic UI for forms | Manual state tracking | React 19 `useOptimistic` | Built-in rollback, handles race conditions |

**Key insight:** Form validation is deceptively complex. Zod + RHF handle type coercion (`"123"` → `123`), range validation, custom refinements, async validation, error message localization, and field dependency validation. A custom solution will miss edge cases and require 500+ lines of code.

## Common Pitfalls

### Pitfall 1: Number Input Type Coercion
**What goes wrong:** `<Input type="number" />` returns string `"123"` instead of number `123`, causing Zod validation to fail with "Expected number, received string".
**Why it happens:** HTML inputs always return strings. RHF doesn't auto-convert.
**How to avoid:** Use `valueAsNumber` in register or manual `onChange` handler:
```typescript
<Input
  type="number"
  {...field}
  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
/>
```
**Warning signs:** Zod error "Expected number, received string" on submit.

**Source:** [React Hook Form - Advanced Usage](https://www.react-hook-form.com/advanced-usage/)

### Pitfall 2: Missing batchSize Column in Existing Schema
**What goes wrong:** Schema doesn't include `batchSize`, causing insert to fail.
**Why it happens:** Original schema (from earlier phases) may not have all hyperparameters.
**How to avoid:** Add migration before implementing form:
```bash
# Add column to schema.ts, then generate migration
pnpm db:generate
pnpm db:push
```
**Warning signs:** Drizzle error "column 'batch_size' does not exist".

### Pitfall 3: Not Handling Redirect in Server Action
**What goes wrong:** Using `redirect()` in Server Action causes "NEXT_REDIRECT" error in useActionState or crashes form submission.
**Why it happens:** `redirect()` throws a framework exception that must be caught by Next.js, but client-side error handling intercepts it.
**How to avoid:** Return success response from Server Action, handle redirect in client component:
```typescript
// Server Action - DON'T redirect here
if (!validated.success) return { success: false, error: "..." };
return { success: true, jobId: newJob.id };

// Client Form - DO redirect here
async function onSubmit(data) {
  const result = await createTrainingJob(data);
  if (result.success) {
    router.push(`/training/jobs/${result.jobId}`);
  }
}
```
**Warning signs:** "NEXT_REDIRECT" error, form submission appearing to fail but job actually created.

**Source:** [Next.js redirect function documentation](https://nextjs.org/docs/app/api-reference/functions/redirect)

### Pitfall 4: Forgetting revalidatePath
**What goes wrong:** After creating job, navigating to jobs list shows stale data (job not appearing).
**Why it happens:** Next.js caches page data. Insert doesn't invalidate cache automatically.
**How to avoid:** Call `revalidatePath("/training/jobs")` in Server Action before returning:
```typescript
await db.insert(trainingJobs).values({...});
revalidatePath("/training/jobs");  // Invalidate cache
return { success: true, jobId: newJob.id };
```
**Warning signs:** New job doesn't appear in list until hard refresh.

**Source:** [Next.js revalidatePath documentation](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)

### Pitfall 5: Learning Rate Scientific Notation Input
**What goes wrong:** Users enter `2e-4` but HTML number input doesn't parse it correctly, or Zod validation rejects it.
**Why it happens:** Browser number input support for scientific notation is inconsistent.
**How to avoid:** Use `step="0.000001"` and accept both decimal and scientific notation:
```typescript
<Input
  type="number"
  step="0.000001"
  placeholder="0.0002 or 2e-4"
  {...field}
/>
```
**Warning signs:** User confusion, error messages for valid scientific notation.

### Pitfall 6: Model Selection State Mismatch
**What goes wrong:** User selects model from Phase 3 search results, but navigating to config page loses selection.
**Why it happens:** No state persistence between pages.
**How to avoid:** Pass modelId via URL query param:
```typescript
// From search results page
<Button onClick={() => router.push(`/training/configure?model=${model.id}`)}>
  Configure Training
</Button>

// In configure page
const searchParams = useSearchParams();
const modelId = searchParams.get("model") || "";
```
**Warning signs:** Users complain about having to re-select model.

## Code Examples

### Complete Training Configuration Form
```typescript
// app/(dashboard)/training/configure/page.tsx
import { Suspense } from "react";
import { TrainingConfigForm } from "./training-config-form";

interface PageProps {
  searchParams: { model?: string };
}

export default function TrainingConfigPage({ searchParams }: PageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configure Training Job</h1>
        <p className="mt-2 text-muted-foreground">
          Set up hyperparameters and submit your training job to the queue.
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <TrainingConfigForm modelId={searchParams.model} />
      </Suspense>
    </div>
  );
}
```

### Hyperparameter Validation with Realistic Ranges
```typescript
// lib/validations/training-job.ts
export const hyperparameterRanges = {
  learningRate: {
    min: 0.000001,    // 1e-6
    max: 1.0,
    recommended: 0.0002,  // 2e-4, standard for LoRA
    description: "Controls step size during optimization"
  },
  epochs: {
    min: 1,
    max: 100,
    recommended: 3,
    description: "Number of complete passes through training data"
  },
  batchSize: {
    min: 1,
    max: 128,
    recommended: 16,
    description: "Number of samples processed before model update"
  }
} as const;

// Use in schema
export const trainingJobSchema = z.object({
  // ... other fields
  learningRate: z.number()
    .min(hyperparameterRanges.learningRate.min)
    .max(hyperparameterRanges.learningRate.max),
});
```
**Source:** [Understanding Key Hyperparameters When Fine-Tuning an LLM](https://genmind.ch/posts/understanding-key-hyperparameters-when-fine-tuning-an-llm/)

### Error Handling with Form-Level Messages
```typescript
// In TrainingConfigForm component
const form = useForm<TrainingJobInput>({
  resolver: zodResolver(trainingJobSchema),
  // ...
});

async function onSubmit(data: TrainingJobInput) {
  const result = await createTrainingJob(data);

  if (!result.success) {
    // Display server error at form level
    form.setError("root", {
      type: "server",
      message: result.error
    });
    return;
  }

  router.push(`/training/jobs/${result.jobId}`);
}

// In JSX
{form.formState.errors.root && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>
      {form.formState.errors.root.message}
    </AlertDescription>
  </Alert>
)}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Formik + Yup | React Hook Form + Zod | 2023-2024 | 10x fewer re-renders, better TypeScript support |
| API Routes for mutations | Next.js Server Actions | Next.js 13+ (2023) | No boilerplate, automatic serialization, built-in error handling |
| Manual timestamp management | Drizzle `.$onUpdate()` | Drizzle v0.30+ (2024) | Automatic updatedAt, no manual tracking |
| useFormState (React 18) | useActionState (React 19) | React 19 (2024) | Renamed, better TypeScript types |
| Manual optimistic UI | useOptimistic hook | React 19 (2024) | Built-in rollback, race condition handling |

**Deprecated/outdated:**
- **Formik:** Still maintained but React Hook Form has better performance and ecosystem.
- **Yup:** Works but Zod has superior TypeScript integration with `z.infer`.
- **API Routes for simple mutations:** Server Actions are simpler for form submissions.
- **useFormState:** Renamed to `useActionState` in React 19 (February 2025).

## Realistic Hyperparameter Defaults

Based on current LLM fine-tuning best practices (2026):

| Hyperparameter | Recommended Default | Range | Rationale |
|----------------|---------------------|-------|-----------|
| Learning Rate | 0.0002 (2e-4) | 1e-6 to 5e-4 | Standard for LoRA fine-tuning, balances convergence speed and stability |
| Epochs | 3 | 1 to 100 | 3-5 typical for LLM fine-tuning, prevents overfitting |
| Batch Size | 16 | 1 to 128 | GPU memory sweet spot, allows higher learning rates |

**Source:** [Fine-Tuning LLMs: Hyperparameter Best Practices](https://latitude.so/blog/fine-tuning-llms-hyperparameter-best-practices/)

**Advanced insights:**
- Larger batch sizes (32-64) with lower learning rates (1e-4) improve benchmark performance (MMLU, MTBench).
- Cosine decay may not help with small LLMs + large batches; constant learning rate is simpler.
- Batch size should ideally be power of 2 (2, 4, 8, 16, 32, 64) for GPU efficiency.

## Open Questions

1. **Should we support dataset upload in Phase 4 or defer to Phase 5?**
   - What we know: Requirements mention "training job creation" but not dataset management.
   - What's unclear: Whether Phase 4 should include dataset selection or just configuration.
   - Recommendation: Start with mock dataset selection (dropdown of predefined datasets) in Phase 4. Real upload can be Phase 5 enhancement. This keeps Phase 4 focused on hyperparameter configuration.

2. **Do we need model size/architecture validation?**
   - What we know: Different models may have different valid hyperparameter ranges.
   - What's unclear: Whether validation should be model-specific (e.g., nano models have different batch size limits).
   - Recommendation: Start with universal ranges (current approach). Add model-specific validation in Phase 5 if needed.

3. **Should form support "advanced mode" with more hyperparameters?**
   - What we know: Production systems often have 10+ hyperparameters (warmup steps, weight decay, gradient clipping).
   - What's unclear: Whether demo needs this complexity.
   - Recommendation: Ship Phase 4 with 4 fields (name, learning rate, epochs, batch size). Add "Advanced" accordion in future iteration if time permits.

## Sources

### Primary (HIGH confidence)
- [ShadCN Form Component Documentation](https://ui.shadcn.com/docs/components/form) - Official form component patterns
- [React Hook Form - shadcn/ui](https://ui.shadcn.com/docs/forms/react-hook-form) - Official RHF integration guide
- [Drizzle ORM - SQL Timestamp Defaults](https://orm.drizzle.team/docs/guides/timestamp-default-value) - Official timestamp documentation
- [Next.js - Updating Data](https://nextjs.org/docs/app/getting-started/updating-data) - Official Server Actions guide (updated Feb 2026)
- [Next.js - revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath) - Official cache invalidation docs
- [Next.js - redirect](https://nextjs.org/docs/app/api-reference/functions/redirect) - Official redirect documentation
- [React - useOptimistic](https://react.dev/reference/react/useOptimistic) - Official React 19 hook docs

### Secondary (MEDIUM confidence)
- [Handling Forms in Next.js with React Hook Form, Zod, and Server Actions](https://medium.com/@techwithtwin/handling-forms-in-next-js-with-react-hook-form-zod-and-server-actions-e148d4dc6dc1) - Comprehensive tutorial from Jan 2026
- [Next.js Server Actions Error Handling: A Production-Ready Guide](https://medium.com/@pawantripathi648/next-js-server-actions-error-handling-the-pattern-i-wish-i-knew-earlier-e717f28f2f75) - Error-as-data pattern (Dec 2025)
- [Type-Safe Form Validation in Next.js 15: Zod, RHF, & Server Actions](https://www.abstractapi.com/guides/email-validation/type-safe-form-validation-in-next-js-15-with-zod-and-react-hook-form) - Current best practices
- [Understanding Key Hyperparameters When Fine-Tuning an LLM](https://genmind.ch/posts/understanding-key-hyperparameters-when-fine-tuning-an-llm/) - Hyperparameter guidance
- [Fine-Tuning LLMs: Hyperparameter Best Practices](https://latitude.so/blog/fine-tuning-llms-hyperparameter-best-practices/) - 2026 best practices
- [How to Use Drizzle ORM with PostgreSQL in Next.js 15](https://strapi.io/blog/how-to-use-drizzle-orm-with-postgresql-in-a-nextjs-15-project) - Insert/mutation patterns (Apr 2025)
- [Drizzle ORM - Todo App with Neon Postgres](https://orm.drizzle.team/docs/tutorials/drizzle-nextjs-neon) - Official Next.js tutorial

### Tertiary (LOW confidence - for context only)
- Various GitHub discussions on form patterns (validated against official docs)
- Community blog posts on hyperparameter tuning (cross-referenced with multiple sources)

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** - React Hook Form + Zod is industry standard as of 2026, verified by official ShadCN docs and multiple recent guides
- Architecture: **HIGH** - Server Actions + error-as-data pattern confirmed by official Next.js docs (updated Feb 2026)
- Pitfalls: **MEDIUM-HIGH** - Number input coercion and redirect issues are documented, revalidatePath is official guidance
- Hyperparameters: **MEDIUM** - Ranges based on multiple sources (Unsloth, Latitude, HuggingFace discussions) but not Liquid AI-specific

**Research date:** 2026-02-15
**Valid until:** 2026-03-15 (30 days - stack is stable, hyperparameter best practices evolve slowly)

**Key limitations:**
- No official Liquid AI training documentation available (LEAP docs focus on inference)
- Hyperparameter ranges are general LLM fine-tuning guidance, not Liquid-specific
- Form UI patterns verified through documentation, but implementation details will require testing

**Next steps for planner:**
1. Create schema migration plan (add `batchSize` column)
2. Install missing dependencies (react-hook-form, @hookform/resolvers, ShadCN components)
3. Create validation schema in lib/validations/training-job.ts
4. Build training configuration form component
5. Implement createTrainingJob Server Action
6. Add navigation from model discovery to config page
7. Create training jobs list page (separate plan or Phase 5)
