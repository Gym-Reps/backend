import { randomUUID } from 'node:crypto'
import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryExerciseTemplatesRepository } from '@/repositories/in-memory/in-memory-exercise-templates-repository'
import { InMemoryTrainmentSyncRepository } from '@/repositories/in-memory/in-memory-trainment-sync-repository'
import { InMemoryTrainmentTemplatesRepository } from '@/repositories/in-memory/in-memory-trainment-templates-repository'
import type { SyncExerciseInput } from '@/repositories/trainment-sync-repository'
import { InvalidSetIndexError } from '../../errors/invalid-set-index-error'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'
import { SyncTrainmentUseCase } from './sync-trainment'

let syncRepository: InMemoryTrainmentSyncRepository
let trainmentTemplatesRepository: InMemoryTrainmentTemplatesRepository
let exerciseTemplatesRepository: InMemoryExerciseTemplatesRepository
let sut: SyncTrainmentUseCase

function buildExercise(exerciseTemplateId: string, setCount = 2): SyncExerciseInput {
  const plannedSets = Object.fromEntries(
    Array.from({ length: setCount }, (_, i) => [
      String(i + 1),
      { weight: 80, min_reps: 6, max_reps: 12 },
    ]),
  )
  const sets = Array.from({ length: setCount }, (_, i) => ({
    id: randomUUID(),
    index: i + 1,
    weight: 80,
    repetitions: 10,
    performedAt: new Date(),
  }))
  return { id: randomUUID(), exerciseTemplateId, plannedSets, sets }
}

async function seedTemplate(userId = 'user-1') {
  const trainmentTemplate = await trainmentTemplatesRepository.create({
    user_id: userId,
    title: 'Lower A',
  })
  const exerciseTemplateA = await exerciseTemplatesRepository.create({
    trainment_template_id: trainmentTemplate.id,
    exercise_catalog_id: 'c1',
    title: 'Squat',
  })
  const exerciseTemplateB = await exerciseTemplatesRepository.create({
    trainment_template_id: trainmentTemplate.id,
    exercise_catalog_id: 'c2',
    title: 'Deadlift',
  })
  return { trainmentTemplate, exerciseTemplateA, exerciseTemplateB }
}

