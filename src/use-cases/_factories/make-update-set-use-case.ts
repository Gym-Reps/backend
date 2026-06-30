import { PrismaSetsRepository } from '@/repositories/prisma/prisma-sets-repository'
import { UpdateSetUseCase } from '../sets/update-set/update-set'

export function makeUpdateSetUseCase() {
  const setsRepository = new PrismaSetsRepository()
  return new UpdateSetUseCase(setsRepository)
}
