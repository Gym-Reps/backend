import { PrismaTrainmentTemplatesRepository } from '@/repositories/prisma/prisma-trainment-templates-repository'
import { CreateTrainmentTemplateUseCase } from '../trainment-templates/create-trainment-template/create-trainment-template'

export function makeCreateTrainmentTemplateUseCase() {
  const trainmentTemplatesRepository = new PrismaTrainmentTemplatesRepository()
  return new CreateTrainmentTemplateUseCase(trainmentTemplatesRepository)
}
