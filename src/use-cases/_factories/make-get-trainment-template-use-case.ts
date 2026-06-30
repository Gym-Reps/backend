import { PrismaTrainmentTemplatesRepository } from '@/repositories/prisma/prisma-trainment-templates-repository'
import { GetTrainmentTemplateUseCase } from '../trainment-templates/get-trainment-template/get-trainment-template'

export function makeGetTrainmentTemplateUseCase() {
  const trainmentTemplatesRepository = new PrismaTrainmentTemplatesRepository()
  return new GetTrainmentTemplateUseCase(trainmentTemplatesRepository)
}
