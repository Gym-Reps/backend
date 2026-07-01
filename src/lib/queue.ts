import { Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'
import { env } from '@/env'
import { makeProcessEventUseCase } from '@/use-cases/_factories/make-process-event-use-case'

/**
 * The single BullMQ/ioredis transport hub — the only module allowed to import
 * `bullmq`/`ioredis`. Everything is built lazily so merely importing this file
 * (which happens transitively via the controllers → factories chain, including
 * in tests) never opens a Redis connection; the socket is created on first use.
 */
export const METRICS_QUEUE = 'metrics'

let connection: IORedis | undefined
function getConnection() {
  if (!connection) {
    // `maxRetriesPerRequest: null` is required by BullMQ's blocking commands.
    connection = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null })
  }
  return connection
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
