import type { Exercise, Prisma } from '@prisma-client'
import { prisma } from '@/lib/prisma'
import type { ExercisesRepository } from '../exercises-repository'

export class PrismaExercisesRepository implements ExercisesRepository {
  async create(data: Prisma.ExerciseUncheckedCreateInput) {
    return prisma.exercise.create({ data })
  }

  async findById(id: string) {
    return prisma.exercise.findUnique({ where: { id } })
  }

  async findManyByTrainmentId(trainmentId: string) {
    return prisma.exercise.findMany({
      where: { trainment_id: trainmentId },
      orderBy: { created_at: 'asc' },
    })
  }

  async save(exercise: Exercise) {
    // planned_sets is the only mutable field (06 add/remove set).
    return prisma.exercise.update({
      where: { id: exercise.id },
      data: {
        planned_sets: exercise.planned_sets as unknown as Prisma.InputJsonValue,
      },
    })
  }

  async delete(id: string) {
    await prisma.exercise.delete({ where: { id } })
  }
}
