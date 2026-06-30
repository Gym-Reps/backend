import type { DefaultExercise, MuscleGroup } from '@prisma-client'
import type { DefaultExercisesRepository } from '@/repositories/default-exercises-repository'

interface SearchExercisesUseCaseRequest {
  query?: string
  muscleGroup?: MuscleGroup
  page: number
}

interface SearchExercisesUseCaseResponse {
  exercises: DefaultExercise[]
  total: number
}

export class SearchExercisesUseCase {
  constructor(
    private defaultExercisesRepository: DefaultExercisesRepository,
  ) {}

  async execute({
    query,
    muscleGroup,
    page,
  }: SearchExercisesUseCaseRequest): Promise<SearchExercisesUseCaseResponse> {
    const { exercises, total } =
      await this.defaultExercisesRepository.findMany({
        page,
        ...(query ? { query } : {}),
        ...(muscleGroup ? { muscleGroup } : {}),
      })

    return { exercises, total }
  }
}
