# Domain Pitfalls: ML Platform Dashboard Portfolio Projects

**Domain:** Enterprise ML Platform Dashboards (Portfolio/Demo)
**Researched:** 2026-02-15
**Confidence:** HIGH (based on domain expertise, portfolio review patterns, and enterprise ML platform standards)

## Critical Pitfalls

These mistakes cause immediate dismissal from hiring teams or require major rewrites.

### Pitfall 1: Unrealistic Mock Data Patterns
**What goes wrong:** Data that screams "I generated this randomly" - perfect distributions, round numbers, no anomalies, training curves that don't match real ML behavior.

**Why it happens:**
- Using `Math.random()` without domain constraints
- Not understanding what real ML metrics look like
- Copying tutorial data without adaptation
- No time spent studying actual ML training runs

**Consequences:**
- Hiring team immediately recognizes candidate lacks ML domain knowledge
- Project dismissed as "just a frontend dev copying tutorials"
- Demonstrates inability to think like the end user (ML engineers/data scientists)

**Prevention:**
1. Study real training curves from public sources (Papers with Code, Weights & Biases public projects)
2. Training loss should: decrease non-monotonically, have occasional spikes, plateau regions, different scales per architecture
3. Validation metrics should: lag behind training, show overfitting patterns, realistic convergence rates
4. Latency numbers should: vary by model size (7B: 50-200ms, 70B: 500-2000ms), show p50/p95/p99 distributions, correlate with batch size
5. Use domain-appropriate ranges: accuracy 0.65-0.94 (not 0.999), loss decreasing but noisy, throughput inversely related to model size
6. Add realistic anomalies: failed runs, OOM errors, checkpoint gaps, deployment rollbacks

**Detection Warning Signs:**
- All metrics end in round numbers (.90, .85, .80)
- Perfectly smooth curves with no noise
- Training loss that monotonically decreases
- Latency numbers that don't correlate with model size
- 100% success rates on anything
- Throughput numbers that defy physics

**Phase to Address:** Phase 1 (Data Layer & Metrics Foundation)

---

### Pitfall 2: Generic "Tutorial Aesthetic"
**What goes wrong:** Dashboard looks like every other Next.js + shadcn tutorial project. No personality, no polish, no product thinking.

**Why it happens:**
- Using default shadcn themes without customization
- Copy-pasting component examples verbatim
- No attention to spacing, typography hierarchy, visual weight
- Treating it as "just a demo" rather than a product

**Consequences:**
- Indistinguishable from thousands of other portfolio projects
- Fails to demonstrate design judgment or product sense
- Signals lack of attention to detail
- Won't stand out to Liquid AI hiring team

**Prevention:**
1. Customize shadcn theme beyond basic colors (border radius, shadows, spacing scale)
2. Create custom components for domain-specific needs (not just forms and buttons)
3. Study actual enterprise ML platforms: Scale AI, Weights & Biases, Databricks, Modal
4. Add microinteractions: hover states, loading states, optimistic updates, skeleton screens
5. Typography hierarchy: clear information architecture, scannable metrics, emphasized CTAs
6. Whitespace mastery: breathing room around dense data, clear visual groupings
7. One signature interaction that shows craft (animated chart transitions, polished model deployment flow)

**Detection Warning Signs:**
- Could swap logo and it'd look like any other admin dashboard
- All components look exactly like shadcn docs examples
- No custom illustrations, icons, or visual elements
- Inconsistent spacing/sizing across pages
- Default Inter font with no type scale adjustments

**Phase to Address:** Phase 2 (Core UI Foundation & Design System)

---

### Pitfall 3: Domain-Inappropriate Chart Choices
**What goes wrong:** Using the wrong chart type for ML metrics, creating visualizations that no ML engineer would find useful.

**Why it happens:**
- Choosing charts based on "what looks cool" rather than "what communicates insight"
- Not understanding what ML practitioners actually monitor
- Following generic dashboard templates instead of ML-specific patterns

**Consequences:**
- Reveals lack of ML platform domain knowledge
- Charts that look pretty but convey no useful information
- Missing critical visualizations ML engineers expect
- Using metrics that don't exist in real ML workflows

