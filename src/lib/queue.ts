import { type ConnectionOptions, Queue, Worker } from 'bullmq'
import { env } from '@/env'
import { makeProcessEventUseCase } from '@/use-cases/_factories/make-process-event-use-case'

/**
 * The single BullMQ transport hub — the only module allowed to import `bullmq`.
 * The Redis connection is expressed as a plain options object parsed from
 * `REDIS_URL` (not a shared `ioredis` instance): BullMQ bundles its own copy of
 * `ioredis`, so passing our instance across that boundary trips a dual-package
 * type mismatch. Letting BullMQ own its connections avoids it entirely.
 *
 * Building the options object opens no socket; connections are created lazily
 * when the Queue/Worker is instantiated, so importing this file (which happens
 * transitively via controllers → factories, including in tests) stays inert.
 */
export const METRICS_QUEUE = 'metrics'

function getConnection(): ConnectionOptions {
  const url = new URL(env.REDIS_URL)

  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 6379,
    // `maxRetriesPerRequest: null` is required by BullMQ's blocking commands.
    maxRetriesPerRequest: null,
    ...(url.username ? { username: url.username } : {}),
    ...(url.password ? { password: url.password } : {}),
    ...(url.protocol === 'rediss:' ? { tls: {} } : {}),
  }
}

let metricsQueue: Queue | undefined
export function getMetricsQueue() {
  if (!metricsQueue) {
    metricsQueue = new Queue(METRICS_QUEUE, { connection: getConnection() })
  }
  return metricsQueue
}

/**
 * Starts the in-process consumer (call after `app.listen`). Thin shell over
 * `ProcessEventUseCase`; BullMQ owns retries/backoff/concurrency. On terminal
 * failure the `failed` listener stamps the durable row `FAILED` with the error.
 */
export function startMetricsWorker() {
  const worker = new Worker(
    METRICS_QUEUE,
    async (job) => {
      await makeProcessEventUseCase().execute({
        eventId: job.data.eventId,
        attemptsMade: job.attemptsMade + 1,
        maxAttempts: job.opts.attempts ?? 1,
      })
    },
    { connection: getConnection(), concurrency: 5 },
  )

  return worker
}
