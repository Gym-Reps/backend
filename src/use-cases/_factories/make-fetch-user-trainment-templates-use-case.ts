import { PrismaTrainmentTemplatesRepository } from '@/repositories/prisma/prisma-trainment-templates-repository'
import { FetchUserTrainmentTemplatesUseCase } from '../trainment-templates/fetch-user-trainment-templates/fetch-user-trainment-templates'

export function makeFetchUserTrainmentTemplatesUseCase() {
  const trainmentTemplatesRepository = new PrismaTrainmentTemplatesRepository()
  return new FetchUserTrainmentTemplatesUseCase(trainmentTemplatesRepository)
}
