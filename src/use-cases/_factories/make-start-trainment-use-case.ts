import { PrismaTrainmentTemplatesRepository } from '@/repositories/prisma/prisma-trainment-templates-repository'
import { PrismaTrainmentsRepository } from '@/repositories/prisma/prisma-trainments-repository'
import { StartTrainmentUseCase } from '../trainments/start-trainment/start-trainment'

export function makeStartTrainmentUseCase() {
  const trainmentsRepository = new PrismaTrainmentsRepository()
  const trainmentTemplatesRepository = new PrismaTrainmentTemplatesRepository()
  return new StartTrainmentUseCase(
    trainmentsRepository,
    trainmentTemplatesRepository,
  )
}
