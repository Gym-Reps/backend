import { randomUUID } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '@/app'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'

async function seedExerciseTemplate(token: string) {
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
  const trainmentTemplateId = templateResponse.body.trainmentTemplate
    .id as string

  const exerciseTemplateResponse = await request(app.server)
    .post(`/trainment-templates/${trainmentTemplateId}/exercises`)
    .set('Authorization', auth)
    .send({ exerciseCatalogId })
  const exerciseTemplateId = exerciseTemplateResponse.body.exerciseTemplate
    .id as string

  return { trainmentTemplateId, exerciseTemplateId }
}

function buildGraph(
  trainmentTemplateId: string,
  exerciseTemplateId: string,
  setCount = 3,
) {
  const plannedSets = Object.fromEntries(
    Array.from({ length: setCount }, (_, i) => [
      String(i + 1),
      { weight: 80, min_reps: 6, max_reps: 12 },
    ]),
  )
  const sets = Array.from({ length: setCount }, (_, i) => ({
    id: randomUUID(),
    index: i + 1,
    weight: 80 + i,
    repetitions: 10,
    performedAt: new Date('2026-06-29T18:05:00Z').toISOString(),
  }))

  return {
    id: randomUUID(),
    trainmentTemplateId,
    startedAt: new Date('2026-06-29T18:00:00Z').toISOString(),
    finishedAt: new Date('2026-06-29T18:50:00Z').toISOString(),
    exercises: [{ id: randomUUID(), exerciseTemplateId, plannedSets, sets }],
  }
}

function sync(server: FastifyInstance['server'], token: string, payload: object) {
  return request(server)
    .post('/trainments/sync')
    .set('Authorization', `Bearer ${token}`)
    .send(payload)
}

describe('Sync Trainment (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('persists a full offline graph and reflects it on GET', async () => {
    const { token } = await createAndAuthenticateUser(app)
    const { trainmentTemplateId, exerciseTemplateId } =
      await seedExerciseTemplate(token)
    const graph = buildGraph(trainmentTemplateId, exerciseTemplateId, 3)

    const response = await sync(app.server, token, graph)

    expect(response.statusCode).toEqual(201)
    expect(response.body.trainment.id).toEqual(graph.id)
    expect(response.body.sets).toHaveLength(3)

    const trainment = await request(app.server)
      .get(`/trainments/${graph.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send()
    expect(trainment.statusCode).toEqual(200)
    expect(trainment.body.trainment.finishedAt).not.toBeNull()

    const exerciseId = graph.exercises[0]!.id
    const setsResponse = await request(app.server)
      .get(`/exercises/${exerciseId}/sets`)
      .set('Authorization', `Bearer ${token}`)
      .send()
    expect(setsResponse.statusCode).toEqual(200)
    expect(setsResponse.body.sets.map((s: { index: number }) => s.index)).toEqual([
      1, 2, 3,
    ])
  })

  it('is idempotent: re-syncing the same payload returns 200 with unchanged row counts', async () => {
    const { token } = await createAndAuthenticateUser(app, {
      username: 'resyncer',
      email: 'resyncer@example.com',
    })
    const { trainmentTemplateId, exerciseTemplateId } =
      await seedExerciseTemplate(token)
    const graph = buildGraph(trainmentTemplateId, exerciseTemplateId, 3)

    const first = await sync(app.server, token, graph)
    expect(first.statusCode).toEqual(201)

    const second = await sync(app.server, token, graph)
    expect(second.statusCode).toEqual(200)

    const sets = await request(app.server)
      .get(`/trainments/${graph.id}/sets`)
      .set('Authorization', `Bearer ${token}`)
      .send()
    expect(sets.body.sets).toHaveLength(3)

    const exercises = await request(app.server)
      .get(`/trainments/${graph.id}/exercises`)
      .set('Authorization', `Bearer ${token}`)
      .send()
    expect(exercises.body.exercises).toHaveLength(1)
  })

  it("rejects a graph referencing another user's template (403) and writes nothing", async () => {
    const { token: ownerToken } = await createAndAuthenticateUser(app, {
      username: 'tmplowner',
      email: 'tmplowner@example.com',
    })
    const { token: intruderToken } = await createAndAuthenticateUser(app, {
      username: 'tmplintruder',
      email: 'tmplintruder@example.com',
    })
    const { trainmentTemplateId, exerciseTemplateId } =
      await seedExerciseTemplate(ownerToken)
    const graph = buildGraph(trainmentTemplateId, exerciseTemplateId, 2)

    const response = await sync(app.server, intruderToken, graph)
    expect(response.statusCode).toEqual(403)

    // nothing was written: the client-generated trainment id is not found
    const lookup = await request(app.server)
      .get(`/trainments/${graph.id}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send()
    expect(lookup.statusCode).toEqual(404)
  })

  it('rejects a graph whose sets count != plannedSets length (400) and writes nothing', async () => {
    const { token } = await createAndAuthenticateUser(app, {
      username: 'badgraph',
      email: 'badgraph@example.com',
    })
    const { trainmentTemplateId, exerciseTemplateId } =
      await seedExerciseTemplate(token)
    const graph = buildGraph(trainmentTemplateId, exerciseTemplateId, 3)
    // 3 planned sets but only 2 materialized sets → invariant violation
    const exercise = graph.exercises[0]!
    exercise.sets = exercise.sets.slice(0, 2)

    const response = await sync(app.server, token, graph)
    expect(response.statusCode).toEqual(400)

    const lookup = await request(app.server)
      .get(`/trainments/${graph.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send()
    expect(lookup.statusCode).toEqual(404)
  })
})
