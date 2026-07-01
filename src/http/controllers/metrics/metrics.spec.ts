import { randomUUID } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '@/app'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'
import { drainEvents } from '@/utils/test/drain-events'

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
    .send({ title: 'Upper A' })
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

function buildGraph(params: {
  trainmentTemplateId: string
  exerciseTemplateId: string
  startedAt: string
  weight: number
  setCount?: number
}) {
  const setCount = params.setCount ?? 3
  const plannedSets = Object.fromEntries(
    Array.from({ length: setCount }, (_, i) => [
      String(i + 1),
      { weight: params.weight, min_reps: 6, max_reps: 12 },
    ]),
  )
  const sets = Array.from({ length: setCount }, (_, i) => ({
    id: randomUUID(),
    index: i + 1,
    weight: params.weight,
    repetitions: 10,
    performedAt: params.startedAt,
  }))

  return {
    id: randomUUID(),
    trainmentTemplateId: params.trainmentTemplateId,
    startedAt: params.startedAt,
    finishedAt: new Date(
      new Date(params.startedAt).getTime() + 60 * 60 * 1000,
    ).toISOString(),
    exercises: [
      { id: randomUUID(), exerciseTemplateId: params.exerciseTemplateId, plannedSets, sets },
    ],
  }
}

function sync(token: string, payload: object) {
  return request(app.server)
    .post('/trainments/sync')
    .set('Authorization', `Bearer ${token}`)
    .send(payload)
}

describe('Metrics (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('computes per-set diffs across two progressing same-template sessions', async () => {
    const { token } = await createAndAuthenticateUser(app)
    const { trainmentTemplateId, exerciseTemplateId } =
      await seedExerciseTemplate(token)

    const first = buildGraph({
      trainmentTemplateId,
      exerciseTemplateId,
      startedAt: '2026-06-24T18:00:00Z',
      weight: 60,
    })
    const second = buildGraph({
      trainmentTemplateId,
      exerciseTemplateId,
      startedAt: '2026-06-29T18:00:00Z',
      weight: 62,
    })

    expect((await sync(token, first)).statusCode).toEqual(201)
    expect((await sync(token, second)).statusCode).toEqual(201)

    // Metrics are async — drain the outbox before asserting.
    await drainEvents()

    const response = await request(app.server)
      .get(`/trainments/${second.id}/metrics`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.metrics).toHaveLength(3)
    expect(
      response.body.metrics.every(
        (m: { weightDiff: number }) => m.weightDiff === 2,
      ),
    ).toBe(true)
    expect(
      response.body.metrics.every(
        (m: { repetitionsDiff: number }) => m.repetitionsDiff === 0,
      ),
    ).toBe(true)

    // The same diffs are readable via the performed-exercise endpoint.
    const exerciseId = second.exercises[0]!.id
    const byExercise = await request(app.server)
      .get(`/exercises/${exerciseId}/metrics`)
      .set('Authorization', `Bearer ${token}`)
      .send()
    expect(byExercise.statusCode).toEqual(200)
    expect(byExercise.body.metrics).toHaveLength(3)
  })

  it('returns an empty list for the first session (no previous to diff)', async () => {
    const { token } = await createAndAuthenticateUser(app, {
      username: 'firstonly',
      email: 'firstonly@example.com',
    })
    const { trainmentTemplateId, exerciseTemplateId } =
      await seedExerciseTemplate(token)

    const only = buildGraph({
      trainmentTemplateId,
      exerciseTemplateId,
      startedAt: '2026-06-24T18:00:00Z',
      weight: 60,
    })
    expect((await sync(token, only)).statusCode).toEqual(201)

    await drainEvents()

    const response = await request(app.server)
      .get(`/trainments/${only.id}/metrics`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.metrics).toEqual([])
  })

  it("returns 403 reading another user's session metrics", async () => {
    const { token: ownerToken } = await createAndAuthenticateUser(app, {
      username: 'metricsowner',
      email: 'metricsowner@example.com',
    })
    const { token: intruderToken } = await createAndAuthenticateUser(app, {
      username: 'metricsintruder',
      email: 'metricsintruder@example.com',
    })
    const { trainmentTemplateId, exerciseTemplateId } =
      await seedExerciseTemplate(ownerToken)

    const graph = buildGraph({
      trainmentTemplateId,
      exerciseTemplateId,
      startedAt: '2026-06-24T18:00:00Z',
      weight: 60,
    })
    expect((await sync(ownerToken, graph)).statusCode).toEqual(201)

    const response = await request(app.server)
      .get(`/trainments/${graph.id}/metrics`)
      .set('Authorization', `Bearer ${intruderToken}`)
      .send()

    expect(response.statusCode).toEqual(403)
  })
})
