import type { Prisma, UserPreferences } from '@prisma-client'
import { prisma } from '@/lib/prisma'
import type { UserPreferencesRepository } from '../user-preferences-repository'

export class PrismaUserPreferencesRepository
  implements UserPreferencesRepository
{
  async create(data: Prisma.UserPreferencesUncheckedCreateInput) {
    return prisma.userPreferences.create({ data })
  }

  async findByUserId(userId: string) {
    return prisma.userPreferences.findUnique({ where: { user_id: userId } })
  }

  async save(preferences: UserPreferences) {
    return prisma.userPreferences.update({
      where: { id: preferences.id },
      data: { preferences: preferences.preferences ?? {} },
    })
  }
}
