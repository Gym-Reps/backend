import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeUpdateUserPreferencesUseCase } from '@/use-cases/_factories/make-update-user-preferences-use-case'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import {
  LENGTH_UNITS,
  THEMES,
  WEIGHT_UNITS,
} from '@/use-cases/user-preferences/preferences'
import { preferencesToHTTP } from '../preferences-presenter'

export async function updatePreferences(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const updatePreferencesBodySchema = z
    .object({
      weightUnit: z.enum(WEIGHT_UNITS).optional(),
      theme: z.enum(THEMES).optional(), // MVP renders light only
      lengthUnit: z.enum(LENGTH_UNITS).optional(),
      weeklyTrainingCount: z.coerce
        .number()
        .int()
        .min(1)
        .max(14)
        .nullable()
        .optional(), // null clears the goal
    })
    .refine((v) => Object.keys(v).length > 0, {
      message: 'Provide at least one preference',
    })

  const data = updatePreferencesBodySchema.parse(request.body)

  try {
    const useCase = makeUpdateUserPreferencesUseCase()

    const { userPreferences } = await useCase.execute({
      userId: request.user.sub,
      data,
    })

    return reply
      .status(200)
      .send({ preferences: preferencesToHTTP(userPreferences) })
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    throw err
  }
}
