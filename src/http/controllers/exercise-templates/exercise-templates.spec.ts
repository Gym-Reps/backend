import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '@/app'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'

async function firstCatalogId(token: string) {
  const res = await request(app.server)
    .get('/catalog/exercises?q=squat')
    .set('Authorization', `Bearer ${token}`)
    .send()
  return res.body.exercises[0].id as string
}

async function createTemplate(token: string, title = 'Lower A') {
  const res = await request(app.server)
    .post('/trainment-templates')
    .set('Authorization', `Bearer ${token}`)
    .send({ title })
  return res.body.trainmentTemplate as { id: string; updatedAt: string }
}

describe('Exercise Templates (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('adds a catalog exercise to a template, bumps updatedAt, and lists it', async () => {
    const { token } = await createAndAuthenticateUser(app)
    const catalogId = await firstCatalogId(token)
    const template = await createTemplate(token)

    const addResponse = await request(app.server)
      .post(`/trainment-templates/${template.id}/exercises`)
      .set('Authorization', `Bearer ${token}`)
      .send({ exerciseCatalogId: catalogId })

    expect(addResponse.statusCode).toEqual(201)
    expect(addResponse.body.exerciseTemplate).toEqual(
      expect.objectContaining({
        exerciseCatalogId: catalogId,
        title: expect.any(String),
        trainmentTemplateId: template.id,
      }),
    )

    const listResponse = await request(app.server)
      .get(`/trainment-templates/${template.id}/exercises`)
      .set('Authorization', `Bearer ${token}`)
      .send()
    expect(listResponse.statusCode).toEqual(200)
    expect(listResponse.body.exercises).toHaveLength(1)

    // the parent template's updatedAt advanced
    const getTemplate = await request(app.server)
      .get(`/trainment-templates/${template.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send()
    expect(
      new Date(getTemplate.body.trainmentTemplate.updatedAt).getTime(),
    ).toBeGreaterThanOrEqual(new Date(template.updatedAt).getTime())
  })

  it('soft-deletes a slot so it leaves the list', async () => {
    const { token } = await createAndAuthenticateUser(app, {
      username: 'janedoe',
      email: 'jane@example.com',
    })
    const catalogId = await firstCatalogId(token)
    const template = await createTemplate(token)

    const addResponse = await request(app.server)
      .post(`/trainment-templates/${template.id}/exercises`)
      .set('Authorization', `Bearer ${token}`)
      .send({ exerciseCatalogId: catalogId })
    const slotId = addResponse.body.exerciseTemplate.id

    const deleteResponse = await request(app.server)
      .delete(`/exercise-templates/${slotId}`)
      .set('Authorization', `Bearer ${token}`)
      .send()
    expect(deleteResponse.statusCode).toEqual(204)

    const listResponse = await request(app.server)
      .get(`/trainment-templates/${template.id}/exercises`)
      .set('Authorization', `Bearer ${token}`)
      .send()
    expect(listResponse.body.exercises).toHaveLength(0)
  })

  it("returns 403 when adding to another user's template", async () => {
    const { token } = await createAndAuthenticateUser(app, {
      username: 'owner',
      email: 'owner@example.com',
    })
    const { token: otherToken } = await createAndAuthenticateUser(app, {
      username: 'intruder',
      email: 'intruder@example.com',
    })
    const catalogId = await firstCatalogId(token)
    const template = await createTemplate(token)

    const response = await request(app.server)
      .post(`/trainment-templates/${template.id}/exercises`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ exerciseCatalogId: catalogId })

    expect(response.statusCode).toEqual(403)
  })
})
