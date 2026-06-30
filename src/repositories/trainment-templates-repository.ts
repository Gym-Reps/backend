import type { Prisma, TrainmentTemplate } from '@prisma-client'

export interface TrainmentTemplatesRepository {
  create(
    data: Prisma.TrainmentTemplateUncheckedCreateInput,
  ): Promise<TrainmentTemplate>
  findById(id: string): Promise<TrainmentTemplate | null> // excludes soft-deleted
  findManyByUserId(userId: string): Promise<TrainmentTemplate[]> // active only
  save(template: TrainmentTemplate): Promise<TrainmentTemplate> // rename + soft-delete
}
