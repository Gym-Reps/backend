import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryTrainmentTemplatesRepository } from '@/repositories/in-memory/in-memory-trainment-templates-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'
import { DeleteTrainmentTemplateUseCase } from './delete-trainment-template'

let trainmentTemplatesRepository: InMemoryTrainmentTemplatesRepository
let sut: DeleteTrainmentTemplateUseCase

describe('Delete Trainment Template Use Case', () => {
  beforeEach(() => {
    trainmentTemplatesRepository = new InMemoryTrainmentTemplatesRepository()
    sut = new DeleteTrainmentTemplateUseCase(trainmentTemplatesRepository)
  })

  it('should soft-delete a template so reads exclude it', async () => {
    const created = await trainmentTemplatesRepository.create({
      user_id: 'user-1',
      title: 'Upper A',
    })

    await sut.execute({
      userId: 'user-1',
      trainmentTemplateId: created.id,
    })

    expect(trainmentTemplatesRepository.items[0]?.deleted_at).toEqual(
      expect.any(Date),
    )
    await expect(
      trainmentTemplatesRepository.findById(created.id),
    ).resolves.toBeNull()
    await expect(
      trainmentTemplatesRepository.findManyByUserId('user-1'),
    ).resolves.toHaveLength(0)
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
