import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryTrainmentTemplatesRepository } from '@/repositories/in-memory/in-memory-trainment-templates-repository'
import { CreateTrainmentTemplateUseCase } from './create-trainment-template'

let trainmentTemplatesRepository: InMemoryTrainmentTemplatesRepository
let sut: CreateTrainmentTemplateUseCase

describe('Create Trainment Template Use Case', () => {
  beforeEach(() => {
    trainmentTemplatesRepository = new InMemoryTrainmentTemplatesRepository()
    sut = new CreateTrainmentTemplateUseCase(trainmentTemplatesRepository)
  })

  it('should be able to create a trainment template for the user', async () => {
    const { trainmentTemplate } = await sut.execute({
      userId: 'user-1',
      title: 'Upper A',
    })

    expect(trainmentTemplate.id).toEqual(expect.any(String))
    expect(trainmentTemplate.title).toEqual('Upper A')
    expect(trainmentTemplate.user_id).toEqual('user-1')
    expect(trainmentTemplate.deleted_at).toBeNull()
    expect(trainmentTemplatesRepository.items).toHaveLength(1)
  })
})
