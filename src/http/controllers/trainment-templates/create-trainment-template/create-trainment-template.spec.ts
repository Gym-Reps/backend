import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '@/app'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'

describe('Create Trainment Template (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should create a template and list it back', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const createResponse = await request(app.server)
      .post('/trainment-templates')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Upper A' })

    expect(createResponse.statusCode).toEqual(201)
    expect(createResponse.body.trainmentTemplate).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        title: 'Upper A',
        createdAt: expect.any(String),
      }),
    )

    const listResponse = await request(app.server)
      .get('/trainment-templates')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(listResponse.statusCode).toEqual(200)
    expect(listResponse.body.trainmentTemplates).toHaveLength(1)
    expect(listResponse.body.trainmentTemplates[0].title).toEqual('Upper A')
  })

  it('should not create a template without a token', async () => {
    const response = await request(app.server)
      .post('/trainment-templates')
      .send({ title: 'Upper A' })

    expect(response.statusCode).toEqual(401)
  })
})
