import { PrismaExerciseTemplatesRepository } from '@/repositories/prisma/prisma-exercise-templates-repository'
import { PrismaTrainmentTemplatesRepository } from '@/repositories/prisma/prisma-trainment-templates-repository'
import { RemoveExerciseTemplateUseCase } from '../exercise-templates/remove-exercise-template/remove-exercise-template'

export function makeRemoveExerciseTemplateUseCase() {
  const exerciseTemplatesRepository = new PrismaExerciseTemplatesRepository()
  const trainmentTemplatesRepository = new PrismaTrainmentTemplatesRepository()
  return new RemoveExerciseTemplateUseCase(
    exerciseTemplatesRepository,
    trainmentTemplatesRepository,
  )
}
