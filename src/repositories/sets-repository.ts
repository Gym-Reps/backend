import type { Prisma, Set as SetModel } from '@prisma-client'

export interface SetsRepository {
  createMany(data: Prisma.SetUncheckedCreateInput[]): Promise<SetModel[]>
  findById(id: string): Promise<SetModel | null>
  findManyByExerciseId(exerciseId: string): Promise<SetModel[]> // ordered by index
  findManyByTrainmentId(trainmentId: string): Promise<SetModel[]>
  countByExerciseId(exerciseId: string): Promise<number>
  save(set: SetModel): Promise<SetModel>
  delete(id: string): Promise<void>
  deleteManyByExerciseId(exerciseId: string): Promise<void>
}
