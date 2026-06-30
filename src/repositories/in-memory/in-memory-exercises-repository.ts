import { randomUUID } from 'node:crypto'
import type { Exercise, Prisma } from '@prisma-client'
import type { ExercisesRepository } from '../exercises-repository'

export class InMemoryExercisesRepository implements ExercisesRepository {
  public items: Exercise[] = []

  async create(data: Prisma.ExerciseUncheckedCreateInput) {
    const exercise: Exercise = {
      id: data.id ?? randomUUID(),
      exercise_template_id: data.exercise_template_id,
      trainment_id: data.trainment_id,
      planned_sets: (data.planned_sets ?? {}) as Exercise['planned_sets'],
      created_at: data.created_at ? new Date(data.created_at) : new Date(),
    }

    this.items.push(exercise)

    return exercise
  }

  async findById(id: string) {
    return this.items.find((item) => item.id === id) ?? null
  }

  async findManyByTrainmentId(trainmentId: string) {
    return this.items
      .filter((item) => item.trainment_id === trainmentId)
      .sort((a, b) => a.created_at.getTime() - b.created_at.getTime())
  }

  async save(exercise: Exercise) {
    const index = this.items.findIndex((item) => item.id === exercise.id)

    if (index >= 0) {
      this.items[index] = exercise
    }

    return exercise
  }

  async delete(id: string) {
    this.items = this.items.filter((item) => item.id !== id)
  }
}
