import { PrismaExerciseTemplatesRepository } from '@/repositories/prisma/prisma-exercise-templates-repository'
import { PrismaExercisesRepository } from '@/repositories/prisma/prisma-exercises-repository'
import { PrismaTrainmentTemplatesRepository } from '@/repositories/prisma/prisma-trainment-templates-repository'
import { PrismaTrainmentsRepository } from '@/repositories/prisma/prisma-trainments-repository'
import { AddExerciseToTrainmentUseCase } from '../exercises/add-exercise-to-trainment/add-exercise-to-trainment'
import { makeCreateSetsForExerciseUseCase } from './make-create-sets-for-exercise-use-case'

export function makeAddExerciseToTrainmentUseCase() {
  const exercisesRepository = new PrismaExercisesRepository()
  const trainmentsRepository = new PrismaTrainmentsRepository()
  const exerciseTemplatesRepository = new PrismaExerciseTemplatesRepository()
  const trainmentTemplatesRepository = new PrismaTrainmentTemplatesRepository()
  return new AddExerciseToTrainmentUseCase(
    exercisesRepository,
    trainmentsRepository,
    exerciseTemplatesRepository,
    trainmentTemplatesRepository,
    makeCreateSetsForExerciseUseCase(),
  )
}
