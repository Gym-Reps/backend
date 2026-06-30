import { randomUUID } from 'node:crypto'
import type { Prisma, User } from '@prisma-client'
import type { UsersRepository } from '../users-repository'

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = []

  async create(data: Prisma.UserCreateInput) {
    const user: User = {
      id: data.id ?? randomUUID(),
      username: data.username,
      email: data.email,
      password_hash: data.password_hash,
      role: data.role ?? 'MEMBER',
      created_at: data.created_at ? new Date(data.created_at) : new Date(),
      updated_at: data.updated_at ? new Date(data.updated_at) : new Date(),
      deleted_at: data.deleted_at ? new Date(data.deleted_at) : null,
    }

    this.items.push(user)

    return user
  }

  async findByEmail(email: string) {
    return (
      this.items.find(
        (item) => item.email === email && item.deleted_at === null,
      ) ?? null
    )
  }

  async findByUsername(username: string) {
    return (
      this.items.find(
        (item) => item.username === username && item.deleted_at === null,
      ) ?? null
    )
  }

  async findById(id: string) {
    return (
      this.items.find(
        (item) => item.id === id && item.deleted_at === null,
      ) ?? null
    )
  }

  async save(user: User) {
    const index = this.items.findIndex((item) => item.id === user.id)

    if (index >= 0) {
      this.items[index] = user
    }

    return user
  }
}
