import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryTrainmentsRepository } from '@/repositories/in-memory/in-memory-trainments-repository'
import { GetWeeklyProgressUseCase } from './get-weekly-progress'

let trainmentsRepository: InMemoryTrainmentsRepository
let sut: GetWeeklyProgressUseCase

// Tuesday — week window is Mon 2026-06-29 .. Sun 2026-07-05 (UTC).
const reference = new Date('2026-06-30T12:00:00Z')

describe('Get Weekly Progress Use Case', () => {
  beforeEach(() => {
    trainmentsRepository = new InMemoryTrainmentsRepository()
    sut = new GetWeeklyProgressUseCase(trainmentsRepository)
  })

  it('should count only the user finished sessions inside the current week', async () => {
    // finished this week (2)
    await trainmentsRepository.create({
      trainment_template_id: 'template-1',
      user_id: 'user-1',
      started_at: new Date('2026-06-30T09:00:00Z'),
      finished_at: new Date('2026-06-30T10:00:00Z'),
    })
    await trainmentsRepository.create({
      trainment_template_id: 'template-1',
      user_id: 'user-1',
      started_at: new Date('2026-07-01T09:00:00Z'),
      finished_at: new Date('2026-07-01T10:00:00Z'),
    })
    // finished last week — excluded
    await trainmentsRepository.create({
      trainment_template_id: 'template-1',
      user_id: 'user-1',
      started_at: new Date('2026-06-24T09:00:00Z'),
      finished_at: new Date('2026-06-24T10:00:00Z'),
    })
    // in progress this week — excluded
    await trainmentsRepository.create({
      trainment_template_id: 'template-1',
      user_id: 'user-1',
      started_at: new Date('2026-07-02T09:00:00Z'),
    })
    // another user finished this week — excluded
    await trainmentsRepository.create({
      trainment_template_id: 'template-9',
      user_id: 'user-2',
      started_at: new Date('2026-07-01T09:00:00Z'),
      finished_at: new Date('2026-07-01T10:00:00Z'),
    })

    const result = await sut.execute({ userId: 'user-1', reference })

    expect(result.weekStart).toEqual(new Date('2026-06-29T00:00:00.000Z'))
    expect(result.weekEnd).toEqual(new Date('2026-07-05T23:59:59.999Z'))
    expect(result.completed).toEqual(2)
    expect(result.goal).toBeNull()
    expect(result.trainments).toHaveLength(2)
    // newest finished first
    expect(result.trainments[0]?.finished_at).toEqual(
      new Date('2026-07-01T10:00:00Z'),
    )
  })

  it('should report zero completed when there are no finished sessions this week', async () => {
    const result = await sut.execute({ userId: 'user-1', reference })

    expect(result.completed).toEqual(0)
    expect(result.trainments).toHaveLength(0)
    expect(result.goal).toBeNull()
  })
})
