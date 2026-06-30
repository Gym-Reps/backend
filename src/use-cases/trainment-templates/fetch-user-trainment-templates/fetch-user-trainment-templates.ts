import type { TrainmentTemplate } from '@prisma-client'
import type { TrainmentTemplatesRepository } from '@/repositories/trainment-templates-repository'

interface FetchUserTrainmentTemplatesUseCaseRequest {
  userId: string
}

interface FetchUserTrainmentTemplatesUseCaseResponse {
  trainmentTemplates: TrainmentTemplate[]
}

export class FetchUserTrainmentTemplatesUseCase {
  constructor(
    private trainmentTemplatesRepository: TrainmentTemplatesRepository,
  ) {}

  async execute({
    userId,
  }: FetchUserTrainmentTemplatesUseCaseRequest): Promise<FetchUserTrainmentTemplatesUseCaseResponse> {
    const trainmentTemplates =
      await this.trainmentTemplatesRepository.findManyByUserId(userId)

    return { trainmentTemplates }
  }
}
