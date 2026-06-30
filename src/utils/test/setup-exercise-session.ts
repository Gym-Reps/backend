import type { FastifyInstance } from 'fastify'
import request from 'supertest'

const PLANNED_SETS = {
  '1': { weight: 80, min_reps: 6, max_reps: 12 },
  '2': { weight: 80, min_reps: 6, max_reps: 12 },
  '3': { weight: 80, min_reps: 6, max_reps: 12 },
}

/**
 * Builds a full chain off the migration-seeded catalog: trainment template →
 * exercise template (catalog slot) → trainment → performed exercise (which
 * materializes 3 sets). Returns the created ids for e2e assertions.
 */
export async function setupExerciseSession(
  app: FastifyInstance,
  token: string,
) {
  const auth = `Bearer ${token}`

  const catalog = await request(app.server)
    .get('/catalog/exercises?q=squat')
    .set('Authorization', auth)
    .send()
  const exerciseCatalogId = catalog.body.exercises[0].id as string

  const templateResponse = await request(app.server)
    .post('/trainment-templates')
    .set('Authorization', auth)
    .send({ title: 'Lower A' })
  const trainmentTemplateId =
    templateResponse.body.trainmentTemplate.id as string

  const exerciseTemplateResponse = await request(app.server)
    .post(`/trainment-templates/${trainmentTemplateId}/exercises`)
    .set('Authorization', auth)
    .send({ exerciseCatalogId })
  const exerciseTemplateId =
    exerciseTemplateResponse.body.exerciseTemplate.id as string

  const trainmentResponse = await request(app.server)
    .post('/trainments')
    .set('Authorization', auth)
    .send({ trainmentTemplateId })
  const trainmentId = trainmentResponse.body.trainment.id as string

  const exerciseResponse = await request(app.server)
    .post(`/trainments/${trainmentId}/exercises`)
    .set('Authorization', auth)
    .send({ exerciseTemplateId, plannedSets: PLANNED_SETS })
  const exerciseId = exerciseResponse.body.exercise.id as string

  return {
    exerciseCatalogId,
    trainmentTemplateId,
    exerciseTemplateId,
    trainmentId,
    exerciseId,
    addExerciseResponse: exerciseResponse,
  }
}
