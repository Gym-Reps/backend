import { compare } from 'bcryptjs'
import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { UserAlreadyExistsError } from '../errors/user-already-exists-error'
import { RegisterUseCase } from './register'

let usersRepository: InMemoryUsersRepository
let sut: RegisterUseCase

describe('Register Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new RegisterUseCase(usersRepository)
  })

  it('should be able to register', async () => {
    const { user } = await sut.execute({
      username: 'johndoe',
      email: 'johndoe@example.com',
      password: '123456',
    })

    expect(user.id).toEqual(expect.any(String))
  })

  it('should hash the user password upon registration', async () => {
    const { user } = await sut.execute({
      username: 'johndoe',
      email: 'johndoe@example.com',
      password: '123456',
    })

    expect(user.password_hash).not.toEqual('123456')
    expect(await compare('123456', user.password_hash)).toBe(true)
  })

  it('should not be able to register with a duplicate email', async () => {
    await sut.execute({
      username: 'johndoe',
      email: 'johndoe@example.com',
      password: '123456',
    })

    await expect(
      sut.execute({
        username: 'janedoe',
        email: 'johndoe@example.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })

  it('should not be able to register with a duplicate username', async () => {
    await sut.execute({
      username: 'johndoe',
      email: 'johndoe@example.com',
      password: '123456',
    })

    await expect(
      sut.execute({
        username: 'johndoe',
        email: 'janedoe@example.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })
})