describe('Sync Trainment Use Case', () => {
  beforeEach(() => {
    syncRepository = new InMemoryTrainmentSyncRepository()
    trainmentTemplatesRepository = new InMemoryTrainmentTemplatesRepository()
    exerciseTemplatesRepository = new InMemoryExerciseTemplatesRepository()
    sut = new SyncTrainmentUseCase(
      syncRepository,
      trainmentTemplatesRepository,
      exerciseTemplatesRepository,
    )
  })

  it('persists a full graph (1 trainment, 2 exercises, N sets), preserving client ids', async () => {
    const { trainmentTemplate, exerciseTemplateA, exerciseTemplateB } =
      await seedTemplate()
    const trainmentId = randomUUID()
    const exercises = [
      buildExercise(exerciseTemplateA.id, 3),
      buildExercise(exerciseTemplateB.id, 2),
    ]

    const result = await sut.execute({
      userId: 'user-1',
      id: trainmentId,
      trainmentTemplateId: trainmentTemplate.id,
      startedAt: new Date('2026-06-29T18:00:00Z'),
      finishedAt: new Date('2026-06-29T18:50:00Z'),
      exercises,
    })

    expect(result.created).toBe(true)
    expect(result.trainment.id).toBe(trainmentId)
    expect(result.exercises).toHaveLength(2)
    expect(result.sets).toHaveLength(5)
    expect(syncRepository.trainments).toHaveLength(1)
    expect(syncRepository.sets).toHaveLength(5)
    // client-generated ids preserved
    expect(syncRepository.exercises.map((e) => e.id).sort()).toEqual(
      exercises.map((e) => e.id).sort(),
    )
  })

  it('forces user_id from the caller onto every set', async () => {
    const { trainmentTemplate, exerciseTemplateA } = await seedTemplate('user-1')

    await sut.execute({
      userId: 'user-1',
      id: randomUUID(),
      trainmentTemplateId: trainmentTemplate.id,
      startedAt: new Date(),
      finishedAt: new Date(),
      exercises: [buildExercise(exerciseTemplateA.id, 2)],
    })

    expect(syncRepository.sets.every((s) => s.user_id === 'user-1')).toBe(true)
    expect(syncRepository.trainments[0]?.user_id).toBe('user-1')
  })

  it('is atomic: a graph whose 2nd exercise breaks the invariant persists nothing', async () => {
    const { trainmentTemplate, exerciseTemplateA, exerciseTemplateB } =
      await seedTemplate()
    const good = buildExercise(exerciseTemplateA.id, 2)
    const bad = buildExercise(exerciseTemplateB.id, 2)
    // break the invariant: drop a set so sets.length !== plannedSets length
    bad.sets = bad.sets.slice(0, 1)

    await expect(
      sut.execute({
        userId: 'user-1',
        id: randomUUID(),
        trainmentTemplateId: trainmentTemplate.id,
        startedAt: new Date(),
        finishedAt: new Date(),
        exercises: [good, bad],
      }),
    ).rejects.toBeInstanceOf(InvalidSetIndexError)

    expect(syncRepository.trainments).toHaveLength(0)
    expect(syncRepository.exercises).toHaveLength(0)
    expect(syncRepository.sets).toHaveLength(0)
  })

  it('is idempotent: re-syncing the same graph yields no duplicates and returns 200-equivalent', async () => {
    const { trainmentTemplate, exerciseTemplateA } = await seedTemplate()
    const trainmentId = randomUUID()
    const exercises = [buildExercise(exerciseTemplateA.id, 3)]
    const payload = {
      userId: 'user-1',
      id: trainmentId,
      trainmentTemplateId: trainmentTemplate.id,
      startedAt: new Date(),
      finishedAt: new Date(),
      exercises,
    }

    const first = await sut.execute(payload)
    const second = await sut.execute(payload)

    expect(first.created).toBe(true)
    expect(second.created).toBe(false)
    expect(syncRepository.trainments).toHaveLength(1)
    expect(syncRepository.exercises).toHaveLength(1)
    expect(syncRepository.sets).toHaveLength(3)
  })

  it("throws NotAllowedError when the template belongs to another user, writing nothing", async () => {
    const { trainmentTemplate, exerciseTemplateA } = await seedTemplate('user-2')

    await expect(
      sut.execute({
        userId: 'user-1',
        id: randomUUID(),
        trainmentTemplateId: trainmentTemplate.id,
        startedAt: new Date(),
        finishedAt: new Date(),
        exercises: [buildExercise(exerciseTemplateA.id, 2)],
      }),
    ).rejects.toBeInstanceOf(NotAllowedError)

    expect(syncRepository.trainments).toHaveLength(0)
  })

  it('throws ResourceNotFoundError when the template does not exist', async () => {
    await expect(
      sut.execute({
        userId: 'user-1',
        id: randomUUID(),
        trainmentTemplateId: randomUUID(),
        startedAt: new Date(),
        finishedAt: null,
        exercises: [],
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it("throws NotAllowedError when an exercise template belongs to a different template", async () => {
    const { trainmentTemplate } = await seedTemplate('user-1')
    // exercise template under a *different* template (still owned by user-1)
    const otherTemplate = await trainmentTemplatesRepository.create({
      user_id: 'user-1',
      title: 'Upper A',
    })
    const foreignExerciseTemplate = await exerciseTemplatesRepository.create({
      trainment_template_id: otherTemplate.id,
      exercise_catalog_id: 'c9',
      title: 'Bench',
    })

    await expect(
      sut.execute({
        userId: 'user-1',
        id: randomUUID(),
        trainmentTemplateId: trainmentTemplate.id,
        startedAt: new Date(),
        finishedAt: new Date(),
        exercises: [buildExercise(foreignExerciseTemplate.id, 2)],
      }),
    ).rejects.toBeInstanceOf(NotAllowedError)

    expect(syncRepository.trainments).toHaveLength(0)
  })
})
