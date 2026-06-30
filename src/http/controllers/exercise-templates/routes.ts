import type { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { addExerciseToTemplate } from './add-exercise-to-template/add-exercise-to-template'
import { fetchTemplateExercises } from './fetch-template-exercises/fetch-template-exercises'
import { removeExerciseTemplate } from './remove-exercise-template/remove-exercise-template'

export async function exerciseTemplateRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  // `:id` is the trainment template id (kept consistent with the other
  // /trainment-templates/:id routes to avoid Fastify param-name clashes).
  app.post('/trainment-templates/:id/exercises', addExerciseToTemplate)
  app.get('/trainment-templates/:id/exercises', fetchTemplateExercises)

  app.delete('/exercise-templates/:id', removeExerciseTemplate)
}
