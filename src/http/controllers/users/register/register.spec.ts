import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '@/app'

describe('Register (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to register', async () => {
    const response = await request(app.server).post('/users').send({
      username: 'johndoe',
      email: 'johndoe@example.com',
      password: '123456',
    })

    expect(response.statusCode).toEqual(201)
  })

  it('should not be able to register with an email already in use', async () => {
    await request(app.server).post('/users').send({
      username: 'janedoe',
      email: 'janedoe@example.com',
      password: '123456',
    })

    const response = await request(app.server).post('/users').send({
      username: 'janedoe-2',
      email: 'janedoe@example.com',
      password: '123456',
    })

    expect(response.statusCode).toEqual(409)
  })
})
