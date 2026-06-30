import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryTrainmentTemplatesRepository } from '@/repositories/in-memory/in-memory-trainment-templates-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'
import { UpdateTrainmentTemplateUseCase } from './update-trainment-template'

let trainmentTemplatesRepository: InMemoryTrainmentTemplatesRepository
let sut: UpdateTrainmentTemplateUseCase

describe('Update Trainment Template Use Case', () => {
  beforeEach(() => {
    trainmentTemplatesRepository = new InMemoryTrainmentTemplatesRepository()
    sut = new UpdateTrainmentTemplateUseCase(trainmentTemplatesRepository)
  })

  it('should be able to rename a template for the owner', async () => {
    const created = await trainmentTemplatesRepository.create({
      user_id: 'user-1',
      title: 'Upper A',
    })

    const { trainmentTemplate } = await sut.execute({
      userId: 'user-1',
      trainmentTemplateId: created.id,
      title: 'Upper A (revised)',
    })

    expect(trainmentTemplate.title).toEqual('Upper A (revised)')
    expect(trainmentTemplatesRepository.items[0]?.title).toEqual(
      'Upper A (revised)',
    )
  })

  it('should throw ResourceNotFoundError when the template is absent', async () => {
    await expect(
      sut.execute({
        userId: 'user-1',
        trainmentTemplateId: 'non-existing-id',
        title: 'New title',
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
        title: 'Hacked',
      }),
    ).rejects.toBeInstanceOf(NotAllowedError)
  })
})
