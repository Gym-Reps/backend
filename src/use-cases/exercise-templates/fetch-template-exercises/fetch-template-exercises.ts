import type { ExerciseTemplate } from '@prisma-client'
import type { ExerciseTemplatesRepository } from '@/repositories/exercise-templates-repository'
import type { TrainmentTemplatesRepository } from '@/repositories/trainment-templates-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'

interface FetchTemplateExercisesUseCaseRequest {
  userId: string
  trainmentTemplateId: string
}

interface FetchTemplateExercisesUseCaseResponse {
  exerciseTemplates: ExerciseTemplate[]
}

export class FetchTemplateExercisesUseCase {
  constructor(
    private exerciseTemplatesRepository: ExerciseTemplatesRepository,
    private trainmentTemplatesRepository: TrainmentTemplatesRepository,
  ) {}

  async execute({
    userId,
    trainmentTemplateId,
  }: FetchTemplateExercisesUseCaseRequest): Promise<FetchTemplateExercisesUseCaseResponse> {
    const trainmentTemplate =
      await this.trainmentTemplatesRepository.findById(trainmentTemplateId)

    if (!trainmentTemplate) {
      throw new ResourceNotFoundError()
    }

    if (trainmentTemplate.user_id !== userId) {
      throw new NotAllowedError()
    }

    const exerciseTemplates =
      await this.exerciseTemplatesRepository.findManyByTemplateId(
        trainmentTemplateId,
      )

    return { exerciseTemplates }
  }
}
