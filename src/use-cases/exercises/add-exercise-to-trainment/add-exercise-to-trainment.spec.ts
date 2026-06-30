import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryExerciseTemplatesRepository } from '@/repositories/in-memory/in-memory-exercise-templates-repository'
import { InMemoryExercisesRepository } from '@/repositories/in-memory/in-memory-exercises-repository'
import { InMemorySetsRepository } from '@/repositories/in-memory/in-memory-sets-repository'
import { InMemoryTrainmentTemplatesRepository } from '@/repositories/in-memory/in-memory-trainment-templates-repository'
import { InMemoryTrainmentsRepository } from '@/repositories/in-memory/in-memory-trainments-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import type { PlannedSets } from '../../_types/planned-sets'
import { CreateSetsForExerciseUseCase } from '../../sets/create-sets-for-exercise/create-sets-for-exercise'
import { AddExerciseToTrainmentUseCase } from './add-exercise-to-trainment'

let exercisesRepository: InMemoryExercisesRepository
let trainmentsRepository: InMemoryTrainmentsRepository
let exerciseTemplatesRepository: InMemoryExerciseTemplatesRepository
let trainmentTemplatesRepository: InMemoryTrainmentTemplatesRepository
let setsRepository: InMemorySetsRepository
let sut: AddExerciseToTrainmentUseCase

const plannedSets: PlannedSets = {
  '1': { weight: 80, min_reps: 6, max_reps: 12 },
  '2': { weight: 80, min_reps: 6, max_reps: 12 },
  '3': { weight: 80, min_reps: 6, max_reps: 12 },
}

async function seed(userId = 'user-1') {
  const trainmentTemplate = await trainmentTemplatesRepository.create({
    user_id: userId,
    title: 'Lower A',
  })
  const trainment = await trainmentsRepository.create({
    trainment_template_id: trainmentTemplate.id,
    user_id: userId,
  })
  const exerciseTemplate = await exerciseTemplatesRepository.create({
    trainment_template_id: trainmentTemplate.id,
    exercise_catalog_id: 'c1',
    title: 'Squat',
  })
  return { trainment, exerciseTemplate }
}

describe('Add Exercise To Trainment Use Case', () => {
  beforeEach(() => {
    exercisesRepository = new InMemoryExercisesRepository()
    trainmentsRepository = new InMemoryTrainmentsRepository()
    exerciseTemplatesRepository = new InMemoryExerciseTemplatesRepository()
    trainmentTemplatesRepository = new InMemoryTrainmentTemplatesRepository()
    setsRepository = new InMemorySetsRepository()
    sut = new AddExerciseToTrainmentUseCase(
      exercisesRepository,
      trainmentsRepository,
      exerciseTemplatesRepository,
      trainmentTemplatesRepository,
      new CreateSetsForExerciseUseCase(setsRepository),
    )
  })

  it('creates the exercise with planned_sets and materializes the matching sets', async () => {
    const { trainment, exerciseTemplate } = await seed()

    const { exercise, sets } = await sut.execute({
      userId: 'user-1',
      trainmentId: trainment.id,
      exerciseTemplateId: exerciseTemplate.id,
      plannedSets,
    })

    expect(exercise.planned_sets).toEqual(plannedSets)
    expect(sets).toHaveLength(3)
    expect(sets.map((s) => s.index)).toEqual([1, 2, 3])
    expect(await setsRepository.countByExerciseId(exercise.id)).toEqual(3)
  })

  it('throws NotAllowedError when the session belongs to another user', async () => {
    const { trainment, exerciseTemplate } = await seed('user-2')

    await expect(
      sut.execute({
        userId: 'user-1',
        trainmentId: trainment.id,
        exerciseTemplateId: exerciseTemplate.id,
        plannedSets,
      }),
    ).rejects.toBeInstanceOf(NotAllowedError)
  })
})
