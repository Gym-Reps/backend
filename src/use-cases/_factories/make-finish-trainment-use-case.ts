import { PrismaTrainmentsRepository } from '@/repositories/prisma/prisma-trainments-repository'
import { FinishTrainmentUseCase } from '../trainments/finish-trainment/finish-trainment'
import { makeEnqueueEventUseCase } from './make-enqueue-event-use-case'

export function makeFinishTrainmentUseCase() {
  const trainmentsRepository = new PrismaTrainmentsRepository()
  return new FinishTrainmentUseCase(
    trainmentsRepository,
    makeEnqueueEventUseCase(),
  )
}
