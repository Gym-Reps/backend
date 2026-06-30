import type { Set as SetModel } from '@prisma-client'
import type { SetsRepository } from '@/repositories/sets-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'

interface FetchSetsByExerciseUseCaseRequest {
  userId: string
  exerciseId: string
}

interface FetchSetsByExerciseUseCaseResponse {
  sets: SetModel[]
}

export class FetchSetsByExerciseUseCase {
  constructor(private setsRepository: SetsRepository) {}

  async execute({
    userId,
    exerciseId,
  }: FetchSetsByExerciseUseCaseRequest): Promise<FetchSetsByExerciseUseCaseResponse> {
    const sets = await this.setsRepository.findManyByExerciseId(exerciseId)

    // Sets denormalize their owner; all sets of an exercise share a user_id.
    if (sets.length > 0 && sets[0]?.user_id !== userId) {
      throw new NotAllowedError()
    }

    return { sets }
  }
}
