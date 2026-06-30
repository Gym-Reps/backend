import { PrismaTrainmentsRepository } from '@/repositories/prisma/prisma-trainments-repository'
import { FetchUserTrainmentsUseCase } from '../trainments/fetch-user-trainments/fetch-user-trainments'

export function makeFetchUserTrainmentsUseCase() {
  const trainmentsRepository = new PrismaTrainmentsRepository()
  return new FetchUserTrainmentsUseCase(trainmentsRepository)
}
