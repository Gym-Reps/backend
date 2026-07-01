import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '@/app'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'

describe('Preferences (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('returns the defaults right after registration', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const response = await request(app.server)
      .get('/preferences')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.preferences).toEqual({
      weightUnit: 'kg',
      theme: 'light',
      lengthUnit: 'meters',
      weeklyTrainingCount: null,
    })
  })

  it('merges a partial update and leaves the other keys untouched', async () => {
    const { token } = await createAndAuthenticateUser(app, {
      username: 'prefsuser',
      email: 'prefsuser@example.com',
    })

    const patch = await request(app.server)
      .patch('/preferences')
      .set('Authorization', `Bearer ${token}`)
      .send({ weightUnit: 'lb', weeklyTrainingCount: 5 })

    expect(patch.statusCode).toEqual(200)
    expect(patch.body.preferences.weightUnit).toEqual('lb')

    const get = await request(app.server)
      .get('/preferences')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(get.body.preferences).toEqual({
      weightUnit: 'lb',
      theme: 'light',
      lengthUnit: 'meters',
      weeklyTrainingCount: 5,
    })
  })

  it('rejects an invalid preference value with 400', async () => {
    const { token } = await createAndAuthenticateUser(app, {
      username: 'prefsinvalid',
      email: 'prefsinvalid@example.com',
    })

    const response = await request(app.server)
      .patch('/preferences')
      .set('Authorization', `Bearer ${token}`)
      .send({ weightUnit: 'stone' })

    expect(response.statusCode).toEqual(400)
  })

  it('surfaces the goal through weekly-progress', async () => {
    const { token } = await createAndAuthenticateUser(app, {
      username: 'prefsgoal',
      email: 'prefsgoal@example.com',
    })

    await request(app.server)
      .patch('/preferences')
      .set('Authorization', `Bearer ${token}`)
      .send({ weeklyTrainingCount: 3 })

    const response = await request(app.server)
      .get('/trainments/weekly-progress')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.goal).toEqual(3)
  })
})
