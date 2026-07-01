import { app } from "./app";
import { env } from "./env";
import { startMetricsWorker } from "./lib/queue";
import { startEventSweeper } from "./queues/sweeper";

app.listen({ host: "0.0.0.0", port: env.PORT }).then(() => {
    console.log(`HTTP Server is running on port ${env.PORT}`)

    // Free-tier deployment runs the metrics consumer in-process (Render's free
    // plan has no background workers). The BullMQ worker drains
    // COMPUTE_TRAINMENT_METRICS jobs and the sweeper backstops the outbox. To
    // scale the consumer out later, remove these two calls and run
    // `npm run start:worker` (src/worker.ts) as a dedicated service instead.
    startMetricsWorker()
    startEventSweeper()
})
