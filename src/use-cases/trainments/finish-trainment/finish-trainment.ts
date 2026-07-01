import type { Trainment } from '@prisma-client'
import type { TrainmentsRepository } from '@/repositories/trainments-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'
import { TrainmentAlreadyFinishedError } from '../../errors/trainment-already-finished-error'
import type { EnqueueEventUseCase } from '../../events/enqueue-event/enqueue-event'

interface FinishTrainmentUseCaseRequest {
  userId: string
  trainmentId: string
}

interface FinishTrainmentUseCaseResponse {
  trainment: Trainment
}

export class FinishTrainmentUseCase {
  constructor(
    private trainmentsRepository: TrainmentsRepository,
    private enqueueEventUseCase: EnqueueEventUseCase,
  ) {}

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

    // Outbox: persist a COMPUTE_TRAINMENT_METRICS event (PENDING) and enqueue its
    // job so 09_METRICS computes asynchronously off the request path. The row is
    // the durable anchor; the queue add is best-effort (sweeper backstops).
    await this.enqueueEventUseCase.execute({
      eventType: 'COMPUTE_TRAINMENT_METRICS',
      userId,
      metadata: { trainmentId: finished.id },
    })

    return { trainment: finished }
  }
}
