import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeSearchExercisesUseCase } from '@/use-cases/_factories/make-search-exercises-use-case'
import { catalogExerciseToHTTP } from '../catalog-exercise-presenter'

export async function searchExercises(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const searchExercisesQuerySchema = z.object({
    q: z.string().optional(),
    muscleGroup: z
      .enum([
        'CHEST',
        'BACK',
        'SHOULDERS',
        'BICEPS',
        'TRICEPS',
        'FOREARMS',
        'CORE',
        'QUADS',
        'HAMSTRINGS',
        'GLUTES',
        'CALVES',
        'FULL_BODY',
      ])
      .optional(),
    page: z.coerce.number().min(1).default(1),
  })

  const { q, muscleGroup, page } = searchExercisesQuerySchema.parse(
    request.query,
  )

  const searchExercisesUseCase = makeSearchExercisesUseCase()

  const { exercises, total } = await searchExercisesUseCase.execute({
    page,
    ...(q ? { query: q } : {}),
    ...(muscleGroup ? { muscleGroup } : {}),
  })

  return reply.status(200).send({
    exercises: exercises.map(catalogExerciseToHTTP),
    page,
    total,
  })
}
