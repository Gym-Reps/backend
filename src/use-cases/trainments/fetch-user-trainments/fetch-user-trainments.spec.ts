import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryTrainmentsRepository } from '@/repositories/in-memory/in-memory-trainments-repository'
import { FetchUserTrainmentsUseCase } from './fetch-user-trainments'

let trainmentsRepository: InMemoryTrainmentsRepository
let sut: FetchUserTrainmentsUseCase

describe('Fetch User Trainments Use Case', () => {
  beforeEach(() => {
    trainmentsRepository = new InMemoryTrainmentsRepository()
    sut = new FetchUserTrainmentsUseCase(trainmentsRepository)
  })

  it('should list the user sessions newest first', async () => {
    await trainmentsRepository.create({
      trainment_template_id: 'template-1',
      user_id: 'user-1',
      started_at: new Date('2026-06-20T10:00:00Z'),
    })
    await trainmentsRepository.create({
      trainment_template_id: 'template-1',
      user_id: 'user-1',
      started_at: new Date('2026-06-25T10:00:00Z'),
    })
    await trainmentsRepository.create({
      trainment_template_id: 'template-1',
      user_id: 'user-2',
      started_at: new Date('2026-06-26T10:00:00Z'),
    })

    const { trainments } = await sut.execute({ userId: 'user-1', page: 1 })

    expect(trainments).toHaveLength(2)
    expect(trainments[0]?.started_at).toEqual(new Date('2026-06-25T10:00:00Z'))
    expect(trainments[1]?.started_at).toEqual(new Date('2026-06-20T10:00:00Z'))
  })

  it('should filter by trainmentTemplateId', async () => {
    await trainmentsRepository.create({
      trainment_template_id: 'template-1',
      user_id: 'user-1',
    })
    await trainmentsRepository.create({
      trainment_template_id: 'template-2',
      user_id: 'user-1',
    })

    const { trainments } = await sut.execute({
      userId: 'user-1',
      trainmentTemplateId: 'template-2',
      page: 1,
    })

    expect(trainments).toHaveLength(1)
    expect(trainments[0]?.trainment_template_id).toEqual('template-2')
  })

  it('should paginate 20 sessions per page', async () => {
    for (let i = 0; i < 22; i++) {
      await trainmentsRepository.create({
        trainment_template_id: 'template-1',
        user_id: 'user-1',
        started_at: new Date(2026, 5, 1, i),
      })
    }

    const page1 = await sut.execute({ userId: 'user-1', page: 1 })
    const page2 = await sut.execute({ userId: 'user-1', page: 2 })

    expect(page1.trainments).toHaveLength(20)
    expect(page2.trainments).toHaveLength(2)
  })
})
