# Deploying reps-backend to Render

This backend deploys as **three free** Render components, declared in
[`render.yaml`](./render.yaml) (a Blueprint):

| Component | Render type | What it runs |
|-----------|-------------|--------------|
| `reps-backend-db` | Postgres | The database. |
| `reps-backend-redis` | Key Value (Redis) | BullMQ transport for async metrics. |
| `reps-backend-api` | Web service | The Fastify HTTP API **plus the in-process BullMQ consumer + outbox sweeper** (`npm run start`). |

> **Why no separate worker service?** Render's free tier has no background
> workers, so the metrics consumer runs **in-process** inside the web service
> (`src/server.ts` calls `startMetricsWorker()` + `startEventSweeper()` after
> `app.listen`). Fine for MVP. To scale it out later, add a `type: worker`
> service running `npm run start:worker` (that entrypoint, `src/worker.ts`, is
> already in the repo) and remove the two calls from `server.ts`.

## One-time setup

1. **Push this branch** (so `render.yaml` is on the branch you deploy) and, ideally,
   merge to `main`.
2. In Render: **New → Blueprint**, connect this GitHub repo, pick the branch. Render
   reads `render.yaml` and creates all four components.
3. Click **Apply**. First build runs `npm ci && npm run build` (which runs
   `prisma generate`), then the web service runs `prisma migrate deploy` before
   `npm run start`.

## After the first deploy

- **Set `APP_URL`** on `reps-backend-api` to the service's public URL
  (e.g. `https://reps-backend-api.onrender.com`). It's marked `sync: false` in the
  Blueprint because the URL isn't known until the service exists. Catalog image
  URLs are built as `APP_URL + image_path`, so this must be correct.
- **Seed the exercise catalog** (module 03) once — the catalog is empty until then.
  Open the API service's **Shell** in Render and run:

  ```bash
  npx prisma db seed
  ```

  It's idempotent (upsert by `slug`), so it's safe to re-run.

## Environment variables (managed by the Blueprint)

| Var | Source |
|-----|--------|
| `DATABASE_URL` | wired from `reps-backend-db` |
| `REDIS_URL` | wired from `reps-backend-redis` |
| `SECRET_KEY` | generated for the API, shared to the worker |
| `NODE_ENV` | `prod` |
| `APP_URL` | **you set this** after first deploy |
| `CORS_ORIGIN` | `*` (tighten to your app origins for production) |

`PORT` is injected by Render automatically; `server.ts` binds to `env.PORT`.

## Plans & cost

Everything runs on **free** plans. The metrics consumer runs in-process, so there
is no paid background worker.

### Free-tier caveats

- Free Postgres **expires after 30 days**; free web services **spin down** when idle
  (cold starts). While the web service is asleep, in-process metrics computation is
  also paused — pending events are picked up by the sweeper on the next wake
  (metrics are eventually consistent by design). Upgrade for anything beyond a demo.

## What you need to provide

- A **Render account** with this GitHub repo connected.
- A decision on the worker plan (paid worker vs. free in-process — see above).
- After deploy: the **`APP_URL`** value and a one-time **catalog seed**.

Nothing else — the database, Redis, secrets, and migrations are all handled by the
Blueprint and the build/start commands.
