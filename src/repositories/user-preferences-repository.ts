import type { Prisma, UserPreferences } from '@prisma-client'

export interface UserPreferencesRepository {
  create(
    data: Prisma.UserPreferencesUncheckedCreateInput,
  ): Promise<UserPreferences>
  findByUserId(userId: string): Promise<UserPreferences | null>
  save(preferences: UserPreferences): Promise<UserPreferences>
}
