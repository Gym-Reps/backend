import type { Exercise, Prisma } from '@prisma-client'

export interface ExercisesRepository {
  create(data: Prisma.ExerciseUncheckedCreateInput): Promise<Exercise>
  findById(id: string): Promise<Exercise | null>
  findManyByTrainmentId(trainmentId: string): Promise<Exercise[]>
  save(exercise: Exercise): Promise<Exercise> // planned_sets edits (06 add/remove set)
  delete(id: string): Promise<void> // sets are removed by the caller first
}
