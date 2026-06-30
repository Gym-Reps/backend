import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '@/app'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'
import { setupExerciseSession } from '@/utils/test/setup-exercise-session'

describe('Sets (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('lists materialized sets in index order', async () => {
    const { token } = await createAndAuthenticateUser(app)
    const session = await setupExerciseSession(app, token)

    const response = await request(app.server)
      .get(`/exercises/${session.exerciseId}/sets`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.sets.map((s: { index: number }) => s.index)).toEqual([
      1, 2, 3,
    ])
    expect(response.body.sets[0].weight).toBeNull()
  })

  it('logs actual weight and reps via PATCH and reflects them on re-read', async () => {
    const { token } = await createAndAuthenticateUser(app, {
      username: 'logger',
      email: 'logger@example.com',
    })
    const session = await setupExerciseSession(app, token)
    const list = await request(app.server)
      .get(`/exercises/${session.exerciseId}/sets`)
      .set('Authorization', `Bearer ${token}`)
      .send()
    const setId = list.body.sets[0].id

    const patch = await request(app.server)
      .patch(`/sets/${setId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ weight: 82.5, repetitions: 8 })
    expect(patch.statusCode).toEqual(200)
    expect(patch.body.set.weight).toEqual(82.5)
    expect(patch.body.set.repetitions).toEqual(8)

    const reread = await request(app.server)
      .get(`/exercises/${session.exerciseId}/sets`)
      .set('Authorization', `Bearer ${token}`)
      .send()
    expect(reread.body.sets[0].weight).toEqual(82.5)
  })

  it('adds an extra set and removes the last; rejects removing a non-last set', async () => {
    const { token } = await createAndAuthenticateUser(app, {
      username: 'adder',
      email: 'adder@example.com',
    })
    const session = await setupExerciseSession(app, token)

    const addResponse = await request(app.server)
      .post(`/exercises/${session.exerciseId}/sets`)
      .set('Authorization', `Bearer ${token}`)
      .send({})
    expect(addResponse.statusCode).toEqual(201)
    expect(addResponse.body.set.index).toEqual(4)

    const afterAdd = await request(app.server)
      .get(`/exercises/${session.exerciseId}/sets`)
      .set('Authorization', `Bearer ${token}`)
      .send()
    expect(afterAdd.body.sets).toHaveLength(4)

    // removing a non-last set (index 1) is rejected
    const firstSetId = afterAdd.body.sets[0].id
    const rejectResponse = await request(app.server)
      .delete(`/sets/${firstSetId}`)
      .set('Authorization', `Bearer ${token}`)
      .send()
    expect(rejectResponse.statusCode).toEqual(409)

    // removing the last set (index 4) succeeds
    const lastSetId = afterAdd.body.sets[3].id
    const removeResponse = await request(app.server)
      .delete(`/sets/${lastSetId}`)
      .set('Authorization', `Bearer ${token}`)
      .send()
    expect(removeResponse.statusCode).toEqual(204)

    const afterRemove = await request(app.server)
      .get(`/exercises/${session.exerciseId}/sets`)
      .set('Authorization', `Bearer ${token}`)
      .send()
    expect(afterRemove.body.sets).toHaveLength(3)
  })

  it('lists all sets in a session and blocks cross-user access', async () => {
    const { token } = await createAndAuthenticateUser(app, {
      username: 'sessowner',
      email: 'sessowner@example.com',
    })
    const { token: otherToken } = await createAndAuthenticateUser(app, {
      username: 'sessintruder',
      email: 'sessintruder@example.com',
    })
    const session = await setupExerciseSession(app, token)

    const ownResponse = await request(app.server)
      .get(`/trainments/${session.trainmentId}/sets`)
      .set('Authorization', `Bearer ${token}`)
      .send()
    expect(ownResponse.statusCode).toEqual(200)
    expect(ownResponse.body.sets).toHaveLength(3)

    const crossResponse = await request(app.server)
      .get(`/trainments/${session.trainmentId}/sets`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send()
    expect(crossResponse.statusCode).toEqual(403)
  })
})
