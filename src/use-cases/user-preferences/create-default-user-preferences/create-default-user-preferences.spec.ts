import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryUserPreferencesRepository } from '@/repositories/in-memory/in-memory-user-preferences-repository'
import { UserPreferencesAlreadyExistsError } from '../../errors/user-preferences-already-exists-error'
import { resolvePreferences } from '../preferences'
import { CreateDefaultUserPreferencesUseCase } from './create-default-user-preferences'

let userPreferencesRepository: InMemoryUserPreferencesRepository
let sut: CreateDefaultUserPreferencesUseCase

describe('Create Default User Preferences Use Case', () => {
  beforeEach(() => {
    userPreferencesRepository = new InMemoryUserPreferencesRepository()
    sut = new CreateDefaultUserPreferencesUseCase(userPreferencesRepository)
  })

  it('creates a row with the documented defaults', async () => {
    const { userPreferences } = await sut.execute({ userId: 'user-1' })

    const value = resolvePreferences(userPreferences.preferences)

    expect(userPreferences.user_id).toEqual('user-1')
    expect(value).toEqual({
      weightUnit: 'kg',
      theme: 'light',
      lengthUnit: 'meters',
      weeklyTrainingCount: null,
    })
  })

  it('rejects a second creation for the same user', async () => {
    await sut.execute({ userId: 'user-1' })

    await expect(sut.execute({ userId: 'user-1' })).rejects.toBeInstanceOf(
      UserPreferencesAlreadyExistsError,
    )
  })
})
