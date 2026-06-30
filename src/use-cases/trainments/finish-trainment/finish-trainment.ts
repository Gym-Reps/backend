import type { Trainment } from '@prisma-client'
import type { TrainmentsRepository } from '@/repositories/trainments-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'
import { TrainmentAlreadyFinishedError } from '../../errors/trainment-already-finished-error'

interface FinishTrainmentUseCaseRequest {
  userId: string
  trainmentId: string
}

interface FinishTrainmentUseCaseResponse {
  trainment: Trainment
}

export class FinishTrainmentUseCase {
  constructor(private trainmentsRepository: TrainmentsRepository) {}

  async execute({
    userId,
    trainmentId,
  }: FinishTrainmentUseCaseRequest): Promise<FinishTrainmentUseCaseResponse> {
    const trainment = await this.trainmentsRepository.findById(trainmentId)

    if (!trainment) {
      throw new ResourceNotFoundError()
    }

    if (trainment.user_id !== userId) {
      throw new NotAllowedError()
    }

    if (trainment.finished_at !== null) {
      throw new TrainmentAlreadyFinishedError()
    }

    trainment.finished_at = new Date()

    const finished = await this.trainmentsRepository.save(trainment)

    // TODO(08_EVENTS_MODULE): enqueue a COMPUTE_TRAINMENT_METRICS event
    // ({ trainmentId }) inside the same transaction so 09_METRICS computes
    // asynchronously. Deferred until the events module exists.

    return { trainment: finished }
  }
}
