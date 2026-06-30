import { PrismaDefaultExercisesRepository } from '@/repositories/prisma/prisma-default-exercises-repository'
import { SearchExercisesUseCase } from '../default-exercises/search-exercises/search-exercises'

export function makeSearchExercisesUseCase() {
  const defaultExercisesRepository = new PrismaDefaultExercisesRepository()
  return new SearchExercisesUseCase(defaultExercisesRepository)
}
