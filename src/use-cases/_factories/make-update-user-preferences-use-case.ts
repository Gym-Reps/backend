import { PrismaUserPreferencesRepository } from '@/repositories/prisma/prisma-user-preferences-repository'
import { UpdateUserPreferencesUseCase } from '../user-preferences/update-user-preferences/update-user-preferences'

export function makeUpdateUserPreferencesUseCase() {
  const userPreferencesRepository = new PrismaUserPreferencesRepository()
  return new UpdateUserPreferencesUseCase(userPreferencesRepository)
}
