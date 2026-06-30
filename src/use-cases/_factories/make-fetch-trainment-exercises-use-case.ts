import { PrismaExercisesRepository } from '@/repositories/prisma/prisma-exercises-repository'
import { PrismaTrainmentsRepository } from '@/repositories/prisma/prisma-trainments-repository'
import { FetchTrainmentExercisesUseCase } from '../exercises/fetch-trainment-exercises/fetch-trainment-exercises'

export function makeFetchTrainmentExercisesUseCase() {
  const exercisesRepository = new PrismaExercisesRepository()
  const trainmentsRepository = new PrismaTrainmentsRepository()
  return new FetchTrainmentExercisesUseCase(
    exercisesRepository,
    trainmentsRepository,
  )
}
