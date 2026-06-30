import { compare, hash } from 'bcryptjs'
import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { InvalidCredentialsError } from '../errors/invalid-credentials-error'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { ChangePasswordUseCase } from './change-password'

let usersRepository: InMemoryUsersRepository
let sut: ChangePasswordUseCase

describe('Change Password Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new ChangePasswordUseCase(usersRepository)
  })

  it('should be able to change the password and re-hash it', async () => {
    const createdUser = await usersRepository.create({
      username: 'johndoe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
    })

    const { user } = await sut.execute({
      userId: createdUser.id,
      currentPassword: '123456',
      newPassword: 'new-password',
    })

    expect(user.password_hash).not.toEqual('123456')
    expect(await compare('new-password', user.password_hash)).toBe(true)
    expect(await compare('123456', user.password_hash)).toBe(false)
  })

  it('should not be able to change the password of a non-existing user', async () => {
    await expect(
      sut.execute({
        userId: 'non-existing-user-id',
        currentPassword: '123456',
        newPassword: 'new-password',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to change the password with a wrong current password', async () => {
    const createdUser = await usersRepository.create({
      username: 'johndoe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
    })

    await expect(
      sut.execute({
        userId: createdUser.id,
        currentPassword: 'wrong-password',
        newPassword: 'new-password',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })
})
