import { PrismaUserPreferencesRepository } from '@/repositories/prisma/prisma-user-preferences-repository'
import { CreateDefaultUserPreferencesUseCase } from '../user-preferences/create-default-user-preferences/create-default-user-preferences'

export function makeCreateDefaultUserPreferencesUseCase() {
  const userPreferencesRepository = new PrismaUserPreferencesRepository()
  return new CreateDefaultUserPreferencesUseCase(userPreferencesRepository)
}
