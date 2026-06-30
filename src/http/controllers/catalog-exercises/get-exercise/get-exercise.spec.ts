import { randomUUID } from 'node:crypto'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '@/app'
import { prisma } from '@/lib/prisma'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'

describe('Get Exercise (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
    // The data migration pre-seeds the catalog in every schema; start clean.
    await prisma.defaultExercise.deleteMany()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should get a catalog entry by id', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const seeded = await prisma.defaultExercise.create({
      data: {
        title: 'Deadlift',
        slug: 'deadlift',
        muscle_group: 'BACK',
        image_path: '/static/exercises/deadlift.webp',
      },
    })

    const response = await request(app.server)
      .get(`/catalog/exercises/${seeded.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.exercise.title).toEqual('Deadlift')
    expect(response.body.exercise.imageUrl).toEqual(
      'http://localhost:3333/static/exercises/deadlift.webp',
    )
  })

  it('should return 404 for an unknown id', async () => {
    const { token } = await createAndAuthenticateUser(app, {
      username: 'janedoe',
      email: 'janedoe@example.com',
    })

    const response = await request(app.server)
      .get(`/catalog/exercises/${randomUUID()}`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(404)
  })
})
