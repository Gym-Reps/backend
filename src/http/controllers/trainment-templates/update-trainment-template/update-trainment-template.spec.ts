import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '@/app'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'

describe('Update Trainment Template (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should rename a template and reflect it on a subsequent get', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const createResponse = await request(app.server)
      .post('/trainment-templates')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Upper A' })

    const { id } = createResponse.body.trainmentTemplate

    const updateResponse = await request(app.server)
      .patch(`/trainment-templates/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Upper A (revised)' })

    expect(updateResponse.statusCode).toEqual(200)
    expect(updateResponse.body.trainmentTemplate.title).toEqual(
      'Upper A (revised)',
    )

    const getResponse = await request(app.server)
      .get(`/trainment-templates/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(getResponse.body.trainmentTemplate.title).toEqual(
      'Upper A (revised)',
    )
  })
})
