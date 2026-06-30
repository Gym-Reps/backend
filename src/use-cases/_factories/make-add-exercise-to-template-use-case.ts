import { PrismaDefaultExercisesRepository } from '@/repositories/prisma/prisma-default-exercises-repository'
import { PrismaExerciseTemplatesRepository } from '@/repositories/prisma/prisma-exercise-templates-repository'
import { PrismaTrainmentTemplatesRepository } from '@/repositories/prisma/prisma-trainment-templates-repository'
import { AddExerciseToTemplateUseCase } from '../exercise-templates/add-exercise-to-template/add-exercise-to-template'

export function makeAddExerciseToTemplateUseCase() {
  const exerciseTemplatesRepository = new PrismaExerciseTemplatesRepository()
  const trainmentTemplatesRepository = new PrismaTrainmentTemplatesRepository()
  const defaultExercisesRepository = new PrismaDefaultExercisesRepository()
  return new AddExerciseToTemplateUseCase(
    exerciseTemplatesRepository,
    trainmentTemplatesRepository,
    defaultExercisesRepository,
  )
}
