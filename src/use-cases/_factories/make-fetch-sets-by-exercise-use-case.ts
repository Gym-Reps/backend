import { PrismaSetsRepository } from '@/repositories/prisma/prisma-sets-repository'
import { FetchSetsByExerciseUseCase } from '../sets/fetch-sets-by-exercise/fetch-sets-by-exercise'

export function makeFetchSetsByExerciseUseCase() {
  const setsRepository = new PrismaSetsRepository()
  return new FetchSetsByExerciseUseCase(setsRepository)
}
