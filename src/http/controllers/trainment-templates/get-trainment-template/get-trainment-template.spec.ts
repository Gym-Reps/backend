import { randomUUID } from 'node:crypto'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '@/app'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'

describe('Get Trainment Template (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should get a template by id', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const createResponse = await request(app.server)
      .post('/trainment-templates')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Upper A' })

    const { id } = createResponse.body.trainmentTemplate

    const response = await request(app.server)
      .get(`/trainment-templates/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.trainmentTemplate.title).toEqual('Upper A')
  })

  it('should return 404 for a non-existent template', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const response = await request(app.server)
      .get(`/trainment-templates/${randomUUID()}`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(404)
  })

  it("should return 403 for another user's template", async () => {
    const { token } = await createAndAuthenticateUser(app)
    const { token: otherToken } = await createAndAuthenticateUser(app, {
      username: 'janedoe',
      email: 'janedoe@example.com',
    })

    const createResponse = await request(app.server)
      .post('/trainment-templates')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Upper A' })

    const { id } = createResponse.body.trainmentTemplate

    const response = await request(app.server)
      .get(`/trainment-templates/${id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send()

    expect(response.statusCode).toEqual(403)
  })
})
