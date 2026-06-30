import type { TrainmentTemplate } from '@prisma-client'
import type { TrainmentTemplatesRepository } from '@/repositories/trainment-templates-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'

interface UpdateTrainmentTemplateUseCaseRequest {
  userId: string
  trainmentTemplateId: string
  title: string
}

interface UpdateTrainmentTemplateUseCaseResponse {
  trainmentTemplate: TrainmentTemplate
}

export class UpdateTrainmentTemplateUseCase {
  constructor(
    private trainmentTemplatesRepository: TrainmentTemplatesRepository,
  ) {}

  async execute({
    userId,
    trainmentTemplateId,
    title,
  }: UpdateTrainmentTemplateUseCaseRequest): Promise<UpdateTrainmentTemplateUseCaseResponse> {
    const trainmentTemplate =
      await this.trainmentTemplatesRepository.findById(trainmentTemplateId)

    if (!trainmentTemplate) {
      throw new ResourceNotFoundError()
    }

    if (trainmentTemplate.user_id !== userId) {
      throw new NotAllowedError()
    }

    trainmentTemplate.title = title

    const updated =
      await this.trainmentTemplatesRepository.save(trainmentTemplate)

    return { trainmentTemplate: updated }
  }
}
