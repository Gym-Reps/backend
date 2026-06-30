import { PrismaExercisesRepository } from '@/repositories/prisma/prisma-exercises-repository'
import { PrismaSetsRepository } from '@/repositories/prisma/prisma-sets-repository'
import { RemoveSetFromExerciseUseCase } from '../sets/remove-set-from-exercise/remove-set-from-exercise'

export function makeRemoveSetFromExerciseUseCase() {
  const setsRepository = new PrismaSetsRepository()
  const exercisesRepository = new PrismaExercisesRepository()
  return new RemoveSetFromExerciseUseCase(setsRepository, exercisesRepository)
}
