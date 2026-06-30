import type { Prisma, User } from '@prisma-client'
import { prisma } from '@/lib/prisma'
import type { UsersRepository } from '../users-repository'

export class PrismaUsersRepository implements UsersRepository {
  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data })
  }

  async findByEmail(email: string) {
    return prisma.user.findFirst({ where: { email, deleted_at: null } })
  }

  async findByUsername(username: string) {
    return prisma.user.findFirst({ where: { username, deleted_at: null } })
  }

  async findById(id: string) {
    return prisma.user.findFirst({ where: { id, deleted_at: null } })
  }

  async save(user: User) {
    return prisma.user.update({ where: { id: user.id }, data: user })
  }
}
