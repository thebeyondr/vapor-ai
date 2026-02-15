# Field Notes — Vapor

Design discussions, decisions, and reasoning captured during development. Pull from this for your "Design Thinking" section.

---

## 2026-02-15 — Project Initialization

### The Welcome Modal Idea
User's instinct: don't just drop someone into a dashboard — give them context. The idea evolved from "highlight a button" to "brief modal explaining why I built this + what to try, dismissible to a floating button." This is a product thinking signal — most portfolio projects assume the reviewer will figure it out. This one guides them.

### Model Discovery UX
Initial thought was a separate model catalog page. Rejected — it doesn't make sense as a standalone screen in this context. Instead: integrate model discovery INTO the training config flow. User describes what they're trying to do → HF API suggests models. This is a better UX pattern (contextual search > browse-then-configure) and shows real API integration.

### Curated LFMs + HF Search
The "both worlds" decision: a curated section of Liquid's own LFMs grouped by modality (audio/text/vision/nano) shows company research. The HF search below shows you can build real integrations. Two different UI patterns in one screen — curated grid vs. search-driven list.

### Mock Data Strategy
Key concern: hand-crafting ML metrics is tedious and easy to get unconvincing. Solution: hybrid approach. Generated data for training curves (exponential decay with noise — mathematically convincing), real HF API for model search (authentic feel), curated JSON for LFMs. No external API dependency beyond HF.

### Error States as a Feature
Most portfolio projects only show the happy path. Including failure states in the training monitor (amber/red status badges, notification toasts) demonstrates mature UX thinking. This was a deliberate design decision, not an afterthought.

### Design Direction
Match Liquid AI's own branding rather than going generic dark-mode or light-and-clean. This is a targeted piece — the reviewer should feel like it could be an internal tool.

---
