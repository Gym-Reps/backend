import type { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { createTrainmentTemplate } from './create-trainment-template/create-trainment-template'
import { deleteTrainmentTemplate } from './delete-trainment-template/delete-trainment-template'
import { fetchUserTrainmentTemplates } from './fetch-user-trainment-templates/fetch-user-trainment-templates'
import { getTrainmentTemplate } from './get-trainment-template/get-trainment-template'
import { updateTrainmentTemplate } from './update-trainment-template/update-trainment-template'

export async function trainmentTemplateRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.post('/trainment-templates', createTrainmentTemplate)
  app.get('/trainment-templates', fetchUserTrainmentTemplates)
  app.get('/trainment-templates/:id', getTrainmentTemplate)
  app.patch('/trainment-templates/:id', updateTrainmentTemplate)
  app.delete('/trainment-templates/:id', deleteTrainmentTemplate)
}
