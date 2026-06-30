import { PrismaSetsRepository } from '@/repositories/prisma/prisma-sets-repository'
import { PrismaTrainmentsRepository } from '@/repositories/prisma/prisma-trainments-repository'
import { FetchSetsByTrainmentUseCase } from '../sets/fetch-sets-by-trainment/fetch-sets-by-trainment'

export function makeFetchSetsByTrainmentUseCase() {
  const setsRepository = new PrismaSetsRepository()
  const trainmentsRepository = new PrismaTrainmentsRepository()
  return new FetchSetsByTrainmentUseCase(setsRepository, trainmentsRepository)
}
