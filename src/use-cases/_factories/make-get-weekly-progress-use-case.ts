import { PrismaTrainmentsRepository } from '@/repositories/prisma/prisma-trainments-repository'
import { GetWeeklyProgressUseCase } from '../trainments/get-weekly-progress/get-weekly-progress'

export function makeGetWeeklyProgressUseCase() {
  const trainmentsRepository = new PrismaTrainmentsRepository()
  return new GetWeeklyProgressUseCase(trainmentsRepository)
}
