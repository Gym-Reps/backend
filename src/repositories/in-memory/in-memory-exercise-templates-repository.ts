import { randomUUID } from 'node:crypto'
import type { ExerciseTemplate, Prisma } from '@prisma-client'
import type { ExerciseTemplatesRepository } from '../exercise-templates-repository'

export class InMemoryExerciseTemplatesRepository
  implements ExerciseTemplatesRepository
{
  public items: ExerciseTemplate[] = []

  async create(data: Prisma.ExerciseTemplateUncheckedCreateInput) {
    const exerciseTemplate: ExerciseTemplate = {
      id: data.id ?? randomUUID(),
      trainment_template_id: data.trainment_template_id,
      exercise_catalog_id: data.exercise_catalog_id,
      title: data.title,
      created_at: data.created_at ? new Date(data.created_at) : new Date(),
      deleted_at: data.deleted_at ? new Date(data.deleted_at) : null,
    }

    this.items.push(exerciseTemplate)

    return exerciseTemplate
  }

  async findById(id: string) {
    return (
      this.items.find(
        (item) => item.id === id && item.deleted_at === null,
      ) ?? null
    )
  }

  async findManyByTemplateId(templateId: string) {
    return this.items.filter(
      (item) =>
        item.trainment_template_id === templateId && item.deleted_at === null,
    )
  }

  async save(exerciseTemplate: ExerciseTemplate) {
    const index = this.items.findIndex(
      (item) => item.id === exerciseTemplate.id,
    )

    if (index >= 0) {
      this.items[index] = exerciseTemplate
    }

    return exerciseTemplate
  }
}
