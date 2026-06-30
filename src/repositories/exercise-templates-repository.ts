import type { ExerciseTemplate, Prisma } from '@prisma-client'

export interface ExerciseTemplatesRepository {
  create(
    data: Prisma.ExerciseTemplateUncheckedCreateInput,
  ): Promise<ExerciseTemplate>
  findById(id: string): Promise<ExerciseTemplate | null> // excludes soft-deleted
  findManyByTemplateId(templateId: string): Promise<ExerciseTemplate[]> // active
  save(exerciseTemplate: ExerciseTemplate): Promise<ExerciseTemplate> // soft-delete
}
