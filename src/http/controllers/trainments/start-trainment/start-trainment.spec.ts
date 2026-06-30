import { randomUUID } from 'node:crypto'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '@/app'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'

async function createTemplate(token: string, title = 'Upper A') {
  const response = await request(app.server)
    .post('/trainment-templates')
    .set('Authorization', `Bearer ${token}`)
    .send({ title })

  return response.body.trainmentTemplate.id as string
}

describe('Start Trainment (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should start a session from an owned template', async () => {
    const { token } = await createAndAuthenticateUser(app)
    const templateId = await createTemplate(token)

    const response = await request(app.server)
      .post('/trainments')
      .set('Authorization', `Bearer ${token}`)
      .send({ trainmentTemplateId: templateId })

    expect(response.statusCode).toEqual(201)
    expect(response.body.trainment).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        trainmentTemplateId: templateId,
        finishedAt: null,
      }),
    )
    expect(response.body.trainment.startedAt).toEqual(expect.any(String))
  })

  it("should return 403 for another user's template", async () => {
    const { token } = await createAndAuthenticateUser(app)
    const { token: otherToken } = await createAndAuthenticateUser(app, {
      username: 'janedoe',
      email: 'janedoe@example.com',
    })
    const templateId = await createTemplate(token)

    const response = await request(app.server)
      .post('/trainments')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ trainmentTemplateId: templateId })

    expect(response.statusCode).toEqual(403)
  })

  it('should return 404 for a non-existent template', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const response = await request(app.server)
      .post('/trainments')
      .set('Authorization', `Bearer ${token}`)
      .send({ trainmentTemplateId: randomUUID() })

    expect(response.statusCode).toEqual(404)
  })
})
