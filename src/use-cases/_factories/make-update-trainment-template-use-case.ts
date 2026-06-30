import { PrismaTrainmentTemplatesRepository } from '@/repositories/prisma/prisma-trainment-templates-repository'
import { UpdateTrainmentTemplateUseCase } from '../trainment-templates/update-trainment-template/update-trainment-template'

export function makeUpdateTrainmentTemplateUseCase() {
  const trainmentTemplatesRepository = new PrismaTrainmentTemplatesRepository()
  return new UpdateTrainmentTemplateUseCase(trainmentTemplatesRepository)
}
