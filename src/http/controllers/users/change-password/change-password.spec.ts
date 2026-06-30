import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '@/app'

describe('Change Password (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to change the password', async () => {
    await request(app.server).post('/users').send({
      username: 'johndoe',
      email: 'johndoe@example.com',
      password: '123456',
    })

    const authResponse = await request(app.server).post('/sessions').send({
      email: 'johndoe@example.com',
      password: '123456',
    })

    const { token } = authResponse.body

    const response = await request(app.server)
      .patch('/users/password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: '123456',
        newPassword: 'new-password',
      })

    expect(response.statusCode).toEqual(204)
  })

  it('should not be able to change the password without a token', async () => {
    const response = await request(app.server).patch('/users/password').send({
      currentPassword: '123456',
      newPassword: 'new-password',
    })

    expect(response.statusCode).toEqual(401)
  })

  it('should not be able to change the password with a wrong current password', async () => {
    await request(app.server).post('/users').send({
      username: 'janedoe',
      email: 'janedoe@example.com',
      password: '123456',
    })

    const authResponse = await request(app.server).post('/sessions').send({
      email: 'janedoe@example.com',
      password: '123456',
    })

    const { token } = authResponse.body

    const response = await request(app.server)
      .patch('/users/password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'wrong-password',
        newPassword: 'new-password',
      })

    expect(response.statusCode).toEqual(400)
  })
})
