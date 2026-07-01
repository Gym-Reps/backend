import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryUserPreferencesRepository } from '@/repositories/in-memory/in-memory-user-preferences-repository'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'
import { DEFAULT_PREFERENCES, resolvePreferences } from '../preferences'
import { GetUserPreferencesUseCase } from './get-user-preferences'

let userPreferencesRepository: InMemoryUserPreferencesRepository
let sut: GetUserPreferencesUseCase

describe('Get User Preferences Use Case', () => {
  beforeEach(() => {
    userPreferencesRepository = new InMemoryUserPreferencesRepository()
    sut = new GetUserPreferencesUseCase(userPreferencesRepository)
  })

  it('returns the stored preferences for the user', async () => {
    await userPreferencesRepository.create({
      user_id: 'user-1',
      preferences: { ...DEFAULT_PREFERENCES, weightUnit: 'lb' },
    })

    const { userPreferences } = await sut.execute({ userId: 'user-1' })

    expect(resolvePreferences(userPreferences.preferences).weightUnit).toEqual(
      'lb',
    )
  })

  it('throws when no preferences row exists', async () => {
    await expect(sut.execute({ userId: 'ghost' })).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    )
  })
})
