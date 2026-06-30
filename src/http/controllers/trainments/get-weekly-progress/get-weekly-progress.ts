import type { FastifyReply, FastifyRequest } from 'fastify'
import { makeGetWeeklyProgressUseCase } from '@/use-cases/_factories/make-get-weekly-progress-use-case'
import { trainmentToHTTP } from '../trainment-presenter'

export async function getWeeklyProgress(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const getWeeklyProgressUseCase = makeGetWeeklyProgressUseCase()

  const { weekStart, weekEnd, completed, goal, trainments } =
    await getWeeklyProgressUseCase.execute({
      userId: request.user.sub,
    })

  return reply.status(200).send({
    weekStart,
    weekEnd,
    completed,
    goal,
    trainments: trainments.map(trainmentToHTTP),
  })
}
