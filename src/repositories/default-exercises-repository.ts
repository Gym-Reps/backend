import type { DefaultExercise, MuscleGroup, Prisma } from '@prisma-client'

export interface FindManyDefaultExercisesParams {
  query?: string
  muscleGroup?: MuscleGroup
  page: number
}

export interface DefaultExercisesRepository {
  findMany(
    params: FindManyDefaultExercisesParams,
  ): Promise<{ exercises: DefaultExercise[]; total: number }>
  findById(id: string): Promise<DefaultExercise | null>
  findBySlug(slug: string): Promise<DefaultExercise | null>
  create(
    data: Prisma.DefaultExerciseUncheckedCreateInput,
  ): Promise<DefaultExercise>
}
