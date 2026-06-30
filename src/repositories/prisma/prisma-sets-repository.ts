import type { Prisma, Set as SetModel } from '@prisma-client'
import { prisma } from '@/lib/prisma'
import type { SetsRepository } from '../sets-repository'

export class PrismaSetsRepository implements SetsRepository {
  async createMany(data: Prisma.SetUncheckedCreateInput[]) {
    return prisma.set.createManyAndReturn({ data })
  }

  async findById(id: string) {
    return prisma.set.findUnique({ where: { id } })
  }

  async findManyByExerciseId(exerciseId: string) {
    return prisma.set.findMany({
      where: { exercise_id: exerciseId },
      orderBy: { index: 'asc' },
    })
  }

  async findManyByTrainmentId(trainmentId: string) {
    return prisma.set.findMany({
      where: { trainment_id: trainmentId },
      orderBy: { index: 'asc' },
    })
  }

  async countByExerciseId(exerciseId: string) {
    return prisma.set.count({ where: { exercise_id: exerciseId } })
  }

  async save(set: SetModel) {
    return prisma.set.update({ where: { id: set.id }, data: set })
  }

  async delete(id: string) {
    await prisma.set.delete({ where: { id } })
  }

  async deleteManyByExerciseId(exerciseId: string) {
    await prisma.set.deleteMany({ where: { exercise_id: exerciseId } })
  }
}
