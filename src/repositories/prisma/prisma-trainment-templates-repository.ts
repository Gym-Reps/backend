import type { Prisma, TrainmentTemplate } from '@prisma-client'
import { prisma } from '@/lib/prisma'
import type { TrainmentTemplatesRepository } from '../trainment-templates-repository'

export class PrismaTrainmentTemplatesRepository
  implements TrainmentTemplatesRepository
{
  async create(data: Prisma.TrainmentTemplateUncheckedCreateInput) {
    return prisma.trainmentTemplate.create({ data })
  }

  async findById(id: string) {
    return prisma.trainmentTemplate.findFirst({
      where: { id, deleted_at: null },
    })
  }

  async findManyByUserId(userId: string) {
    return prisma.trainmentTemplate.findMany({
      where: { user_id: userId, deleted_at: null },
      orderBy: { created_at: 'desc' },
    })
  }

  async save(template: TrainmentTemplate) {
    return prisma.trainmentTemplate.update({
      where: { id: template.id },
      data: template,
    })
  }
}
