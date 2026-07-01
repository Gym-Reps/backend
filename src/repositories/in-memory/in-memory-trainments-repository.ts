import { randomUUID } from 'node:crypto'
import type { Prisma, Trainment } from '@prisma-client'
import type { TrainmentsRepository } from '../trainments-repository'

const PAGE_SIZE = 20

export class InMemoryTrainmentsRepository implements TrainmentsRepository {
  public items: Trainment[] = []

  async create(data: Prisma.TrainmentUncheckedCreateInput) {
    const trainment: Trainment = {
      id: data.id ?? randomUUID(),
      trainment_template_id: data.trainment_template_id,
      user_id: data.user_id,
      started_at: data.started_at ? new Date(data.started_at) : new Date(),
      finished_at: data.finished_at ? new Date(data.finished_at) : null,
    }

    this.items.push(trainment)

    return trainment
  }

  async findById(id: string) {
    return this.items.find((item) => item.id === id) ?? null
  }

  async findManyByUserId(
    userId: string,
    params: { trainmentTemplateId?: string; page: number },
  ) {
    return this.items
      .filter((item) => {
        if (item.user_id !== userId) {
          return false
        }

        if (
          params.trainmentTemplateId &&
          item.trainment_template_id !== params.trainmentTemplateId
        ) {
          return false
        }

        return true
      })
      .sort((a, b) => b.started_at.getTime() - a.started_at.getTime())
      .slice((params.page - 1) * PAGE_SIZE, params.page * PAGE_SIZE)
  }

  async findFinishedByUserIdInPeriod(userId: string, start: Date, end: Date) {
    return this.items
      .filter(
        (item) =>
          item.user_id === userId &&
          item.finished_at !== null &&
          item.finished_at >= start &&
          item.finished_at <= end,
      )
      .sort((a, b) => b.finished_at!.getTime() - a.finished_at!.getTime())
  }

  async findPreviousSameTemplate(params: {
    userId: string
    trainmentTemplateId: string
    before: Date
    excludeTrainmentId: string
  }) {
    return (
      this.items
        .filter(
          (item) =>
            item.user_id === params.userId &&
            item.trainment_template_id === params.trainmentTemplateId &&
            item.id !== params.excludeTrainmentId &&
            item.finished_at !== null &&
            item.started_at.getTime() < params.before.getTime(),
        )
        .sort((a, b) => b.started_at.getTime() - a.started_at.getTime())[0] ??
      null
    )
  }

  async save(trainment: Trainment) {
    const index = this.items.findIndex((item) => item.id === trainment.id)

    if (index >= 0) {
      this.items[index] = trainment
    }

    return trainment
  }
}
