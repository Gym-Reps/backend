import { PrismaExercisesRepository } from '@/repositories/prisma/prisma-exercises-repository'
import { PrismaSetsRepository } from '@/repositories/prisma/prisma-sets-repository'
import { PrismaTrainmentsRepository } from '@/repositories/prisma/prisma-trainments-repository'
import { RemoveExerciseFromTrainmentUseCase } from '../exercises/remove-exercise-from-trainment/remove-exercise-from-trainment'

export function makeRemoveExerciseFromTrainmentUseCase() {
  const exercisesRepository = new PrismaExercisesRepository()
  const trainmentsRepository = new PrismaTrainmentsRepository()
  const setsRepository = new PrismaSetsRepository()
  return new RemoveExerciseFromTrainmentUseCase(
    exercisesRepository,
    trainmentsRepository,
    setsRepository,
  )
}
