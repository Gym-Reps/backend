import { beforeEach, describe, expect, it } from 'vitest'
import type { Set as SetModel } from '@prisma-client'
import { InMemoryExercisesRepository } from '@/repositories/in-memory/in-memory-exercises-repository'
import { InMemorySetsRepository } from '@/repositories/in-memory/in-memory-sets-repository'
import { InvalidSetIndexError } from '../../errors/invalid-set-index-error'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { asPlannedSets, plannedSetCount } from '../../_types/planned-sets'
import { RemoveSetFromExerciseUseCase } from './remove-set-from-exercise'

let setsRepository: InMemorySetsRepository
let exercisesRepository: InMemoryExercisesRepository
let sut: RemoveSetFromExerciseUseCase

async function seed(userId = 'user-1') {
  const exercise = await exercisesRepository.create({
    trainment_id: 't1',
    exercise_template_id: 'et1',
    planned_sets: {
      '1': { weight: 80, min_reps: 6, max_reps: 12 },
      '2': { weight: 80, min_reps: 6, max_reps: 12 },
    },
  })
  const sets = await setsRepository.createMany([
    { trainment_id: 't1', exercise_id: exercise.id, user_id: userId, index: 1 },
    { trainment_id: 't1', exercise_id: exercise.id, user_id: userId, index: 2 },
  ])
  return { exercise, sets: sets as SetModel[] }
}

describe('Remove Set From Exercise Use Case', () => {
  beforeEach(() => {
    setsRepository = new InMemorySetsRepository()
    exercisesRepository = new InMemoryExercisesRepository()
    sut = new RemoveSetFromExerciseUseCase(setsRepository, exercisesRepository)
  })

  it('removes the last set and its plan key, keeping the invariant', async () => {
    const { exercise, sets } = await seed()
    const lastSet = sets[1]!

    await sut.execute({ userId: 'user-1', setId: lastSet.id })

    const stored = await exercisesRepository.findById(exercise.id)
    expect(plannedSetCount(asPlannedSets(stored?.planned_sets))).toEqual(1)
    expect(await setsRepository.countByExerciseId(exercise.id)).toEqual(1)
    expect(await setsRepository.findById(lastSet.id)).toBeNull()
  })

  it('rejects removing a non-last set with InvalidSetIndexError', async () => {
    const { sets } = await seed()
    const firstSet = sets[0]!

    await expect(
      sut.execute({ userId: 'user-1', setId: firstSet.id }),
    ).rejects.toBeInstanceOf(InvalidSetIndexError)
  })

  it('throws NotAllowedError when the set belongs to another user', async () => {
    const { sets } = await seed('user-2')

    await expect(
      sut.execute({ userId: 'user-1', setId: sets[1]!.id }),
    ).rejects.toBeInstanceOf(NotAllowedError)
  })
})
