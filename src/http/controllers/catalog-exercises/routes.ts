import type { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { verifyUserRole } from '@/http/middlewares/verify-user-role'
import { createExercise } from './create-exercise/create-exercise'
import { getExercise } from './get-exercise/get-exercise'
import { searchExercises } from './search-exercises/search-exercises'

export async function catalogExerciseRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('/catalog/exercises', searchExercises)
  app.get('/catalog/exercises/:id', getExercise)

  app.post(
    '/catalog/exercises',
    { onRequest: [verifyUserRole('ADMIN')] },
    createExercise,
  )
}
