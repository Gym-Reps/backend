import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '@/app'
import { prisma } from '@/lib/prisma'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'

describe('Create Exercise (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
    // The data migration pre-seeds the catalog (incl. barbell-bench-press);
    // clear it so the create-then-conflict assertions are deterministic.
    await prisma.defaultExercise.deleteMany()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should let an ADMIN create a catalog entry', async () => {
    const { token } = await createAndAuthenticateUser(app, {
      username: 'adminuser',
      email: 'admin@example.com',
      isAdmin: true,
    })

    const response = await request(app.server)
      .post('/catalog/exercises')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Barbell Bench Press',
        muscleGroup: 'CHEST',
        imagePath: '/static/exercises/barbell-bench-press.webp',
      })

    expect(response.statusCode).toEqual(201)
    expect(response.body.exercise).toEqual(
      expect.objectContaining({
        title: 'Barbell Bench Press',
        slug: 'barbell-bench-press',
        muscleGroup: 'CHEST',
        imageUrl:
          'http://localhost:3333/static/exercises/barbell-bench-press.webp',
      }),
    )
  })

  it('should reject a duplicate slug with 409', async () => {
    const { token } = await createAndAuthenticateUser(app, {
      username: 'adminuser',
      email: 'admin@example.com',
      isAdmin: true,
    })

    await request(app.server)
      .post('/catalog/exercises')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Pull Up',
        muscleGroup: 'BACK',
        imagePath: '/static/exercises/pull-up.webp',
      })

    const response = await request(app.server)
      .post('/catalog/exercises')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Pull Up',
        muscleGroup: 'BACK',
        imagePath: '/static/exercises/pull-up.webp',
      })

    expect(response.statusCode).toEqual(409)
  })

  it('should reject a MEMBER with 401', async () => {
    const { token } = await createAndAuthenticateUser(app, {
      username: 'memberuser',
      email: 'member@example.com',
    })

    const response = await request(app.server)
      .post('/catalog/exercises')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Overhead Press',
        muscleGroup: 'SHOULDERS',
        imagePath: '/static/exercises/overhead-press.webp',
      })

    expect(response.statusCode).toEqual(401)
  })
})
