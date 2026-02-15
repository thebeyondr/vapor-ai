# Feature Landscape: Enterprise ML Platform Dashboards

**Domain:** AI/ML platform management interfaces
**Researched:** 2026-02-15
**Context:** Portfolio project simulating enterprise ML platform (not production system)

---

## Table Stakes

Features users expect in ML platform dashboards. Missing these makes the product feel incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Dashboard overview** | Entry point, at-a-glance status | Low | Metrics cards, recent activity, quick stats. Standard dashboard patterns. |
| **Model catalog/browser** | Find and select models for training | Medium | Search, filter, metadata display. HF API integration or curated list. |
| **Training configuration** | Set hyperparameters, select data | Medium | Form with validation. Model selection, learning rate, epochs, batch size. |
| **Training progress monitoring** | Watch active training jobs | Medium-High | Real-time metrics (loss, accuracy), progress bar, time remaining estimate. |
| **Training history** | View past training runs | Low | Table/list of completed jobs with metrics, ability to compare. |
| **Deployed models view** | See what's in production | Low | Table with status, version, metrics, uptime. |
| **Model metrics visualization** | Charts for loss, accuracy, etc. | Medium | Line charts, area charts for training curves. Recharts handles this. |
| **Resource monitoring** | GPU/CPU usage, memory | Low (mock) | For real platform this is critical. For portfolio, simplified or skipped. |
| **Status indicators** | Training status (queued, running, complete, failed) | Low | Badges, pills, color-coded states. |
| **Responsive design** | Works on tablet/mobile | Medium | Dashboard layouts are desktop-first but should adapt. |

**Confidence:** HIGH - These are universal across ML platforms (AWS SageMaker, Azure ML, GCP Vertex AI)

---

## Differentiators

Features that set products apart. Not expected, but valued. These add portfolio impact.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Real-time training updates** | No refresh needed, feels live | Medium | setInterval simulation + React Query. Creates "wow" factor. |
| **Model comparison** | Compare multiple training runs side-by-side | Medium-High | Chart overlays, metric tables. Nice-to-have, not MVP. |
| **Hyperparameter suggestions** | AI-assisted config | High | ML feature in ML platform. Complex, likely skip for 1-week timeline. |
| **Cost estimation** | Predict training cost before starting | Low (mock) | Simple calculation based on instance type + duration. Portfolio polish. |
| **One-click deployment** | From training → production easily | Low (mock) | Button that simulates deployment, updates deployed models view. |
| **Experiment tracking** | Organize training runs, tag, annotate | Medium | Tagging system, metadata. Adds organization feel but may be scope creep. |
| **Model versioning** | Track model iterations | Low-Medium | Version numbers, changelog. Adds professionalism. |
| **Dark mode** | User preference | Low | Tailwind + ShadCN support this out of the box. Should include. |
| **Welcome/onboarding modal** | Guide new users | Low | Explains platform, highlights features. Good for portfolio context. |
| **Command palette** | Power user shortcut | Medium | cmdk library. Quick navigation. Impressive but optional. |
| **Export metrics** | Download training data as CSV | Low | Simple download button. Nice polish detail. |
| **Model documentation** | Inline docs for each model | Low | Markdown rendering, fetched from HF API or static. |

**Confidence:** MEDIUM - Based on competitive analysis of modern ML platforms

---

## Anti-Features

Features to explicitly NOT build. Avoid scope creep.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Real ML training** | Requires backend infrastructure, GPUs, job queuing. Out of scope for 1-week portfolio project. | Simulate training with mock data and timers. Focus on UI/UX. |
| **User authentication** | Adds complexity (sessions, JWTs, password reset). Not needed for portfolio demo. | Single-user assumption. Could add fake "logged in as" UI for realism. |
| **Multi-tenancy** | Organizations, teams, permissions. Enterprise feature but overkill for portfolio. | Assume single user/org. Skip complexity. |
| **Data upload** | File uploads, S3 integration, data validation. Significant backend work. | Use mock datasets (hardcoded names). Training config selects from list. |
| **Model registry backend** | Database for models, versions, metadata. Requires backend + DB. | Mock data in JSON files or generated with faker.js. |
| **Billing/payments** | Stripe integration, usage tracking, invoicing. Completely out of scope. | Skip entirely or show mock cost display. |
| **Email notifications** | Training complete → send email. Requires backend service. | In-app toast notifications only (or skip). |
| **Advanced model editing** | Modify model architecture, edit code. Too deep for dashboard UI. | Configuration only (hyperparameters), not architecture changes. |
| **Data preprocessing pipelines** | ETL, data transformations. Separate tool in real platforms. | Assume data is ready. Focus on training/deployment. |
| **A/B testing frameworks** | Model performance comparison in production. Complex feature. | Show deployed model metrics, but skip A/B test infrastructure. |
| **Audit logs** | Track all user actions for compliance. Enterprise feature, overkill. | Skip. Maybe show recent activity for visual interest. |
| **API key management** | Generate/revoke API keys for deployed models. Auth complexity. | Skip. Assume models are deployed and accessible. |

