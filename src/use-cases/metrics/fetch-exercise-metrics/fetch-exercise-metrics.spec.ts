import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryExercisesRepository } from '@/repositories/in-memory/in-memory-exercises-repository'
import { InMemoryMetricsRepository } from '@/repositories/in-memory/in-memory-metrics-repository'
import { InMemoryTrainmentsRepository } from '@/repositories/in-memory/in-memory-trainments-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'
import { FetchExerciseMetricsUseCase } from './fetch-exercise-metrics'

let metricsRepository: InMemoryMetricsRepository
let exercisesRepository: InMemoryExercisesRepository
let trainmentsRepository: InMemoryTrainmentsRepository
let sut: FetchExerciseMetricsUseCase

async function seedExercise(userId: string) {
  const trainment = await trainmentsRepository.create({
    trainment_template_id: 'tt1',
    user_id: userId,
  })
  const exercise = await exercisesRepository.create({
    trainment_id: trainment.id,
    exercise_template_id: 'et1',
  })
  return exercise
}

describe('Fetch Exercise Metrics Use Case', () => {
  beforeEach(() => {
    metricsRepository = new InMemoryMetricsRepository()
    exercisesRepository = new InMemoryExercisesRepository()
    trainmentsRepository = new InMemoryTrainmentsRepository()
    sut = new FetchExerciseMetricsUseCase(
      metricsRepository,
      exercisesRepository,
      trainmentsRepository,
    )
  })

  it("returns the owned exercise's metrics", async () => {
    const exercise = await seedExercise('user-1')
    await metricsRepository.upsertByCurrentSetId({
      user_id: 'user-1',
      trainment_id: exercise.trainment_id,
      exercise_id: exercise.id,
      previous_set_id: 'prev-1',
      current_set_id: 'cur-1',
      weight_diff: -2.5,
      repetitions_diff: 1,
    })

    const { metrics } = await sut.execute({
      userId: 'user-1',
      exerciseId: exercise.id,
    })

    expect(metrics).toHaveLength(1)
    expect(metrics[0]?.weight_diff).toBe(-2.5)
  })

  it('returns an empty list when metrics are not yet computed', async () => {
    const exercise = await seedExercise('user-1')

    const { metrics } = await sut.execute({
      userId: 'user-1',
      exerciseId: exercise.id,
    })

    expect(metrics).toEqual([])
  })

  it('throws ResourceNotFoundError when the exercise is absent', async () => {
    await expect(
      sut.execute({ userId: 'user-1', exerciseId: 'non-existing' }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('throws NotAllowedError when the exercise belongs to another user', async () => {
    const exercise = await seedExercise('user-2')

    await expect(
      sut.execute({ userId: 'user-1', exerciseId: exercise.id }),
    ).rejects.toBeInstanceOf(NotAllowedError)
  })
})
