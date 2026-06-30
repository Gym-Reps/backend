import { beforeEach, describe, expect, it } from 'vitest'
import { InMemorySetsRepository } from '@/repositories/in-memory/in-memory-sets-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { FetchSetsByExerciseUseCase } from './fetch-sets-by-exercise'

let setsRepository: InMemorySetsRepository
let sut: FetchSetsByExerciseUseCase

describe('Fetch Sets By Exercise Use Case', () => {
  beforeEach(() => {
    setsRepository = new InMemorySetsRepository()
    sut = new FetchSetsByExerciseUseCase(setsRepository)
  })

  it('returns the exercise sets ordered by index', async () => {
    await setsRepository.createMany([
      { trainment_id: 't1', exercise_id: 'e1', user_id: 'user-1', index: 2 },
      { trainment_id: 't1', exercise_id: 'e1', user_id: 'user-1', index: 1 },
      { trainment_id: 't1', exercise_id: 'e1', user_id: 'user-1', index: 3 },
    ])

    const { sets } = await sut.execute({ userId: 'user-1', exerciseId: 'e1' })

    expect(sets.map((s) => s.index)).toEqual([1, 2, 3])
  })

  it('throws NotAllowedError when the sets belong to another user', async () => {
    await setsRepository.createMany([
      { trainment_id: 't1', exercise_id: 'e1', user_id: 'user-2', index: 1 },
    ])

    await expect(
      sut.execute({ userId: 'user-1', exerciseId: 'e1' }),
    ).rejects.toBeInstanceOf(NotAllowedError)
  })

  it('returns an empty list when the exercise has no sets', async () => {
    const { sets } = await sut.execute({ userId: 'user-1', exerciseId: 'e1' })
    expect(sets).toEqual([])
  })
})
