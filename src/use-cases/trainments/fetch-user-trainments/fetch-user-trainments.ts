import type { Trainment } from '@prisma-client'
import type { TrainmentsRepository } from '@/repositories/trainments-repository'

interface FetchUserTrainmentsUseCaseRequest {
  userId: string
  trainmentTemplateId?: string
  page: number
}

interface FetchUserTrainmentsUseCaseResponse {
  trainments: Trainment[]
}

export class FetchUserTrainmentsUseCase {
  constructor(private trainmentsRepository: TrainmentsRepository) {}

  async execute({
    userId,
    trainmentTemplateId,
    page,
  }: FetchUserTrainmentsUseCaseRequest): Promise<FetchUserTrainmentsUseCaseResponse> {
    const trainments = await this.trainmentsRepository.findManyByUserId(userId, {
      page,
      ...(trainmentTemplateId ? { trainmentTemplateId } : {}),
    })

    return { trainments }
  }
}
