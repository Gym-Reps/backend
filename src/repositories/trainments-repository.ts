import type { Prisma, Trainment } from '@prisma-client'

export interface TrainmentsRepository {
  create(data: Prisma.TrainmentUncheckedCreateInput): Promise<Trainment>
  findById(id: string): Promise<Trainment | null>
  findManyByUserId(
    userId: string,
    params: { trainmentTemplateId?: string; page: number },
  ): Promise<Trainment[]>
  // finished sessions in [start, end] — powers weekly-progress
  findFinishedByUserIdInPeriod(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<Trainment[]>
  save(trainment: Trainment): Promise<Trainment>
}