**Prevention:**
1. **Training metrics**: Line charts with dual-axis (loss + metric), log scale options, epoch/step granularity
2. **Model performance**: Confusion matrices for classification, precision-recall curves, ROC curves (not pie charts)
3. **Infrastructure**: Heatmaps for GPU utilization over time, stacked area for resource allocation
4. **Latency**: Histogram/violin plots for distribution (not just averages), percentile lines
5. **Cost tracking**: Stacked bar charts by resource type (compute, storage, egress)
6. **Never use**: Pie charts for continuous metrics, 3D charts, gauge charts for rates of change

**Detection Warning Signs:**
- Pie chart showing "accuracy" (what would the slices even mean?)
- Single number for latency (where's the distribution?)
- No indication of time scale on metrics
- Charts that update in real-time but show historical data
- Missing expected ML charts (learning curves, validation curves)

**Phase to Address:** Phase 3 (Data Visualization & Metrics)

---

### Pitfall 4: Scope Creep on a 1-Week Timeline
**What goes wrong:** Attempting to build every feature of a real ML platform, ending with half-finished features and no polish.

**Why it happens:**
- Excitement about showcasing breadth over depth
- Underestimating polish time (animations, error states, loading states)
- Not understanding that hiring teams value execution over feature count
- Adding features instead of refining core experience

**Consequences:**
- Shipping with obvious bugs or incomplete features
- No feature feels polished or production-ready
- README shows 20 features but each is shallow
- Death by demo: too many half-baked things to show

**Prevention:**
1. Choose 3-5 core flows and make them perfect
2. Essential flows: Browse models → Deploy → Monitor deployment
3. Budget 40% time for polish: loading states, error handling, empty states, edge cases
4. Cut features ruthlessly: no user management, no billing, no team collaboration, no CI/CD
5. Defer to "Phase 2" or "Coming soon": model fine-tuning, A/B testing, custom metrics
6. One feature done amazingly > five features done poorly

**Detection Warning Signs:**
- TODO comments in main UI flows
- Buttons that don't do anything
- Features mentioned in README but not implemented
- Inconsistent polish across pages (some polished, some clearly rushed)
- More than 8 main nav items

**Phase to Address:** Entire roadmap structure (use phased approach to prevent)

---

### Pitfall 5: Ignoring Enterprise UX Patterns
**What goes wrong:** Dashboard feels like a consumer app or lacks enterprise platform conventions that ML engineers expect.

**Why it happens:**
- More experience with consumer apps than enterprise tools
- Not studying actual ML platforms (W&B, MLflow, Vertex AI)
- Treating ML platform as "just another CRUD app"

**Consequences:**
- Feels amateur to users of actual ML platforms
- Missing expected patterns reduces perceived credibility
- Cognitive friction for target audience (Liquid AI team)

**Prevention:**
1. **Bulk operations**: Select multiple models/deployments, batch actions
2. **Filtering/sorting**: Every table needs filters, column sorting, search
3. **Status indicators**: Clear system health, deployment status, running jobs
4. **Audit trails**: "Last deployed by @user 3h ago", change history
5. **Command palette**: Cmd+K to quickly navigate/search (cmdk library)
6. **Contextual actions**: Right-click menus, inline edit, hover actions
7. **Persistent state**: Filters/sorts survive page refresh, tab preservation
8. **Data density controls**: Compact/comfortable view toggles
9. **Export capabilities**: CSV export for tables, chart image downloads

**Detection Warning Signs:**
- No way to filter or search large lists
- Every action requires clicking through multiple pages
- No keyboard shortcuts
- Can't see who made changes or when
- Tables with no sorting
- No way to compare models or deployments side-by-side

**Phase to Address:** Phase 2 (Core UI Foundation), Phase 4 (Platform Features)

---

### Pitfall 6: Hugging Face API Dependencies Breaking Demo
**What goes wrong:** Live demo fails because HF API is rate-limited, down, or returns unexpected responses.

**Why it happens:**
- Relying on external API without fallback
- Not handling rate limits gracefully
- Assuming API will always be available during demo
- No local caching or fallback data

**Consequences:**
- Demo fails when showing to hiring team
- Loading states that never resolve
- Error states visible in production demo
- Can't showcase project if API is down

**Prevention:**
1. **Hybrid approach**: Try HF API, fallback to curated static data
2. **Aggressive caching**: Cache successful responses in localStorage/IndexedDB
3. **Request queueing**: Rate limit your own requests, queue with delays
4. **Graceful degradation**: Show cached data with "Live data unavailable" indicator
5. **Static fallback**: Curate 20-30 high-quality models as fallback (Llama 3.1, Mistral, etc.)
6. **Error boundaries**: Never show raw API errors, show "Using cached data" message
7. **Pre-warm cache**: Include initial dataset with deployment

**Detection Warning Signs:**
- Loading spinners that never resolve
- "429 Rate Limit" errors visible to users
- App unusable without internet connection
- No indication when showing cached vs live data
- Demo requires explaining "usually works, API is just down now"

**Phase to Address:** Phase 1 (Data Layer), Phase 5 (Integration & Polish)

---

### Pitfall 7: Mobile Responsiveness as Afterthought
**What goes wrong:** Dashboard completely breaks on tablet/mobile, or worse, looks responsive but is unusable.

**Why it happens:**
- Developing only on desktop
- Assuming "enterprise dashboards are desktop-only"
- Not testing on actual devices
- Responsive but not usable (tiny text, unclickable buttons)

**Consequences:**
- Hiring team might review on tablet/mobile
- Shows lack of modern web development standards
- Complex tables/charts become unusable
- Demonstrates incomplete thinking about UX

**Prevention:**
1. **Mobile-first approach**: Design for mobile, enhance for desktop
2. **Breakpoint strategy**: Mobile (<640px): stacked layouts, hidden columns; Tablet (640-1024px): simplified grid; Desktop (1024px+): full experience
3. **Hide, don't break**: Hide less critical columns on mobile, provide detail views
4. **Touch targets**: Minimum 44px tap targets, adequate spacing
5. **Chart responsiveness**: Recharts responsive container, simplified mobile variants
6. **Navigation**: Hamburger menu on mobile, persistent sidebar on desktop
7. **Test on real devices**: iPhone, iPad, Android phone at minimum
8. **Accept reduced functionality**: Full tables on mobile → card list with tap-to-expand

**Detection Warning Signs:**
- Horizontal scrolling on mobile
- Text smaller than 14px on mobile
- Buttons/links too small to tap reliably
- Charts that don't resize or become unreadable
- Navigation that breaks on narrow screens
- Tables with 10 columns on 375px width

**Phase to Address:** Phase 2 (Core UI Foundation), tested throughout all phases

## Moderate Pitfalls

Issues that reduce quality but don't necessarily sink the project.

### Pitfall 8: Over-Branded Without Permission
**What goes wrong:** Using Liquid AI's exact branding, logos, or colors in a way that looks like impersonation rather than homage.

**Prevention:**
- Inspired by, not copying: Similar color palette but distinct
- Call it "Vapor" prominently, not "Liquid AI Platform"
- Footer: "Portfolio project inspired by Liquid AI" with link
- No official logos or trademarked assets
- Custom icon set, don't reuse their exact icons

---

### Pitfall 9: No Loading or Error States
**What goes wrong:** Every async operation either works perfectly or shows nothing, no intermediate states.

**Prevention:**
- Skeleton screens for initial loads
- Inline spinners for actions
- Optimistic updates where appropriate
- Error boundaries with recovery actions
- Empty states with helpful CTAs
- Retry mechanisms with exponential backoff

**Phase to Address:** Phase 5 (Integration & Polish)

---

### Pitfall 10: Inconsistent State Management
**What goes wrong:** Some data in context, some in URL params, some in localStorage, no clear pattern.

**Prevention:**
- URL state: Filters, sorts, selected items (shareable)
- React state: UI-only toggles, form inputs
- localStorage: User preferences, theme, cached data
- Document the pattern in code comments

**Phase to Address:** Phase 1 (Data Layer & Architecture)

---

### Pitfall 11: Deployment/Build Issues
**What goes wrong:** Works locally but breaks on Vercel, or first deploy takes 2 hours of debugging.

**Prevention:**
- Test Vercel deployment early (end of Phase 1)
- Environment variables properly configured
- API routes tested in production-like environment
- No hardcoded localhost URLs
- Build errors caught early

**Phase to Address:** End of Phase 1, verified in Phase 5

---

### Pitfall 12: Accessibility Ignored
**What goes wrong:** Keyboard navigation broken, screen readers can't parse, poor contrast.

**Prevention:**
- shadcn components have good baseline accessibility
- Test with keyboard only (Tab, Enter, Escape)
- Semantic HTML (not div soup)
- ARIA labels on icon-only buttons
- Focus indicators visible
- Color not sole means of communication

**Phase to Address:** Phase 2 onwards (built-in from start)

## Minor Pitfalls

Small issues that polish can fix.

### Pitfall 13: No Attention to Performance
**What goes wrong:** Large bundle size, slow initial load, janky animations.

**Prevention:**
- Lazy load routes with next/dynamic
- Optimize images with next/image
- Virtualize long lists (react-window)
- Debounce search inputs
- Memoize expensive calculations

---

### Pitfall 14: Poor Git Hygiene
**What goes wrong:** Single commit "initial commit", .env file checked in, messy history.

**Prevention:**
- Meaningful commit messages
- .gitignore from start
- No secrets in repo
- Clear README with setup instructions

---

### Pitfall 15: Missing README/Documentation
**What goes wrong:** Hiring team can't run it locally or understand the project scope.

**Prevention:**
- Clear setup instructions
- Screenshots/GIFs of key features
- Architecture decisions documented
- Link to live demo prominent

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation | Priority |
|-------------|---------------|------------|----------|
| Phase 1: Data Layer | Unrealistic mock data | Study real ML metrics, add variance/anomalies | CRITICAL |
| Phase 1: Architecture | No HF API fallback strategy | Build hybrid static/live from start | CRITICAL |
| Phase 2: Design System | Using default shadcn theme | Customize theme tokens early | HIGH |
| Phase 2: Responsive | Mobile as afterthought | Mobile-first approach, test on devices | HIGH |
| Phase 3: Charts | Wrong chart types for ML metrics | Research ML platform chart patterns first | CRITICAL |
| Phase 4: Features | Scope creep | Lock features, focus on polish | CRITICAL |
| Phase 4: Enterprise UX | Missing expected patterns | Study W&B/MLflow, checklist of patterns | HIGH |
| Phase 5: Polish | No loading/error states | Budget 40% of phase for states | HIGH |
| Phase 5: Deployment | Vercel issues on launch day | Deploy early, test in production | MEDIUM |

## Domain-Specific Red Flags for ML Hiring Teams

What immediately signals "this person doesn't understand ML platforms":

1. **Accuracy as only metric** - Real platforms show precision, recall, F1, AUC-ROC, calibration
2. **No notion of model size/architecture** - Treating 7B and 70B models identically
3. **Unrealistic inference speeds** - 70B model serving at 5ms latency
4. **No GPU/cost awareness** - Infinite compute with no resource constraints
5. **Perfect uptime** - No concept of deployment failures, rollbacks, or incidents
6. **Single environment** - Real platforms have dev/staging/prod
7. **No versioning** - Model updates without version tracking or rollback
8. **Instant training** - Training a 7B model in 30 seconds
9. **No data splits** - No separation of train/val/test sets
10. **Made-up metrics** - "AI Score: 8.5/10" (what does this mean?)

## Research Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| ML Platform Patterns | HIGH | Standard patterns from W&B, MLflow, Vertex AI, Modal |
| Portfolio Project Pitfalls | HIGH | Common patterns from portfolio reviews and hiring feedback |
| Mock Data Realism | HIGH | Well-documented ML training behaviors, public benchmarks |
| Timeline Risks | HIGH | 1-week scope is well-defined constraint |
| Liquid AI Context | MEDIUM | Based on public info about company focus on efficiency/LLMs |

## Sources

**Note:** Research conducted from domain expertise due to tool restrictions. Recommendations based on:

- Enterprise ML platform patterns (Weights & Biases, MLflow, Vertex AI, Modal, Databricks)
- Portfolio project review feedback from ML engineering hiring processes
- Public ML benchmarks and training run patterns (Papers with Code, Hugging Face model cards)
- Next.js + shadcn/ui best practices for production dashboards
- Hugging Face API documentation and rate limiting behaviors

**Confidence level:** HIGH - Patterns are well-established and domain knowledge is current. These pitfalls are consistently documented across ML platform development and portfolio project assessments.

**Recommended verification:** Cross-reference with Liquid AI's public blog posts or engineering content for company-specific preferences on metrics/visualizations.
