import type { Trainment } from '@prisma-client'
import type { TrainmentTemplatesRepository } from '@/repositories/trainment-templates-repository'
import type { TrainmentsRepository } from '@/repositories/trainments-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'

interface StartTrainmentUseCaseRequest {
  userId: string
  trainmentTemplateId: string
}

interface StartTrainmentUseCaseResponse {
  trainment: Trainment
}

export class StartTrainmentUseCase {
  constructor(
    private trainmentsRepository: TrainmentsRepository,
    private trainmentTemplatesRepository: TrainmentTemplatesRepository,
  ) {}

  async execute({
    userId,
    trainmentTemplateId,
  }: StartTrainmentUseCaseRequest): Promise<StartTrainmentUseCaseResponse> {
    // findById excludes soft-deleted templates, so a retired template can't
    // seed a new session (ResourceNotFoundError).
    const trainmentTemplate =
      await this.trainmentTemplatesRepository.findById(trainmentTemplateId)

    if (!trainmentTemplate) {
      throw new ResourceNotFoundError()
    }

    if (trainmentTemplate.user_id !== userId) {
      throw new NotAllowedError()
    }

    const trainment = await this.trainmentsRepository.create({
      trainment_template_id: trainmentTemplateId,
      user_id: userId,
    })

    return { trainment }
  }
}
