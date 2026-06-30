import type { ExerciseTemplate, Prisma } from '@prisma-client'
import { prisma } from '@/lib/prisma'
import type { ExerciseTemplatesRepository } from '../exercise-templates-repository'

export class PrismaExerciseTemplatesRepository
  implements ExerciseTemplatesRepository
{
  async create(data: Prisma.ExerciseTemplateUncheckedCreateInput) {
    return prisma.exerciseTemplate.create({ data })
  }

  async findById(id: string) {
    return prisma.exerciseTemplate.findFirst({
      where: { id, deleted_at: null },
    })
  }

  async findManyByTemplateId(templateId: string) {
    return prisma.exerciseTemplate.findMany({
      where: { trainment_template_id: templateId, deleted_at: null },
      orderBy: { created_at: 'asc' },
    })
  }

  async save(exerciseTemplate: ExerciseTemplate) {
    return prisma.exerciseTemplate.update({
      where: { id: exerciseTemplate.id },
      data: exerciseTemplate,
    })
  }
}
