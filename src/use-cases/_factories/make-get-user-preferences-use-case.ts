import { PrismaUserPreferencesRepository } from '@/repositories/prisma/prisma-user-preferences-repository'
import { GetUserPreferencesUseCase } from '../user-preferences/get-user-preferences/get-user-preferences'

export function makeGetUserPreferencesUseCase() {
  const userPreferencesRepository = new PrismaUserPreferencesRepository()
  return new GetUserPreferencesUseCase(userPreferencesRepository)
}
