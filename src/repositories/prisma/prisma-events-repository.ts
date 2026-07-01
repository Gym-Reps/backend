import type { Prisma } from '@prisma-client'
import { prisma } from '@/lib/prisma'
import type { EventsRepository } from '../events-repository'

export class PrismaEventsRepository implements EventsRepository {
  async create(data: Prisma.EventUncheckedCreateInput) {
    return prisma.event.create({ data })
  }

  async findById(id: string) {
    return prisma.event.findUnique({ where: { id } })
  }

  async markProcessing(id: string) {
    await prisma.event.update({
      where: { id },
      data: { status: 'PROCESSING' },
    })
  }

  async markCompleted(id: string) {
    await prisma.event.update({
      where: { id },
      data: { status: 'COMPLETED', processed_at: new Date() },
    })
  }

  async markFailed(id: string, attempts: number, error: string) {
    await prisma.event.update({
      where: { id },
      data: {
        status: 'FAILED',
        attempts,
        last_error: error,
        processed_at: new Date(),
      },
    })
  }

  async findStalePending(olderThan: Date) {
    return prisma.event.findMany({
      where: { status: 'PENDING', created_at: { lte: olderThan } },
      orderBy: { created_at: 'asc' },
    })
  }
}