**Confidence:** HIGH - Clear boundaries for 1-week portfolio project

---

## Feature Dependencies

```
Model Catalog → Training Configuration (need to select model first)
Training Configuration → Training Monitor (need to submit job first)
Training Monitor → Training History (completed jobs appear in history)
Training Configuration → Deployed Models (one-click deploy creates entry)
Dashboard Overview → all (aggregates data from other views)
```

**Critical path for MVP:**
1. Model Catalog (HF API integration or curated list)
2. Training Configuration (form with validation)
3. Training Monitor (real-time simulation)
4. Dashboard Overview (summary of above)
5. Deployed Models (list of deployed, simple table)

**Optional enhancements:**
- Welcome modal (adds context for portfolio viewers)
- Dark mode (easy with Tailwind, adds polish)
- Training History (if time permits, otherwise history is "recent jobs" on dashboard)
- Model comparison (nice-to-have, not critical)

---

## MVP Recommendation

**Prioritize (must-have for portfolio):**

1. **Dashboard Overview** - Landing page with metrics cards, recent training jobs, quick stats
2. **Model Catalog** - Search/browse models (HF API or curated Liquid AI models)
3. **Training Configuration** - Form to configure training job (model, hyperparameters)
4. **Training Monitor** - Real-time progress with live charts (simulated)
5. **Deployed Models** - Table showing deployed models with status

**Include if time permits (high impact, low effort):**

6. **Welcome Modal** - Onboarding that explains Vapor to hiring team
7. **Dark Mode** - Toggle between light/dark themes
8. **Model Versioning** - Show version numbers in deployed models view
9. **Cost Estimation** - Mock cost display in training config

**Defer (low priority for 1-week timeline):**

- Training History (can show recent on dashboard instead of dedicated page)
- Model Comparison (complex UI, marginal portfolio value)
- Command Palette (impressive but not core functionality)
- Export Metrics (nice detail but not necessary)
- Experiment Tracking (organizational feature, scope creep risk)

---

## Feature Complexity Breakdown

### Low Complexity (1-4 hours)
- Dashboard metrics cards
- Status badges/indicators
- Dark mode toggle
- Welcome modal
- Deployed models table
- Cost estimation (mock calculation)

### Medium Complexity (4-8 hours)
- Model catalog with search
- Training configuration form with validation
- Real-time training monitor (charts + progress)
- Responsive layout adjustments
- Model versioning display

### High Complexity (8+ hours)
- Model comparison (multiple chart overlays)
- Advanced filtering/search
- Hyperparameter suggestions (AI-assisted)
- Complex state management across views

**For 1-week timeline:** Focus on Low + Medium complexity features. Skip High complexity unless critical.

---

## Portfolio Impact Ranking

Features ranked by "wow factor" for hiring team:

1. **Real-time training monitor** - Most impressive, shows React Query + state management + charts
2. **HuggingFace API integration** - Shows external API integration, async handling
3. **Training configuration form** - Demonstrates complex form handling, validation
4. **Liquid AI branding** - Custom theming, attention to detail
5. **Dark mode** - Polish, user preference support
6. **Welcome modal** - Context-setting, good UX
7. **Responsive design** - Professional quality
8. **Deployed models table** - Data management, sorting/filtering
9. **Dashboard overview** - Standard but necessary

**Strategy:** Ensure top 5 are polished. Top 3 are critical portfolio highlights.

---

## Competitive Analysis Reference

**Platforms analyzed (based on training data):**
- AWS SageMaker Studio
- Azure Machine Learning Studio
- Google Cloud Vertex AI
- Hugging Face Spaces (simpler, but relevant)
- Weights & Biases (experiment tracking focus)
- Neptune.ai (ML metadata store)

**Common patterns:**
- Left sidebar navigation (models, training, deployments, monitoring)
- Dashboard as landing page with key metrics
- Training config as multi-step form or wizard
- Real-time updates for running jobs
- Table views for model catalogs and deployments
- Chart-heavy training monitoring

**Vapor should follow these patterns** - users expect this mental model.

---

## Feature Validation Checklist

For each feature implemented, ensure:

- [ ] Has loading state (skeleton or spinner)
- [ ] Has error state (what if API fails?)
- [ ] Has empty state (what if no data yet?)
- [ ] Responsive (works on tablet minimum)
- [ ] TypeScript types defined
- [ ] Accessible (keyboard nav, ARIA labels)
- [ ] Matches Liquid AI brand

**Quality gate:** All 5 MVP features should meet all 7 criteria.

---

## Sources

**Based on:**
- Training data analysis of ML platform UIs (SageMaker, Azure ML, Vertex AI)
- Common patterns in enterprise dashboards (Linear, Vercel, Retool)
- Portfolio project best practices (showcase technical depth + visual polish)

**Confidence:** MEDIUM-HIGH

Patterns are well-established in industry. Specific feature prioritization is opinionated for 1-week portfolio context.

**Note:** Unable to verify with external sources (tool restrictions). Recommendations based on training data through January 2025 and project constraints.
