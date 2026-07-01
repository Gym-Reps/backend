import type { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { fetchExerciseMetrics } from './fetch-exercise-metrics/fetch-exercise-metrics'
import { fetchTrainmentMetrics } from './fetch-trainment-metrics/fetch-trainment-metrics'

export async function metricRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  // `:id` is the trainment id here.
  app.get('/trainments/:id/metrics', fetchTrainmentMetrics)

  // `:id` is the performed exercise id here.
  app.get('/exercises/:id/metrics', fetchExerciseMetrics)
}
