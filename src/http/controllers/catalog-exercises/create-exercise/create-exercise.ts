import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeCreateExerciseUseCase } from '@/use-cases/_factories/make-create-exercise-use-case'
import { ExerciseAlreadyExistsError } from '@/use-cases/errors/exercise-already-exists-error'
import { catalogExerciseToHTTP } from '../catalog-exercise-presenter'

export async function createExercise(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const createExerciseBodySchema = z.object({
    title: z.string().min(1),
    muscleGroup: z.enum([
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
    ]),
    slug: z.string().min(1).optional(),
    imagePath: z.string().min(1),
  })

  const { title, muscleGroup, slug, imagePath } =
    createExerciseBodySchema.parse(request.body)

  try {
    const createExerciseUseCase = makeCreateExerciseUseCase()

    const { exercise } = await createExerciseUseCase.execute({
      title,
      muscleGroup,
      imagePath,
      ...(slug ? { slug } : {}),
    })

    return reply
      .status(201)
      .send({ exercise: catalogExerciseToHTTP(exercise) })
  } catch (err) {
    if (err instanceof ExerciseAlreadyExistsError) {
      return reply.status(409).send({ message: err.message })
    }

    throw err
  }
}
