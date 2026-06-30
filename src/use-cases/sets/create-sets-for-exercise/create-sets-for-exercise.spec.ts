import { beforeEach, describe, expect, it } from 'vitest'
import { InMemorySetsRepository } from '@/repositories/in-memory/in-memory-sets-repository'
import type { PlannedSets } from '../../_types/planned-sets'
import { CreateSetsForExerciseUseCase } from './create-sets-for-exercise'

let setsRepository: InMemorySetsRepository
let sut: CreateSetsForExerciseUseCase

const plannedSets: PlannedSets = {
  '1': { weight: null, min_reps: null, max_reps: null },
  '2': { weight: 80, min_reps: 6, max_reps: 12 },
  '3': { weight: 80, min_reps: 6, max_reps: 12 },
}

describe('Create Sets For Exercise Use Case', () => {
  beforeEach(() => {
    setsRepository = new InMemorySetsRepository()
    sut = new CreateSetsForExerciseUseCase(setsRepository)
  })

  it('materializes one unlogged set per planned index', async () => {
    const { sets } = await sut.execute({
      userId: 'user-1',
      trainmentId: 'trainment-1',
      exerciseId: 'exercise-1',
      plannedSets,
    })

    expect(sets).toHaveLength(3)
    expect(sets.map((s) => s.index)).toEqual([1, 2, 3])
    expect(sets.every((s) => s.weight === null && s.repetitions === null)).toBe(
      true,
    )
    expect(sets.every((s) => s.user_id === 'user-1')).toBe(true)
    expect(
      await setsRepository.countByExerciseId('exercise-1'),
    ).toEqual(Object.keys(plannedSets).length)
  })
})
