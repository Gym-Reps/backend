# Improvements (Differentiators)

## Overview

A roadmap spec, not a single feature. It captures **differentiators** for
`reps-backend` derived from the *lowest-rated, most-repeated complaints* about
the benchmark apps — **Hevy, Jefit, Strong, FitNotes** — so we deliberately
build what they get wrong or lock away.

Each differentiator below lists the **evidence** (the complaint it answers), the
**differentiator** (our stance), **backend implications**, and a **priority**.
Items we commit to **graduate into their own `NN_<MODULE>_MODULE.md` spec** and
get implemented with the usual unit + e2e test rules.

> **Research caveat:** the public App Store / Play Store review listings are
> JS-rendered and not directly fetchable, so the findings below are synthesized
> from review-aggregating comparisons, Reddit roundups, and the apps' own help
> docs — not raw store-review scrapes. Treat severity as directional; validate
> with real store reviews before committing scope. Sources at the bottom.

## What the benchmark apps get complained about (low-score themes)

| App | Recurring low-score complaints |
|-----|--------------------------------|
| **Jefit** | Cluttered/"clunky" UI; navigation keeps changing and adds taps/screens; **crashes when editing routines**; heavy/memory hog; ad-supported free tier with aggressive paywall, no trial; an **AI update lost/auto-changed users' saved plans weekly** ("literally unusable"). |
| **Strong** | **Too many taps** for basic logging; **no programming guidance** ("zero guidance on what to do"); no social/accountability; inflexible templates; **plate calculator, warm-up calc, and CSV export locked behind Pro**. |
| **Hevy** | CSV/export less comprehensive (data feels semi-locked); analytics depth limited for power users; social feed is worthless if your friends aren't already on Hevy. |
| **FitNotes** | **Android-only**, no iOS/**no web**; **no cloud sync/backup** (data lives on one device); not updated in years. |
| **Cross-cutting wishes** | Free, comprehensive **data export/portability** (not held hostage); **deep analytics for free** (volume-load trends, muscle balance, periodization); first-class **supersets/circuits/timed rounds**; **offline reliability**; fast logging. |

## Differentiators

### D1 — Your data is yours: free, full export + multi-app import
- **Evidence:** Strong locks CSV export behind Pro; Hevy's export is shallow;
  FitNotes has no cloud/backup; "data hostage" is a repeated cross-app gripe.
- **Differentiator:** One-tap **export (CSV + JSON)** of *everything*, free,
  forever — and **import from Strong / Hevy / Jefit / FitNotes CSV** so
  switching costs are near zero. Portability is a feature, not a paywall.
- **Backend implications:** `GET /export` (streams CSV/JSON for the user's
  trainments/exercises/sets); `POST /import` accepting a source format enum
  (`STRONG | HEVY | JEFIT | FITNOTES | REPS_JSON`) → a parser/adapter per
  source (Strategy pattern) → use-case that maps to our entities. Long imports
  should be idempotent and resumable.
- **Priority:** ⭐ High (cheap, strong wedge for migrators).

### D2 — Never touch the user's plan without consent (trust-first progression)
- **Evidence:** Jefit's AI update **auto-changed and lost** people's plans
  weekly — top driver of 1-star reviews. Strong offers *no* guidance at all.
- **Differentiator:** **Opt-in, non-destructive** progression. We *suggest* next
  set weights/reps (RPE/RIR- and history-based) as a proposal the user accepts
  or ignores; the app **never mutates a saved template automatically**. "Your
  plan is yours" as an explicit guarantee.
- **Backend implications:** A `progression_suggestions` read-model computed from
  history (no writes to templates); `GET /trainment-templates/:id/suggestions`.
  All template mutations stay user-initiated and audited
  (`created_at/updated_at`, soft-delete already in schema).
- **Priority:** ⭐ High (direct answer to the loudest complaint; low infra).

### D3 — Deep analytics, free
- **Evidence:** analytics depth is the common paywall/limit across Hevy & Strong;
  power users want volume-load trends, muscle-group balance, periodization.
- **Differentiator:** Free **volume-load over time**, **muscle-group balance
  heatmap**, **per-exercise progression**, and the project's planned
  **diff between the last two trainments of the same nature** (Upper A vs Upper
  A). Already on the roadmap (`planning/main.md`) — make it a free headline.
- **Backend implications:** aggregation endpoints/use-cases over
  `trainments → exercises → sets`; `muscle_group` from the
  [exercise catalog](./03_EXERCISE_CATALOG_MODULE.md) powers the balance view.
  Consider materialized/cached aggregates as data grows.
- **Priority:** ⭐ High (aligns with existing roadmap & metrics goals).

### D4 — Rich set types: supersets, circuits, drop sets, warm-up, timed rounds
- **Evidence:** repeated gap; Strong's templates are "inflexible".
- **Differentiator:** First-class set/grouping types so real training (supersets,
  circuits, AMRAP/timed rounds, drop sets, warm-up sets) logs cleanly.
- **Backend implications:** extend `Set`/`Exercise` with a `type`/`group`
  concept (e.g. `set_type` enum + an exercise `superset_group` id). Touches the
  trainment data model — coordinate with the trainment module (01).
- **Priority:** Medium.

### D5 — Bulletproof reliability: offline-first, sync, backups
- **Evidence:** Jefit **crashes losing routines**; FitNotes has **no cloud
  backup** (single-device data loss).
- **Differentiator:** Never lose a workout. Conflict-tolerant sync, automatic
  cloud backup, and an in-gym flow that survives flaky connectivity.
- **Backend implications:** idempotent write endpoints (client-generated ids /
  idempotency keys), a sync/version field per record, soft-delete (already
  present) for recoverability. Affects every write path → set conventions early.
- **Priority:** Medium-High (a platform property more than one endpoint).
- **Specced:** the trainment side of this is now
  [07_OFFLINE_SYNC_MODULE](./07_OFFLINE_SYNC_MODULE.md) — atomic, idempotent
  push of an offline-recorded trainment graph.

### D6 — Cross-platform, including web
- **Evidence:** FitNotes is **Android-only, no web**; a recurring dealbreaker.
- **Differentiator:** One account, same data on phone **and web** (read history,
  plan from a laptop). Our API-first backend already enables this.
- **Backend implications:** keep the API client-agnostic (it already is);
  refresh-token/cookie auth from [00_AUTH_MODULE](./00_AUTH_MODULE.md) supports a
  web client. Mostly a frontend commitment + CORS/session config.
- **Priority:** Low-Medium (backend is largely ready).

### D7 — Free utilities: plate calculator & warm-up calculator
- **Evidence:** Strong puts the **plate calculator behind Pro**.
- **Differentiator:** Ship them free. Mostly client-side; backend only needs to
  store the user's available plates/bar weight (fits
  [user preferences](./02_USER_PREFERENCES_MODULE.md), respecting kg/lb).
- **Priority:** Low (quick win, small surface).

### D8 — Shareable progress without a captive social graph
- **Evidence:** Hevy's social feed is "worthless if your friends aren't on it."
- **Differentiator:** Instead of a walled-garden feed, generate **shareable
  progress/PR cards exportable to Instagram** (already in `planning/main.md`) —
  value doesn't depend on your friends adopting our app.
- **Backend implications:** an endpoint that assembles the data/payload for a
  shareable card (image rendering can be client-side); reuses the analytics from
  D3.
- **Priority:** Low (roadmap item; do after analytics).

## Recommended first cut

Pick the high-trust, low-infra wedge that the benchmarks fumble:

1. **D2 — Non-destructive progression suggestions** (answers the loudest 1-star
   theme; pure read-model).
2. **D1 — Free export + multi-app import** (acquisition wedge for switchers).
3. **D3 — Free deep analytics** (already roadmapped; differentiates on value).

D4/D5 are data-model decisions to settle **before** building the trainment
module (01), since they change `Set`/`Exercise` and every write path — resolve
them early even if implemented later.

## How committed items become specs

When you accept a differentiator, it gets promoted to its own module spec
(`NN_<MODULE>_MODULE.md`) with the standard structure (Entity → Endpoints →
Use-cases → Repository → Tests), and is built with a **unit test per use-case**
and an **e2e test per new controller**, per `.claude/skills/backend-engineer`.

## Open questions

- Which 2–3 differentiators do we commit to first? (Recommendation above.)
- D4/D5 change the trainment data model — lock those conventions before
  module 01 is implemented.
- Validate the complaint severity against *actual* current store reviews before
  investing; ratings/sentiment shift release-to-release (e.g. Hevy shipped an
  algorithmic "Hevy Trainer" in Feb 2026, narrowing the guidance gap).

## Sources

- [8 Best Strong App Alternatives (Setgraph)](https://setgraph.app/articles/best-strong-app-alternatives-(2025)) — Strong/Jefit/Hevy/FitNotes limitations.
- [Hevy vs Strong 2026 (Setgraph)](https://setgraph.app/ai-blog/hevy-vs-strong-app-comparison-2026) — export/analytics/feature gaps.
- [Best Workout Tracker App Reddit (Setgraph)](https://setgraph.app/ai-blog/best-workout-tracker-app-reddit) — FitNotes Android-only/no-sync, export sentiment.
- [JEFIT App Review 2026 (eTechShout)](https://etechshout.com/jefit-app-review/) — clunky UI, crashes, ads/paywall, AI plan loss.
- [JEFIT Critical Review (Dr. Muscle)](https://dr-muscle.com/jefit-review-alternative/) — complexity, guidance gaps.
- [Hevy Import Strong CSV (Hevy Help)](https://help.hevyapp.com/hc/en-us/articles/38001424401943-How-to-Import-Strong-App-CSV-Files-and-Export-Your-Data-in-Hevy) — export/import friction across apps.
