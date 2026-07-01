import type { UserPreferences } from '@prisma-client'
import type { UserPreferencesRepository } from '@/repositories/user-preferences-repository'
import { UserPreferencesAlreadyExistsError } from '../../errors/user-preferences-already-exists-error'
import { DEFAULT_PREFERENCES } from '../preferences'

interface CreateDefaultUserPreferencesUseCaseRequest {
  userId: string
}

interface CreateDefaultUserPreferencesUseCaseResponse {
  userPreferences: UserPreferences
}

export class CreateDefaultUserPreferencesUseCase {
  constructor(private userPreferencesRepository: UserPreferencesRepository) {}

  async execute({
    userId,
  }: CreateDefaultUserPreferencesUseCaseRequest): Promise<CreateDefaultUserPreferencesUseCaseResponse> {
    const existing = await this.userPreferencesRepository.findByUserId(userId)

    if (existing) {
      throw new UserPreferencesAlreadyExistsError()
    }

    const userPreferences = await this.userPreferencesRepository.create({
      user_id: userId,
      preferences: { ...DEFAULT_PREFERENCES },
    })

    return { userPreferences }
  }
}
