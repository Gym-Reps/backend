import type { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { fetchUserTrainments } from './fetch-user-trainments/fetch-user-trainments'
import { finishTrainment } from './finish-trainment/finish-trainment'
import { getTrainment } from './get-trainment/get-trainment'
import { getWeeklyProgress } from './get-weekly-progress/get-weekly-progress'
import { startTrainment } from './start-trainment/start-trainment'
import { syncTrainment } from './sync-trainment/sync-trainment'

export async function trainmentRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.post('/trainments', startTrainment)
  // Offline-first primary write path: persist a completed session graph atomically.
  app.post('/trainments/sync', syncTrainment)
  app.patch('/trainments/:id/finish', finishTrainment)
  app.get('/trainments', fetchUserTrainments)
  // Register the literal path before `/trainments/:id` so it isn't captured by
  // the `:id` param.
  app.get('/trainments/weekly-progress', getWeeklyProgress)
  app.get('/trainments/:id', getTrainment)
}
