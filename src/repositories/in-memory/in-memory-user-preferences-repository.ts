import { randomUUID } from 'node:crypto'
import type { Prisma, UserPreferences } from '@prisma-client'
import type { UserPreferencesRepository } from '../user-preferences-repository'

export class InMemoryUserPreferencesRepository
  implements UserPreferencesRepository
{
  public items: UserPreferences[] = []

  async create(data: Prisma.UserPreferencesUncheckedCreateInput) {
    const preferences: UserPreferences = {
      id: data.id ?? randomUUID(),
      user_id: data.user_id,
      preferences: (data.preferences ?? {}) as UserPreferences['preferences'],
      created_at: data.created_at ? new Date(data.created_at) : new Date(),
      updated_at: data.updated_at ? new Date(data.updated_at) : new Date(),
    }

    this.items.push(preferences)

    return preferences
  }

  async findByUserId(userId: string) {
    return this.items.find((item) => item.user_id === userId) ?? null
  }

  async save(preferences: UserPreferences) {
    const index = this.items.findIndex((item) => item.id === preferences.id)

    if (index >= 0) {
      this.items[index] = { ...preferences, updated_at: new Date() }
      return this.items[index]
    }

    return preferences
  }
}
