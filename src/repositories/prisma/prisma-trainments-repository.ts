import type { Prisma, Trainment } from '@prisma-client'
import { prisma } from '@/lib/prisma'
import type { TrainmentsRepository } from '../trainments-repository'

const PAGE_SIZE = 20

export class PrismaTrainmentsRepository implements TrainmentsRepository {
  async create(data: Prisma.TrainmentUncheckedCreateInput) {
    return prisma.trainment.create({ data })
  }

  async findById(id: string) {
    return prisma.trainment.findUnique({ where: { id } })
  }

  async findManyByUserId(
    userId: string,
    params: { trainmentTemplateId?: string; page: number },
  ) {
    return prisma.trainment.findMany({
      where: {
        user_id: userId,
        ...(params.trainmentTemplateId
          ? { trainment_template_id: params.trainmentTemplateId }
          : {}),
      },
      orderBy: { started_at: 'desc' },
      take: PAGE_SIZE,
      skip: (params.page - 1) * PAGE_SIZE,
    })
  }

  async findFinishedByUserIdInPeriod(userId: string, start: Date, end: Date) {
    return prisma.trainment.findMany({
      where: {
        user_id: userId,
        finished_at: { not: null, gte: start, lte: end },
      },
      orderBy: { finished_at: 'desc' },
    })
  }

  async save(trainment: Trainment) {
    return prisma.trainment.update({
      where: { id: trainment.id },
      data: trainment,
    })
  }
}
