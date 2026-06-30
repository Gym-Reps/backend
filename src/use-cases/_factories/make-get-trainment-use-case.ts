import { PrismaTrainmentsRepository } from '@/repositories/prisma/prisma-trainments-repository'
import { GetTrainmentUseCase } from '../trainments/get-trainment/get-trainment'

export function makeGetTrainmentUseCase() {
  const trainmentsRepository = new PrismaTrainmentsRepository()
  return new GetTrainmentUseCase(trainmentsRepository)
}
