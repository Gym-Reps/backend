import type { DefaultExercise, MuscleGroup } from '@prisma-client'
import type { DefaultExercisesRepository } from '@/repositories/default-exercises-repository'
import { ExerciseAlreadyExistsError } from '../../errors/exercise-already-exists-error'
import { slugify } from '../../_utils/slugify'

interface CreateExerciseUseCaseRequest {
  title: string
  muscleGroup: MuscleGroup
  imagePath: string
  slug?: string
}

interface CreateExerciseUseCaseResponse {
  exercise: DefaultExercise
}

export class CreateExerciseUseCase {
  constructor(
    private defaultExercisesRepository: DefaultExercisesRepository,
  ) {}

  async execute({
    title,
    muscleGroup,
    imagePath,
    slug,
  }: CreateExerciseUseCaseRequest): Promise<CreateExerciseUseCaseResponse> {
    const finalSlug = slug ?? slugify(title)

    const existing =
      await this.defaultExercisesRepository.findBySlug(finalSlug)

    if (existing) {
      throw new ExerciseAlreadyExistsError()
    }

    const exercise = await this.defaultExercisesRepository.create({
      title,
      slug: finalSlug,
      muscle_group: muscleGroup,
      image_path: imagePath,
    })

    return { exercise }
  }
}
