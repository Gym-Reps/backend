import { randomUUID } from 'node:crypto'
import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryExercisesRepository } from '@/repositories/in-memory/in-memory-exercises-repository'
import { InMemoryMetricsRepository } from '@/repositories/in-memory/in-memory-metrics-repository'
import { InMemorySetsRepository } from '@/repositories/in-memory/in-memory-sets-repository'
import { InMemoryTrainmentsRepository } from '@/repositories/in-memory/in-memory-trainments-repository'
import { ComputeTrainmentMetricsUseCase } from './compute-trainment-metrics'

let trainmentsRepository: InMemoryTrainmentsRepository
let exercisesRepository: InMemoryExercisesRepository
let setsRepository: InMemorySetsRepository
let metricsRepository: InMemoryMetricsRepository
let sut: ComputeTrainmentMetricsUseCase

const USER = 'user-1'
const TEMPLATE = 'trainment-template-1'
const EXERCISE_TEMPLATE = 'exercise-template-1'

interface SetInput {
  index: number
  weight: number | null
  repetitions: number | null
}

/**
 * Materializes a finished session (trainment → one performed exercise → its
 * sets) off the given exercise template slot. Returns the created ids.
 */
async function seedSession(params: {
  startedAt: Date
  sets: SetInput[]
  exerciseTemplateId?: string
}) {
  const trainment = await trainmentsRepository.create({
    id: randomUUID(),
    trainment_template_id: TEMPLATE,
    user_id: USER,
    started_at: params.startedAt,
    finished_at: new Date(params.startedAt.getTime() + 60 * 60 * 1000),
  })

  const exercise = await exercisesRepository.create({
    id: randomUUID(),
    trainment_id: trainment.id,
    exercise_template_id: params.exerciseTemplateId ?? EXERCISE_TEMPLATE,
  })

  await setsRepository.createMany(
    params.sets.map((set) => ({
      id: randomUUID(),
      trainment_id: trainment.id,
      exercise_id: exercise.id,
      user_id: USER,
      index: set.index,
      weight: set.weight,
      repetitions: set.repetitions,
    })),
  )

  return { trainmentId: trainment.id, exerciseId: exercise.id }
}

