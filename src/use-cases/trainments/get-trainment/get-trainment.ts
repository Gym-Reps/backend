import type { Trainment } from '@prisma-client'
import type { TrainmentsRepository } from '@/repositories/trainments-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'

interface GetTrainmentUseCaseRequest {
  userId: string
  trainmentId: string
}

interface GetTrainmentUseCaseResponse {
  trainment: Trainment
}

export class GetTrainmentUseCase {
  constructor(private trainmentsRepository: TrainmentsRepository) {}

  async execute({
    userId,
    trainmentId,
  }: GetTrainmentUseCaseRequest): Promise<GetTrainmentUseCaseResponse> {
    const trainment = await this.trainmentsRepository.findById(trainmentId)

    if (!trainment) {
      throw new ResourceNotFoundError()
    }

    if (trainment.user_id !== userId) {
      throw new NotAllowedError()
    }

    return { trainment }
  }
}
