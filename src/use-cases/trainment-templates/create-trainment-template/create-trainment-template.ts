import type { TrainmentTemplate } from '@prisma-client'
import type { TrainmentTemplatesRepository } from '@/repositories/trainment-templates-repository'

interface CreateTrainmentTemplateUseCaseRequest {
  userId: string
  title: string
}

interface CreateTrainmentTemplateUseCaseResponse {
  trainmentTemplate: TrainmentTemplate
}

export class CreateTrainmentTemplateUseCase {
  constructor(
    private trainmentTemplatesRepository: TrainmentTemplatesRepository,
  ) {}

  async execute({
    userId,
    title,
  }: CreateTrainmentTemplateUseCaseRequest): Promise<CreateTrainmentTemplateUseCaseResponse> {
    const trainmentTemplate = await this.trainmentTemplatesRepository.create({
      user_id: userId,
      title,
    })

    return { trainmentTemplate }
  }
}
