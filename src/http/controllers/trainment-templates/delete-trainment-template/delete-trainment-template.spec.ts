import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '@/app'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'

describe('Delete Trainment Template (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should soft-delete a template, hide it from the list, and reject starting from it', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const createResponse = await request(app.server)
      .post('/trainment-templates')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Upper A' })

    const { id } = createResponse.body.trainmentTemplate

    const deleteResponse = await request(app.server)
      .delete(`/trainment-templates/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(deleteResponse.statusCode).toEqual(204)

    const listResponse = await request(app.server)
      .get('/trainment-templates')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(listResponse.body.trainmentTemplates).toHaveLength(0)

    const startResponse = await request(app.server)
      .post('/trainments')
      .set('Authorization', `Bearer ${token}`)
      .send({ trainmentTemplateId: id })

    expect(startResponse.statusCode).toEqual(404)
  })
})
