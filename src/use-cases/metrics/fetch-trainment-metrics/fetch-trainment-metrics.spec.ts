import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryMetricsRepository } from '@/repositories/in-memory/in-memory-metrics-repository'
import { InMemoryTrainmentsRepository } from '@/repositories/in-memory/in-memory-trainments-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'
import { FetchTrainmentMetricsUseCase } from './fetch-trainment-metrics'

let metricsRepository: InMemoryMetricsRepository
let trainmentsRepository: InMemoryTrainmentsRepository
let sut: FetchTrainmentMetricsUseCase

describe('Fetch Trainment Metrics Use Case', () => {
  beforeEach(() => {
    metricsRepository = new InMemoryMetricsRepository()
    trainmentsRepository = new InMemoryTrainmentsRepository()
    sut = new FetchTrainmentMetricsUseCase(
      metricsRepository,
      trainmentsRepository,
    )
  })

  it("returns the owned session's metrics", async () => {
    const trainment = await trainmentsRepository.create({
      trainment_template_id: 'tt1',
      user_id: 'user-1',
    })
    await metricsRepository.upsertByCurrentSetId({
      user_id: 'user-1',
      trainment_id: trainment.id,
      exercise_id: 'e1',
      previous_set_id: 'prev-1',
      current_set_id: 'cur-1',
      weight_diff: 2,
      repetitions_diff: 0,
    })

    const { metrics } = await sut.execute({
      userId: 'user-1',
      trainmentId: trainment.id,
    })

    expect(metrics).toHaveLength(1)
    expect(metrics[0]?.weight_diff).toBe(2)
  })

  it('returns an empty list when metrics are not yet computed', async () => {
    const trainment = await trainmentsRepository.create({
      trainment_template_id: 'tt1',
      user_id: 'user-1',
    })

    const { metrics } = await sut.execute({
      userId: 'user-1',
      trainmentId: trainment.id,
    })

    expect(metrics).toEqual([])
  })

  it('throws ResourceNotFoundError when the session is absent', async () => {
    await expect(
      sut.execute({ userId: 'user-1', trainmentId: 'non-existing' }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('throws NotAllowedError when the session belongs to another user', async () => {
    const trainment = await trainmentsRepository.create({
      trainment_template_id: 'tt1',
      user_id: 'user-2',
    })

    await expect(
      sut.execute({ userId: 'user-1', trainmentId: trainment.id }),
    ).rejects.toBeInstanceOf(NotAllowedError)
  })
})
