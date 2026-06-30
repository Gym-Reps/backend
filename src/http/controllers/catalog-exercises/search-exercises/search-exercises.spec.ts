import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '@/app'
import { prisma } from '@/lib/prisma'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'

async function seedCatalog() {
  await prisma.defaultExercise.createMany({
    data: [
      {
        title: 'Barbell Bench Press',
        slug: 'barbell-bench-press',
        muscle_group: 'CHEST',
        image_path: '/static/exercises/barbell-bench-press.webp',
      },
      {
        title: 'Pull Up',
        slug: 'pull-up',
        muscle_group: 'BACK',
        image_path: '/static/exercises/pull-up.webp',
      },
    ],
  })
}

describe('Search Exercises (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
    await seedCatalog()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should search by title and resolve the imageUrl', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const response = await request(app.server)
      .get('/catalog/exercises?q=bench')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.total).toEqual(1)
    expect(response.body.exercises).toHaveLength(1)
    expect(response.body.exercises[0]).toEqual(
      expect.objectContaining({
        title: 'Barbell Bench Press',
        slug: 'barbell-bench-press',
        muscleGroup: 'CHEST',
        imageUrl: 'http://localhost:3333/static/exercises/barbell-bench-press.webp',
      }),
    )
    expect(response.body.exercises[0]).not.toHaveProperty('image_path')
  })

  it('should filter by muscle group', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const response = await request(app.server)
      .get('/catalog/exercises?muscleGroup=CHEST')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.exercises).toHaveLength(1)
    expect(response.body.exercises[0].muscleGroup).toEqual('CHEST')
  })

  it('should require a token', async () => {
    const response = await request(app.server)
      .get('/catalog/exercises')
      .send()

    expect(response.statusCode).toEqual(401)
  })
})
