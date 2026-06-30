import { PrismaExercisesRepository } from '@/repositories/prisma/prisma-exercises-repository'
import { PrismaSetsRepository } from '@/repositories/prisma/prisma-sets-repository'
import { PrismaTrainmentsRepository } from '@/repositories/prisma/prisma-trainments-repository'
import { AddSetToExerciseUseCase } from '../sets/add-set-to-exercise/add-set-to-exercise'

export function makeAddSetToExerciseUseCase() {
  const setsRepository = new PrismaSetsRepository()
  const exercisesRepository = new PrismaExercisesRepository()
  const trainmentsRepository = new PrismaTrainmentsRepository()
  return new AddSetToExerciseUseCase(
    setsRepository,
    exercisesRepository,
    trainmentsRepository,
  )
}
