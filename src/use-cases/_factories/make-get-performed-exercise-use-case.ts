import { PrismaExercisesRepository } from '@/repositories/prisma/prisma-exercises-repository'
import { PrismaTrainmentsRepository } from '@/repositories/prisma/prisma-trainments-repository'
import { GetExerciseUseCase } from '../exercises/get-exercise/get-exercise'

export function makeGetPerformedExerciseUseCase() {
  const exercisesRepository = new PrismaExercisesRepository()
  const trainmentsRepository = new PrismaTrainmentsRepository()
  return new GetExerciseUseCase(exercisesRepository, trainmentsRepository)
}
