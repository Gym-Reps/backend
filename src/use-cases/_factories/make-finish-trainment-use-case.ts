import { PrismaTrainmentsRepository } from '@/repositories/prisma/prisma-trainments-repository'
import { FinishTrainmentUseCase } from '../trainments/finish-trainment/finish-trainment'

export function makeFinishTrainmentUseCase() {
  const trainmentsRepository = new PrismaTrainmentsRepository()
  return new FinishTrainmentUseCase(trainmentsRepository)
}
