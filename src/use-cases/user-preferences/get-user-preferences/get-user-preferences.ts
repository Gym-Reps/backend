import type { UserPreferences } from '@prisma-client'
import type { UserPreferencesRepository } from '@/repositories/user-preferences-repository'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'

interface GetUserPreferencesUseCaseRequest {
  userId: string
}

interface GetUserPreferencesUseCaseResponse {
  userPreferences: UserPreferences
}

export class GetUserPreferencesUseCase {
  constructor(private userPreferencesRepository: UserPreferencesRepository) {}

  async execute({
    userId,
  }: GetUserPreferencesUseCaseRequest): Promise<GetUserPreferencesUseCaseResponse> {
    const userPreferences =
      await this.userPreferencesRepository.findByUserId(userId)

    if (!userPreferences) {
      throw new ResourceNotFoundError()
    }

    return { userPreferences }
  }
}
