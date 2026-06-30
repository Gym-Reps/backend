import { randomUUID } from 'node:crypto'
import type { Prisma, TrainmentTemplate } from '@prisma-client'
import type { TrainmentTemplatesRepository } from '../trainment-templates-repository'

export class InMemoryTrainmentTemplatesRepository
  implements TrainmentTemplatesRepository
{
  public items: TrainmentTemplate[] = []

  async create(data: Prisma.TrainmentTemplateUncheckedCreateInput) {
    const template: TrainmentTemplate = {
      id: data.id ?? randomUUID(),
      user_id: data.user_id,
      title: data.title,
      created_at: data.created_at ? new Date(data.created_at) : new Date(),
      updated_at: data.updated_at ? new Date(data.updated_at) : new Date(),
      deleted_at: data.deleted_at ? new Date(data.deleted_at) : null,
    }

    this.items.push(template)

    return template
  }

  async findById(id: string) {
    return (
      this.items.find(
        (item) => item.id === id && item.deleted_at === null,
      ) ?? null
    )
  }

  async findManyByUserId(userId: string) {
    return this.items.filter(
      (item) => item.user_id === userId && item.deleted_at === null,
    )
  }

  async save(template: TrainmentTemplate) {
    const index = this.items.findIndex((item) => item.id === template.id)

    if (index >= 0) {
      this.items[index] = template
    }

    return template
  }
}
