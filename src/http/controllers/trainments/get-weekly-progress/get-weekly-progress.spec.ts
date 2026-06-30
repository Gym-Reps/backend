import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '@/app'
import { prisma } from '@/lib/prisma'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'

async function startAndFinish(token: string, templateId: string) {
  const startResponse = await request(app.server)
    .post('/trainments')
    .set('Authorization', `Bearer ${token}`)
    .send({ trainmentTemplateId: templateId })

  const trainmentId = startResponse.body.trainment.id as string

  await request(app.server)
    .patch(`/trainments/${trainmentId}/finish`)
    .set('Authorization', `Bearer ${token}`)
    .send()

  return trainmentId
}

describe('Get Weekly Progress (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should count this week finished sessions and exclude last week', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const templateResponse = await request(app.server)
      .post('/trainment-templates')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Upper A' })

    const templateId = templateResponse.body.trainmentTemplate.id

    // finished this week
    await startAndFinish(token, templateId)

    // finished, then backdated to last week → must be excluded
    const lastWeekId = await startAndFinish(token, templateId)
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
    await prisma.trainment.update({
      where: { id: lastWeekId },
      data: { finished_at: eightDaysAgo, started_at: eightDaysAgo },
    })

    const response = await request(app.server)
      .get('/trainments/weekly-progress')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.completed).toEqual(1)
    expect(response.body.goal).toBeNull()
    expect(response.body.trainments).toHaveLength(1)
    expect(response.body.weekStart).toEqual(expect.any(String))
    expect(response.body.weekEnd).toEqual(expect.any(String))
  })
})
