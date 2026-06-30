import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '@/app'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'

describe('Finish Trainment (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should finish an in-progress session and reject a second finish', async () => {
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

    const finishResponse = await request(app.server)
      .patch(`/trainments/${trainmentId}/finish`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(finishResponse.statusCode).toEqual(200)
    expect(finishResponse.body.trainment.finishedAt).toEqual(expect.any(String))

    const secondFinishResponse = await request(app.server)
      .patch(`/trainments/${trainmentId}/finish`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(secondFinishResponse.statusCode).toEqual(409)
  })
})
