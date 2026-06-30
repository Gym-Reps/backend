import type { ExerciseTemplate } from '@prisma-client'
import type { DefaultExercisesRepository } from '@/repositories/default-exercises-repository'
import type { ExerciseTemplatesRepository } from '@/repositories/exercise-templates-repository'
import type { TrainmentTemplatesRepository } from '@/repositories/trainment-templates-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'

interface AddExerciseToTemplateUseCaseRequest {
  userId: string
  trainmentTemplateId: string
  exerciseCatalogId: string
}

interface AddExerciseToTemplateUseCaseResponse {
  exerciseTemplate: ExerciseTemplate
}

export class AddExerciseToTemplateUseCase {
  constructor(
    private exerciseTemplatesRepository: ExerciseTemplatesRepository,
    private trainmentTemplatesRepository: TrainmentTemplatesRepository,
    private defaultExercisesRepository: DefaultExercisesRepository,
  ) {}

  async execute({
    userId,
    trainmentTemplateId,
    exerciseCatalogId,
  }: AddExerciseToTemplateUseCaseRequest): Promise<AddExerciseToTemplateUseCaseResponse> {
    const trainmentTemplate =
      await this.trainmentTemplatesRepository.findById(trainmentTemplateId)

    if (!trainmentTemplate) {
      throw new ResourceNotFoundError()
    }

    if (trainmentTemplate.user_id !== userId) {
      throw new NotAllowedError()
    }

    const catalogExercise =
      await this.defaultExercisesRepository.findById(exerciseCatalogId)

    if (!catalogExercise) {
      throw new ResourceNotFoundError()
    }

    const exerciseTemplate = await this.exerciseTemplatesRepository.create({
      trainment_template_id: trainmentTemplateId,
      exercise_catalog_id: exerciseCatalogId,
      // title is snapshotted from the catalog at add-time (no later drift).
      title: catalogExercise.title,
    })

    // Editing the plan composition bumps the parent template (contract from 01).
    trainmentTemplate.updated_at = new Date()
    await this.trainmentTemplatesRepository.save(trainmentTemplate)

    return { exerciseTemplate }
  }
}
