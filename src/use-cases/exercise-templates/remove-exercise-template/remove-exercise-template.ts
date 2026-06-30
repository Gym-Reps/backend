import type { ExerciseTemplatesRepository } from '@/repositories/exercise-templates-repository'
import type { TrainmentTemplatesRepository } from '@/repositories/trainment-templates-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'

interface RemoveExerciseTemplateUseCaseRequest {
  userId: string
  exerciseTemplateId: string
}

export class RemoveExerciseTemplateUseCase {
  constructor(
    private exerciseTemplatesRepository: ExerciseTemplatesRepository,
    private trainmentTemplatesRepository: TrainmentTemplatesRepository,
  ) {}

  async execute({
    userId,
    exerciseTemplateId,
  }: RemoveExerciseTemplateUseCaseRequest): Promise<void> {
    const exerciseTemplate =
      await this.exerciseTemplatesRepository.findById(exerciseTemplateId)

    if (!exerciseTemplate) {
      throw new ResourceNotFoundError()
    }

    const trainmentTemplate =
      await this.trainmentTemplatesRepository.findById(
        exerciseTemplate.trainment_template_id,
      )

    if (!trainmentTemplate) {
      throw new ResourceNotFoundError()
    }

    if (trainmentTemplate.user_id !== userId) {
      throw new NotAllowedError()
    }

    // Soft-delete keeps past performed exercises that reference this slot.
    exerciseTemplate.deleted_at = new Date()
    await this.exerciseTemplatesRepository.save(exerciseTemplate)

    trainmentTemplate.updated_at = new Date()
    await this.trainmentTemplatesRepository.save(trainmentTemplate)
  }
}
