import { compare, hash } from 'bcryptjs'
import type { User } from '@prisma-client'
import type { UsersRepository } from '@/repositories/users-repository'
import { InvalidCredentialsError } from '../errors/invalid-credentials-error'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

interface ChangePasswordUseCaseRequest {
  userId: string
  currentPassword: string
  newPassword: string
}

interface ChangePasswordUseCaseResponse {
  user: User
}

export class ChangePasswordUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    userId,
    currentPassword,
    newPassword,
  }: ChangePasswordUseCaseRequest): Promise<ChangePasswordUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    const doesCurrentPasswordMatch = await compare(
      currentPassword,
      user.password_hash,
    )

    if (!doesCurrentPasswordMatch) {
      throw new InvalidCredentialsError()
    }

    user.password_hash = await hash(newPassword, 6)

    const updatedUser = await this.usersRepository.save(user)

    return { user: updatedUser }
  }
}
