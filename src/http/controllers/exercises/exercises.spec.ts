import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '@/app'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'
import { setupExerciseSession } from '@/utils/test/setup-exercise-session'

describe('Performed Exercises (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('adds a performed exercise that materializes its sets, then gets and lists it', async () => {
    const { token } = await createAndAuthenticateUser(app)
    const session = await setupExerciseSession(app, token)

    expect(session.addExerciseResponse.statusCode).toEqual(201)
    expect(session.addExerciseResponse.body.sets).toHaveLength(3)
    expect(session.addExerciseResponse.body.exercise.plannedSets['1']).toEqual({
      weight: 80,
      min_reps: 6,
      max_reps: 12,
    })

    const getResponse = await request(app.server)
      .get(`/exercises/${session.exerciseId}`)
      .set('Authorization', `Bearer ${token}`)
      .send()
    expect(getResponse.statusCode).toEqual(200)
    expect(getResponse.body.exercise.id).toEqual(session.exerciseId)

    const listResponse = await request(app.server)
      .get(`/trainments/${session.trainmentId}/exercises`)
      .set('Authorization', `Bearer ${token}`)
      .send()
    expect(listResponse.statusCode).toEqual(200)
    expect(listResponse.body.exercises).toHaveLength(1)
  })

  it('removes a performed exercise and its sets', async () => {
    const { token } = await createAndAuthenticateUser(app, {
      username: 'remover',
      email: 'remover@example.com',
    })
    const session = await setupExerciseSession(app, token)

    const deleteResponse = await request(app.server)
      .delete(`/exercises/${session.exerciseId}`)
      .set('Authorization', `Bearer ${token}`)
      .send()
    expect(deleteResponse.statusCode).toEqual(204)

    const getResponse = await request(app.server)
      .get(`/exercises/${session.exerciseId}`)
      .set('Authorization', `Bearer ${token}`)
      .send()
    expect(getResponse.statusCode).toEqual(404)
  })

  it("returns 403 getting another user's exercise", async () => {
    const { token } = await createAndAuthenticateUser(app, {
      username: 'owner2',
      email: 'owner2@example.com',
    })
    const { token: otherToken } = await createAndAuthenticateUser(app, {
      username: 'intruder2',
      email: 'intruder2@example.com',
    })
    const session = await setupExerciseSession(app, token)

    const response = await request(app.server)
      .get(`/exercises/${session.exerciseId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send()

    expect(response.statusCode).toEqual(403)
  })
})