describe('Compute Trainment Metrics Use Case', () => {
  beforeEach(() => {
    trainmentsRepository = new InMemoryTrainmentsRepository()
    exercisesRepository = new InMemoryExercisesRepository()
    setsRepository = new InMemorySetsRepository()
    metricsRepository = new InMemoryMetricsRepository()
    sut = new ComputeTrainmentMetricsUseCase(
      trainmentsRepository,
      exercisesRepository,
      setsRepository,
      metricsRepository,
    )
  })

  it('computes a +2kg diff across 3 sets between consecutive same-template sessions', async () => {
    await seedSession({
      startedAt: new Date('2026-06-24T18:00:00Z'),
      sets: [
        { index: 1, weight: 60, repetitions: 12 },
        { index: 2, weight: 60, repetitions: 10 },
        { index: 3, weight: 60, repetitions: 11 },
      ],
    })
    const { trainmentId } = await seedSession({
      startedAt: new Date('2026-06-29T18:00:00Z'),
      sets: [
        { index: 1, weight: 62, repetitions: 12 },
        { index: 2, weight: 62, repetitions: 10 },
        { index: 3, weight: 62, repetitions: 11 },
      ],
    })

    const { metrics } = await sut.execute({ trainmentId })

    expect(metrics).toHaveLength(3)
    expect(metrics.every((m) => m.weight_diff === 2)).toBe(true)
    expect(metrics.every((m) => m.repetitions_diff === 0)).toBe(true)
  })

  it('produces a negative repetitions_diff when fewer reps are logged', async () => {
    await seedSession({
      startedAt: new Date('2026-06-24T18:00:00Z'),
      sets: [{ index: 1, weight: 60, repetitions: 12 }],
    })
    const { trainmentId } = await seedSession({
      startedAt: new Date('2026-06-29T18:00:00Z'),
      sets: [{ index: 1, weight: 60, repetitions: 9 }],
    })

    const { metrics } = await sut.execute({ trainmentId })

    expect(metrics).toHaveLength(1)
    expect(metrics[0]?.weight_diff).toBe(0)
    expect(metrics[0]?.repetitions_diff).toBe(-3)
  })

  it('yields no metrics for the first-ever session of a template', async () => {
    const { trainmentId } = await seedSession({
      startedAt: new Date('2026-06-24T18:00:00Z'),
      sets: [{ index: 1, weight: 60, repetitions: 12 }],
    })

    const { metrics } = await sut.execute({ trainmentId })

    expect(metrics).toHaveLength(0)
  })

  it('only diffs matched indices when set counts differ', async () => {
    await seedSession({
      startedAt: new Date('2026-06-24T18:00:00Z'),
      sets: [
        { index: 1, weight: 60, repetitions: 12 },
        { index: 2, weight: 60, repetitions: 10 },
      ],
    })
    const { trainmentId } = await seedSession({
      startedAt: new Date('2026-06-29T18:00:00Z'),
      sets: [
        { index: 1, weight: 62, repetitions: 12 },
        { index: 2, weight: 62, repetitions: 10 },
        { index: 3, weight: 62, repetitions: 11 },
      ],
    })

    const { metrics } = await sut.execute({ trainmentId })

    // index 3 has no counterpart in the previous session → skipped
    expect(metrics).toHaveLength(2)
  })

  it('skips sets with unlogged (null) weight or repetitions', async () => {
    await seedSession({
      startedAt: new Date('2026-06-24T18:00:00Z'),
      sets: [
        { index: 1, weight: 60, repetitions: 12 },
        { index: 2, weight: null, repetitions: null },
      ],
    })
    const { trainmentId } = await seedSession({
      startedAt: new Date('2026-06-29T18:00:00Z'),
      sets: [
        { index: 1, weight: 62, repetitions: 12 },
        { index: 2, weight: 62, repetitions: 10 },
      ],
    })

    const { metrics } = await sut.execute({ trainmentId })

    // index 2's previous set is unlogged → no comparable metric
    expect(metrics).toHaveLength(1)
    expect(metrics[0]?.weight_diff).toBe(2)
  })

  it('is idempotent: running twice yields the same metrics with no duplicates', async () => {
    await seedSession({
      startedAt: new Date('2026-06-24T18:00:00Z'),
      sets: [
        { index: 1, weight: 60, repetitions: 12 },
        { index: 2, weight: 60, repetitions: 10 },
      ],
    })
    const { trainmentId } = await seedSession({
      startedAt: new Date('2026-06-29T18:00:00Z'),
      sets: [
        { index: 1, weight: 62, repetitions: 12 },
        { index: 2, weight: 62, repetitions: 10 },
      ],
    })

    await sut.execute({ trainmentId })
    const { metrics } = await sut.execute({ trainmentId })

    expect(metrics).toHaveLength(2)
    expect(metricsRepository.items).toHaveLength(2)
  })

  it('skips exercises without a matching template slot in the previous session', async () => {
    await seedSession({
      startedAt: new Date('2026-06-24T18:00:00Z'),
      sets: [{ index: 1, weight: 60, repetitions: 12 }],
      exerciseTemplateId: 'other-slot',
    })
    const { trainmentId } = await seedSession({
      startedAt: new Date('2026-06-29T18:00:00Z'),
      sets: [{ index: 1, weight: 62, repetitions: 12 }],
    })

    const { metrics } = await sut.execute({ trainmentId })

    expect(metrics).toHaveLength(0)
  })

  it('no-ops when the trainment does not exist', async () => {
    const { metrics } = await sut.execute({ trainmentId: 'does-not-exist' })
    expect(metrics).toHaveLength(0)
  })
})
