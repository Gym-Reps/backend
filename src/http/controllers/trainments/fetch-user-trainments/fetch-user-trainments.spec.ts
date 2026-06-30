import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '@/app'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'

describe('Fetch User Trainments (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should list only the sessions of the given template when filtered', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const templateA = await request(app.server)
      .post('/trainment-templates')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Upper A' })
    const templateB = await request(app.server)
      .post('/trainment-templates')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Lower B' })

    const templateAId = templateA.body.trainmentTemplate.id
    const templateBId = templateB.body.trainmentTemplate.id

    await request(app.server)
      .post('/trainments')
      .set('Authorization', `Bearer ${token}`)
      .send({ trainmentTemplateId: templateAId })
    await request(app.server)
      .post('/trainments')
      .set('Authorization', `Bearer ${token}`)
      .send({ trainmentTemplateId: templateBId })

    const response = await request(app.server)
      .get(`/trainments?trainmentTemplateId=${templateAId}`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.page).toEqual(1)
    expect(response.body.trainments).toHaveLength(1)
    expect(response.body.trainments[0].trainmentTemplateId).toEqual(templateAId)
  })
})
