import type { TrainmentTemplate } from '@prisma-client'
import type { TrainmentTemplatesRepository } from '@/repositories/trainment-templates-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'

interface GetTrainmentTemplateUseCaseRequest {
  userId: string
  trainmentTemplateId: string
}

interface GetTrainmentTemplateUseCaseResponse {
  trainmentTemplate: TrainmentTemplate
}

export class GetTrainmentTemplateUseCase {
  constructor(
    private trainmentTemplatesRepository: TrainmentTemplatesRepository,
  ) {}

  async execute({
    userId,
    trainmentTemplateId,
  }: GetTrainmentTemplateUseCaseRequest): Promise<GetTrainmentTemplateUseCaseResponse> {
    const trainmentTemplate =
      await this.trainmentTemplatesRepository.findById(trainmentTemplateId)

    if (!trainmentTemplate) {
      throw new ResourceNotFoundError()
    }

    if (trainmentTemplate.user_id !== userId) {
      throw new NotAllowedError()
    }

    return { trainmentTemplate }
  }
}
