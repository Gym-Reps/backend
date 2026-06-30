import { PrismaDefaultExercisesRepository } from '@/repositories/prisma/prisma-default-exercises-repository'
import { GetExerciseUseCase } from '../default-exercises/get-exercise/get-exercise'

export function makeGetExerciseUseCase() {
  const defaultExercisesRepository = new PrismaDefaultExercisesRepository()
  return new GetExerciseUseCase(defaultExercisesRepository)
}
