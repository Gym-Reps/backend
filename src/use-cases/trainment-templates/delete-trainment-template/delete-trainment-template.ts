import type { TrainmentTemplatesRepository } from '@/repositories/trainment-templates-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'

interface DeleteTrainmentTemplateUseCaseRequest {
  userId: string
  trainmentTemplateId: string
}

export class DeleteTrainmentTemplateUseCase {
  constructor(
    private trainmentTemplatesRepository: TrainmentTemplatesRepository,
  ) {}

  async execute({
    userId,
    trainmentTemplateId,
  }: DeleteTrainmentTemplateUseCaseRequest): Promise<void> {
    const trainmentTemplate =
      await this.trainmentTemplatesRepository.findById(trainmentTemplateId)

    if (!trainmentTemplate) {
      throw new ResourceNotFoundError()
    }

    if (trainmentTemplate.user_id !== userId) {
      throw new NotAllowedError()
    }

    // Soft delete: keep the row so historical trainments still resolve it.
    trainmentTemplate.deleted_at = new Date()

    await this.trainmentTemplatesRepository.save(trainmentTemplate)
  }
}
