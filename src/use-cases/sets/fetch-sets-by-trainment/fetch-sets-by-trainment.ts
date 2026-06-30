import type { Set as SetModel } from '@prisma-client'
import type { SetsRepository } from '@/repositories/sets-repository'
import type { TrainmentsRepository } from '@/repositories/trainments-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'

interface FetchSetsByTrainmentUseCaseRequest {
  userId: string
  trainmentId: string
}

interface FetchSetsByTrainmentUseCaseResponse {
  sets: SetModel[]
}

export class FetchSetsByTrainmentUseCase {
  constructor(
    private setsRepository: SetsRepository,
    private trainmentsRepository: TrainmentsRepository,
  ) {}

  async execute({
    userId,
    trainmentId,
  }: FetchSetsByTrainmentUseCaseRequest): Promise<FetchSetsByTrainmentUseCaseResponse> {
    const trainment = await this.trainmentsRepository.findById(trainmentId)

    if (!trainment) {
      throw new ResourceNotFoundError()
    }

    if (trainment.user_id !== userId) {
      throw new NotAllowedError()
    }

    const sets = await this.setsRepository.findManyByTrainmentId(trainmentId)

    return { sets }
  }
}
