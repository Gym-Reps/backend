import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { ChangePasswordUseCase } from '../change-password/change-password'

export function makeChangePasswordUseCase() {
  const usersRepository = new PrismaUsersRepository()
  return new ChangePasswordUseCase(usersRepository)
}
