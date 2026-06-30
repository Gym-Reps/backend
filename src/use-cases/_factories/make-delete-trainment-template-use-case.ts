import { PrismaTrainmentTemplatesRepository } from '@/repositories/prisma/prisma-trainment-templates-repository'
import { DeleteTrainmentTemplateUseCase } from '../trainment-templates/delete-trainment-template/delete-trainment-template'

export function makeDeleteTrainmentTemplateUseCase() {
  const trainmentTemplatesRepository = new PrismaTrainmentTemplatesRepository()
  return new DeleteTrainmentTemplateUseCase(trainmentTemplatesRepository)
}
