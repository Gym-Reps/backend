import type { DefaultExercise } from '@prisma-client'
import type { DefaultExercisesRepository } from '@/repositories/default-exercises-repository'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'

interface GetExerciseUseCaseRequest {
  exerciseId: string
}

interface GetExerciseUseCaseResponse {
  exercise: DefaultExercise
}

export class GetExerciseUseCase {
  constructor(
    private defaultExercisesRepository: DefaultExercisesRepository,
  ) {}

  async execute({
    exerciseId,
  }: GetExerciseUseCaseRequest): Promise<GetExerciseUseCaseResponse> {
    const exercise = await this.defaultExercisesRepository.findById(exerciseId)

    if (!exercise) {
      throw new ResourceNotFoundError()
    }

    return { exercise }
  }
}
