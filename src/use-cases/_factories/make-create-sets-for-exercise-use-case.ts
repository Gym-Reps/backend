import { PrismaSetsRepository } from '@/repositories/prisma/prisma-sets-repository'
import { CreateSetsForExerciseUseCase } from '../sets/create-sets-for-exercise/create-sets-for-exercise'

export function makeCreateSetsForExerciseUseCase() {
  const setsRepository = new PrismaSetsRepository()
  return new CreateSetsForExerciseUseCase(setsRepository)
}
