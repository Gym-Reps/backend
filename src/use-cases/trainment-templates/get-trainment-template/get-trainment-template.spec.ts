import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryTrainmentTemplatesRepository } from '@/repositories/in-memory/in-memory-trainment-templates-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'
import { GetTrainmentTemplateUseCase } from './get-trainment-template'

let trainmentTemplatesRepository: InMemoryTrainmentTemplatesRepository
let sut: GetTrainmentTemplateUseCase

describe('Get Trainment Template Use Case', () => {
  beforeEach(() => {
    trainmentTemplatesRepository = new InMemoryTrainmentTemplatesRepository()
    sut = new GetTrainmentTemplateUseCase(trainmentTemplatesRepository)
  })

  it('should be able to get a template by id', async () => {
    const created = await trainmentTemplatesRepository.create({
      user_id: 'user-1',
      title: 'Upper A',
    })

    const { trainmentTemplate } = await sut.execute({
      userId: 'user-1',
      trainmentTemplateId: created.id,
    })

    expect(trainmentTemplate.title).toEqual('Upper A')
  })

  it('should throw ResourceNotFoundError when the template is absent', async () => {
    await expect(
      sut.execute({
        userId: 'user-1',
        trainmentTemplateId: 'non-existing-id',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should throw NotAllowedError when owned by someone else', async () => {
    const created = await trainmentTemplatesRepository.create({
      user_id: 'user-2',
      title: 'Upper A',
    })

    await expect(
      sut.execute({
        userId: 'user-1',
        trainmentTemplateId: created.id,
      }),
    ).rejects.toBeInstanceOf(NotAllowedError)
  })
})
