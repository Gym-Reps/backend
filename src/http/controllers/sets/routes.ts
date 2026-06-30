import type { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { addSetToExercise } from './add-set-to-exercise/add-set-to-exercise'
import { fetchSetsByExercise } from './fetch-sets-by-exercise/fetch-sets-by-exercise'
import { fetchSetsByTrainment } from './fetch-sets-by-trainment/fetch-sets-by-trainment'
import { removeSetFromExercise } from './remove-set-from-exercise/remove-set-from-exercise'
import { updateSet } from './update-set/update-set'

export async function setRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  // `:id` is the exercise id for these two.
  app.get('/exercises/:id/sets', fetchSetsByExercise)
  app.post('/exercises/:id/sets', addSetToExercise)

  // `:id` is the set id here.
  app.patch('/sets/:id', updateSet)
  app.delete('/sets/:id', removeSetFromExercise)

  // `:id` is the trainment id here.
  app.get('/trainments/:id/sets', fetchSetsByTrainment)
}
