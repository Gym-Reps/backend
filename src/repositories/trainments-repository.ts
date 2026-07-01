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
  // The immediately-preceding finished session of the same template (09_METRICS):
  // most recent finished trainment for the user with the same template that
  // started before `before`. Null on the first-ever session.
  findPreviousSameTemplate(params: {
    userId: string
    trainmentTemplateId: string
    before: Date
    excludeTrainmentId: string
  }): Promise<Trainment | null>
  save(trainment: Trainment): Promise<Trainment>
}
