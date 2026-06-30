import { PrismaExerciseTemplatesRepository } from '@/repositories/prisma/prisma-exercise-templates-repository'
import { PrismaTrainmentTemplatesRepository } from '@/repositories/prisma/prisma-trainment-templates-repository'
import { FetchTemplateExercisesUseCase } from '../exercise-templates/fetch-template-exercises/fetch-template-exercises'

export function makeFetchTemplateExercisesUseCase() {
  const exerciseTemplatesRepository = new PrismaExerciseTemplatesRepository()
  const trainmentTemplatesRepository = new PrismaTrainmentTemplatesRepository()
  return new FetchTemplateExercisesUseCase(
    exerciseTemplatesRepository,
    trainmentTemplatesRepository,
  )
}
