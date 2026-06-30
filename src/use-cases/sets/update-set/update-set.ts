import type { Set as SetModel } from '@prisma-client'
import type { SetsRepository } from '@/repositories/sets-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'

interface UpdateSetUseCaseRequest {
  userId: string
  setId: string
  weight?: number
  repetitions?: number
  performedAt?: Date
}

interface UpdateSetUseCaseResponse {
  set: SetModel
}

export class UpdateSetUseCase {
  constructor(private setsRepository: SetsRepository) {}

  async execute({
    userId,
    setId,
    weight,
    repetitions,
    performedAt,
  }: UpdateSetUseCaseRequest): Promise<UpdateSetUseCaseResponse> {
    const set = await this.setsRepository.findById(setId)

    if (!set) {
      throw new ResourceNotFoundError()
    }

    if (set.user_id !== userId) {
      throw new NotAllowedError()
    }

    if (weight !== undefined) {
      set.weight = weight
    }

    if (repetitions !== undefined) {
      set.repetitions = repetitions
    }

    // Logging actual performance stamps the time (overridable for sync/import).
    set.performed_at = performedAt ?? new Date()

    const updated = await this.setsRepository.save(set)

    return { set: updated }
  }
}
