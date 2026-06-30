import { randomUUID } from 'node:crypto'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '@/app'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'

describe('Get Trainment (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should get one of the user sessions by id', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const templateResponse = await request(app.server)
      .post('/trainment-templates')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Upper A' })

    const startResponse = await request(app.server)
      .post('/trainments')
      .set('Authorization', `Bearer ${token}`)
      .send({ trainmentTemplateId: templateResponse.body.trainmentTemplate.id })

    const trainmentId = startResponse.body.trainment.id

    const response = await request(app.server)
      .get(`/trainments/${trainmentId}`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.trainment.id).toEqual(trainmentId)
  })

  it('should return 404 for a non-existent session', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const response = await request(app.server)
      .get(`/trainments/${randomUUID()}`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(404)
  })
})
