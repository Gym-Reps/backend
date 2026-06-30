import { PrismaDefaultExercisesRepository } from '@/repositories/prisma/prisma-default-exercises-repository'
import { CreateExerciseUseCase } from '../default-exercises/create-exercise/create-exercise'

export function makeCreateExerciseUseCase() {
  const defaultExercisesRepository = new PrismaDefaultExercisesRepository()
  return new CreateExerciseUseCase(defaultExercisesRepository)
}
