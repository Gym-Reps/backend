import { randomUUID } from 'node:crypto'
import type { Prisma, Set as SetModel } from '@prisma-client'
import type { SetsRepository } from '../sets-repository'

export class InMemorySetsRepository implements SetsRepository {
  public items: SetModel[] = []

  async createMany(data: Prisma.SetUncheckedCreateInput[]) {
    const created = data.map((item) => {
      const set: SetModel = {
        id: item.id ?? randomUUID(),
        trainment_id: item.trainment_id,
        exercise_id: item.exercise_id,
        user_id: item.user_id,
        index: item.index,
        weight: item.weight ?? null,
        repetitions: item.repetitions ?? null,
        performed_at: item.performed_at
          ? new Date(item.performed_at)
          : new Date(),
      }

      return set
    })

    this.items.push(...created)

    return created
  }

  async findById(id: string) {
    return this.items.find((item) => item.id === id) ?? null
  }

  async findManyByExerciseId(exerciseId: string) {
    return this.items
      .filter((item) => item.exercise_id === exerciseId)
      .sort((a, b) => a.index - b.index)
  }

  async findManyByTrainmentId(trainmentId: string) {
    return this.items
      .filter((item) => item.trainment_id === trainmentId)
      .sort((a, b) => a.index - b.index)
  }

  async countByExerciseId(exerciseId: string) {
    return this.items.filter((item) => item.exercise_id === exerciseId).length
  }

  async save(set: SetModel) {
    const index = this.items.findIndex((item) => item.id === set.id)

    if (index >= 0) {
      this.items[index] = set
    }

    return set
  }

  async delete(id: string) {
    this.items = this.items.filter((item) => item.id !== id)
  }

  async deleteManyByExerciseId(exerciseId: string) {
    this.items = this.items.filter((item) => item.exercise_id !== exerciseId)
  }
}
