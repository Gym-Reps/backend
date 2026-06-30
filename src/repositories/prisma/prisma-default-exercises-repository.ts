import type { Prisma } from '@prisma-client'
import { prisma } from '@/lib/prisma'
import type {
  DefaultExercisesRepository,
  FindManyDefaultExercisesParams,
} from '../default-exercises-repository'

const PAGE_SIZE = 20

export class PrismaDefaultExercisesRepository
  implements DefaultExercisesRepository
{
  async findMany({ query, muscleGroup, page }: FindManyDefaultExercisesParams) {
    const where: Prisma.DefaultExerciseWhereInput = {
      ...(query
        ? { title: { contains: query, mode: 'insensitive' } }
        : {}),
      ...(muscleGroup ? { muscle_group: muscleGroup } : {}),
    }

    const [exercises, total] = await Promise.all([
      prisma.defaultExercise.findMany({
        where,
        orderBy: { title: 'asc' },
        take: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE,
      }),
      prisma.defaultExercise.count({ where }),
    ])

    return { exercises, total }
  }

  async findById(id: string) {
    return prisma.defaultExercise.findUnique({ where: { id } })
  }

  async findBySlug(slug: string) {
    return prisma.defaultExercise.findUnique({ where: { slug } })
  }

  async create(data: Prisma.DefaultExerciseUncheckedCreateInput) {
    return prisma.defaultExercise.create({ data })
  }
}
