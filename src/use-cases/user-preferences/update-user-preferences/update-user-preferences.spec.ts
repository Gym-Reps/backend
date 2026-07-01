import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryUserPreferencesRepository } from '@/repositories/in-memory/in-memory-user-preferences-repository'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'
import { DEFAULT_PREFERENCES, resolvePreferences } from '../preferences'
import { UpdateUserPreferencesUseCase } from './update-user-preferences'

let userPreferencesRepository: InMemoryUserPreferencesRepository
let sut: UpdateUserPreferencesUseCase

describe('Update User Preferences Use Case', () => {
  beforeEach(async () => {
    userPreferencesRepository = new InMemoryUserPreferencesRepository()
    sut = new UpdateUserPreferencesUseCase(userPreferencesRepository)

    await userPreferencesRepository.create({
      user_id: 'user-1',
      preferences: { ...DEFAULT_PREFERENCES },
    })
  })

  it('merges a single key without altering the others', async () => {
    const { userPreferences } = await sut.execute({
      userId: 'user-1',
      data: { weightUnit: 'lb' },
    })

    const value = resolvePreferences(userPreferences.preferences)

    expect(value.weightUnit).toEqual('lb')
    expect(value.theme).toEqual('light')
    expect(value.lengthUnit).toEqual('meters')
    expect(value.weeklyTrainingCount).toBeNull()
  })

  it('replaces multiple keys at once', async () => {
    const { userPreferences } = await sut.execute({
      userId: 'user-1',
      data: { lengthUnit: 'inches', weeklyTrainingCount: 5 },
    })

    const value = resolvePreferences(userPreferences.preferences)

    expect(value.lengthUnit).toEqual('inches')
    expect(value.weeklyTrainingCount).toEqual(5)
  })

  it('clears the weekly goal with null', async () => {
    await sut.execute({ userId: 'user-1', data: { weeklyTrainingCount: 7 } })

    const { userPreferences } = await sut.execute({
      userId: 'user-1',
      data: { weeklyTrainingCount: null },
    })

    expect(
      resolvePreferences(userPreferences.preferences).weeklyTrainingCount,
    ).toBeNull()
  })

  it('throws when no preferences row exists', async () => {
    await expect(
      sut.execute({ userId: 'ghost', data: { weightUnit: 'lb' } }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
