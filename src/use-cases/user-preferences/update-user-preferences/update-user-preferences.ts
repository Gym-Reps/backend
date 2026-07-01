import type { UserPreferences } from '@prisma-client'
import type { UserPreferencesRepository } from '@/repositories/user-preferences-repository'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'
import {
  resolvePreferences,
  type UserPreferencesPatch,
  type UserPreferencesValue,
} from '../preferences'

interface UpdateUserPreferencesUseCaseRequest {
  userId: string
  /** Partial patch — only the keys present are applied (merge). */
  data: UserPreferencesPatch
}

interface UpdateUserPreferencesUseCaseResponse {
  userPreferences: UserPreferences
}

export class UpdateUserPreferencesUseCase {
  constructor(private userPreferencesRepository: UserPreferencesRepository) {}

  async execute({
    userId,
    data,
  }: UpdateUserPreferencesUseCaseRequest): Promise<UpdateUserPreferencesUseCaseResponse> {
    const existing = await this.userPreferencesRepository.findByUserId(userId)

    if (!existing) {
      throw new ResourceNotFoundError()
    }

    // Merge only the keys explicitly provided (a present `null` clears the
    // goal; an absent key keeps its stored value).
    const merged: UserPreferencesValue = resolvePreferences(
      existing.preferences,
    )

    if (data.weightUnit !== undefined) merged.weightUnit = data.weightUnit
    if (data.theme !== undefined) merged.theme = data.theme
    if (data.lengthUnit !== undefined) merged.lengthUnit = data.lengthUnit
    if (data.weeklyTrainingCount !== undefined) {
      merged.weeklyTrainingCount = data.weeklyTrainingCount
    }

    existing.preferences = merged as unknown as UserPreferences['preferences']

    const userPreferences = await this.userPreferencesRepository.save(existing)

    return { userPreferences }
  }
}
