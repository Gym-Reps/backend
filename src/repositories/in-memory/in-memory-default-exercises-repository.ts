import { randomUUID } from 'node:crypto'
import type { DefaultExercise, Prisma } from '@prisma-client'
import type {
  DefaultExercisesRepository,
  FindManyDefaultExercisesParams,
} from '../default-exercises-repository'

const PAGE_SIZE = 20

export class InMemoryDefaultExercisesRepository
  implements DefaultExercisesRepository
{
  public items: DefaultExercise[] = []

  async findMany({ query, muscleGroup, page }: FindManyDefaultExercisesParams) {
    const filtered = this.items.filter((item) => {
      if (
        query &&
        !item.title.toLowerCase().includes(query.toLowerCase())
      ) {
        return false
      }

      if (muscleGroup && item.muscle_group !== muscleGroup) {
        return false
      }

      return true
    })

    const exercises = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    return { exercises, total: filtered.length }
  }

  async findById(id: string) {
    return this.items.find((item) => item.id === id) ?? null
  }

  async findBySlug(slug: string) {
    return this.items.find((item) => item.slug === slug) ?? null
  }

  async create(data: Prisma.DefaultExerciseUncheckedCreateInput) {
    const exercise: DefaultExercise = {
      id: data.id ?? randomUUID(),
      title: data.title,
      slug: data.slug,
      muscle_group: data.muscle_group,
      image_path: data.image_path,
      created_at: data.created_at ? new Date(data.created_at) : new Date(),
      updated_at: data.updated_at ? new Date(data.updated_at) : new Date(),
    }

    this.items.push(exercise)

    return exercise
  }
}
