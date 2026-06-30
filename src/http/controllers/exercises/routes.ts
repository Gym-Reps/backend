import type { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { addExerciseToTrainment } from './add-exercise-to-trainment/add-exercise-to-trainment'
import { fetchTrainmentExercises } from './fetch-trainment-exercises/fetch-trainment-exercises'
import { getExercise } from './get-exercise/get-exercise'
import { removeExerciseFromTrainment } from './remove-exercise-from-trainment/remove-exercise-from-trainment'

export async function exerciseRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  // `:id` is the trainment id here (consistent with /trainments/:id).
  app.get('/trainments/:id/exercises', fetchTrainmentExercises)
  app.post('/trainments/:id/exercises', addExerciseToTrainment)

  // `:id` is the performed exercise id here.
  app.get('/exercises/:id', getExercise)
  app.delete('/exercises/:id', removeExerciseFromTrainment)
}
