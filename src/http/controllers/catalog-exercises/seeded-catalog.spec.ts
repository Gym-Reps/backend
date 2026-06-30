import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '@/app'
import { defaultExercises } from '../../../../prisma/data/default-exercises'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'

/**
 * Verifies the `..._seed_default_exercises` data migration ingested the curated
 * catalog: each e2e schema runs `migrate deploy`, so the rows are present
 * without any per-test seeding here.
 */
describe('Seeded catalog from migration (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('exposes the full migrated catalog', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const response = await request(app.server)
      .get('/catalog/exercises?page=1')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.total).toEqual(defaultExercises.length)
  })

  it('finds a seeded entry by search with a resolved imageUrl', async () => {
    const { token } = await createAndAuthenticateUser(app, {
      username: 'janedoe',
      email: 'janedoe@example.com',
    })

    const response = await request(app.server)
      .get('/catalog/exercises?q=bench')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    const bench = response.body.exercises.find(
      (e: { slug: string }) => e.slug === 'barbell-bench-press',
    )
    expect(bench).toBeTruthy()
    expect(bench.imageUrl).toEqual(
      'http://localhost:3333/static/exercises/barbell-bench-press.webp',
    )
  })

  it('filters the seeded catalog by muscle group', async () => {
    const { token } = await createAndAuthenticateUser(app, {
      username: 'samdoe',
      email: 'samdoe@example.com',
    })

    const response = await request(app.server)
      .get('/catalog/exercises?muscleGroup=CHEST')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.exercises.length).toBeGreaterThanOrEqual(4)
    expect(
      response.body.exercises.every(
        (e: { muscleGroup: string }) => e.muscleGroup === 'CHEST',
      ),
    ).toBe(true)
  })
})
