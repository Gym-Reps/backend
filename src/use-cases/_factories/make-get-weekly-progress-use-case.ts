import { PrismaTrainmentsRepository } from '@/repositories/prisma/prisma-trainments-repository'
import { PrismaUserPreferencesRepository } from '@/repositories/prisma/prisma-user-preferences-repository'
import { GetWeeklyProgressUseCase } from '../trainments/get-weekly-progress/get-weekly-progress'

export function makeGetWeeklyProgressUseCase() {
  const trainmentsRepository = new PrismaTrainmentsRepository()
  const userPreferencesRepository = new PrismaUserPreferencesRepository()
  return new GetWeeklyProgressUseCase(
    trainmentsRepository,
    userPreferencesRepository,
  )
}
