import { startMetricsWorker } from './lib/queue'
import { startEventSweeper } from './queues/sweeper'

/**
 * Standalone consumer process (deployed as a separate Render worker service).
 * Runs the BullMQ worker that drains `COMPUTE_TRAINMENT_METRICS` jobs plus the
 * outbox sweeper. Kept out of the HTTP process so metrics computation scales and
 * fails independently of request serving.
 */
const worker = startMetricsWorker()
const sweeper = startEventSweeper()

console.log('Metrics worker is running')

async function shutdown(signal: string) {
  console.log(`Received ${signal}, shutting down worker`)
  clearInterval(sweeper)
  await worker.close()
  process.exit(0)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
