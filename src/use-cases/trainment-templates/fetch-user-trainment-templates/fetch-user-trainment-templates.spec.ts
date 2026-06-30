import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryTrainmentTemplatesRepository } from '@/repositories/in-memory/in-memory-trainment-templates-repository'
import { FetchUserTrainmentTemplatesUseCase } from './fetch-user-trainment-templates'

let trainmentTemplatesRepository: InMemoryTrainmentTemplatesRepository
let sut: FetchUserTrainmentTemplatesUseCase

describe('Fetch User Trainment Templates Use Case', () => {
  beforeEach(() => {
    trainmentTemplatesRepository = new InMemoryTrainmentTemplatesRepository()
    sut = new FetchUserTrainmentTemplatesUseCase(trainmentTemplatesRepository)
  })

  it("should return only the caller's active templates", async () => {
    await trainmentTemplatesRepository.create({
      user_id: 'user-1',
      title: 'Upper A',
    })
    await trainmentTemplatesRepository.create({
      user_id: 'user-1',
      title: 'Lower B',
    })
    await trainmentTemplatesRepository.create({
      user_id: 'user-2',
      title: 'Push',
    })

    const { trainmentTemplates } = await sut.execute({ userId: 'user-1' })

    expect(trainmentTemplates).toHaveLength(2)
    expect(trainmentTemplates).toEqual([
      expect.objectContaining({ title: 'Upper A' }),
      expect.objectContaining({ title: 'Lower B' }),
    ])
  })

  it('should exclude soft-deleted templates', async () => {
    const deleted = await trainmentTemplatesRepository.create({
      user_id: 'user-1',
      title: 'Retired',
    })
    deleted.deleted_at = new Date()
    await trainmentTemplatesRepository.save(deleted)

    await trainmentTemplatesRepository.create({
      user_id: 'user-1',
      title: 'Upper A',
    })

    const { trainmentTemplates } = await sut.execute({ userId: 'user-1' })

    expect(trainmentTemplates).toHaveLength(1)
    expect(trainmentTemplates[0]?.title).toEqual('Upper A')
  })
})
