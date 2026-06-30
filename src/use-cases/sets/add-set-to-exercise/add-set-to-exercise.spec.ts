import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryExercisesRepository } from '@/repositories/in-memory/in-memory-exercises-repository'
import { InMemorySetsRepository } from '@/repositories/in-memory/in-memory-sets-repository'
import { InMemoryTrainmentsRepository } from '@/repositories/in-memory/in-memory-trainments-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { asPlannedSets, plannedSetCount } from '../../_types/planned-sets'
import { AddSetToExerciseUseCase } from './add-set-to-exercise'

let setsRepository: InMemorySetsRepository
let exercisesRepository: InMemoryExercisesRepository
let trainmentsRepository: InMemoryTrainmentsRepository
let sut: AddSetToExerciseUseCase

async function seed(userId = 'user-1') {
  const trainment = await trainmentsRepository.create({
    trainment_template_id: 'tt1',
    user_id: userId,
  })
  const exercise = await exercisesRepository.create({
    trainment_id: trainment.id,
    exercise_template_id: 'et1',
    planned_sets: {
      '1': { weight: 80, min_reps: 6, max_reps: 12 },
      '2': { weight: 80, min_reps: 6, max_reps: 12 },
    },
  })
  await setsRepository.createMany([
    { trainment_id: trainment.id, exercise_id: exercise.id, user_id: userId, index: 1 },
    { trainment_id: trainment.id, exercise_id: exercise.id, user_id: userId, index: 2 },
  ])
  return { exercise }
}

describe('Add Set To Exercise Use Case', () => {
  beforeEach(() => {
    setsRepository = new InMemorySetsRepository()
    exercisesRepository = new InMemoryExercisesRepository()
    trainmentsRepository = new InMemoryTrainmentsRepository()
    sut = new AddSetToExerciseUseCase(
      setsRepository,
      exercisesRepository,
      trainmentsRepository,
    )
  })

  it('extends planned_sets and inserts the matching set, keeping the invariant', async () => {
    const { exercise } = await seed()

    const { set } = await sut.execute({
      userId: 'user-1',
      exerciseId: exercise.id,
    })

    expect(set.index).toEqual(3)
    expect(set.weight).toBeNull()

    const stored = await exercisesRepository.findById(exercise.id)
    const planned = asPlannedSets(stored?.planned_sets)
    expect(plannedSetCount(planned)).toEqual(3)
    // new entry defaults from the previous set's plan
    expect(planned['3']).toEqual({ weight: 80, min_reps: 6, max_reps: 12 })
    expect(await setsRepository.countByExerciseId(exercise.id)).toEqual(3)
  })

  it('uses provided placeholders for the new entry', async () => {
    const { exercise } = await seed()

    await sut.execute({
      userId: 'user-1',
      exerciseId: exercise.id,
      weight: 100,
      minReps: 3,
      maxReps: 5,
    })

    const stored = await exercisesRepository.findById(exercise.id)
    expect(asPlannedSets(stored?.planned_sets)['3']).toEqual({
      weight: 100,
      min_reps: 3,
      max_reps: 5,
    })
  })

  it('throws NotAllowedError when the exercise belongs to another user', async () => {
    const { exercise } = await seed('user-2')

    await expect(
      sut.execute({ userId: 'user-1', exerciseId: exercise.id }),
    ).rejects.toBeInstanceOf(NotAllowedError)
  })
})
