import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '@/app'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'

describe('Fetch User Trainment Templates (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it("should list only the caller's templates", async () => {
    const { token } = await createAndAuthenticateUser(app)
    const { token: otherToken } = await createAndAuthenticateUser(app, {
      username: 'janedoe',
      email: 'janedoe@example.com',
    })

    await request(app.server)
      .post('/trainment-templates')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Upper A' })

    await request(app.server)
      .post('/trainment-templates')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ title: 'Other user template' })

    const response = await request(app.server)
      .get('/trainment-templates')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.trainmentTemplates).toHaveLength(1)
    expect(response.body.trainmentTemplates[0].title).toEqual('Upper A')
  })
})
