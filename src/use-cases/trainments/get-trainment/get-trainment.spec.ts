import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryTrainmentsRepository } from '@/repositories/in-memory/in-memory-trainments-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'
import { GetTrainmentUseCase } from './get-trainment'

let trainmentsRepository: InMemoryTrainmentsRepository
let sut: GetTrainmentUseCase

describe('Get Trainment Use Case', () => {
  beforeEach(() => {
    trainmentsRepository = new InMemoryTrainmentsRepository()
    sut = new GetTrainmentUseCase(trainmentsRepository)
  })

  it('should be able to get a session by id', async () => {
    const created = await trainmentsRepository.create({
      trainment_template_id: 'template-1',
      user_id: 'user-1',
    })

    const { trainment } = await sut.execute({
      userId: 'user-1',
      trainmentId: created.id,
    })

    expect(trainment.id).toEqual(created.id)
  })

  it('should throw ResourceNotFoundError when the session is absent', async () => {
    await expect(
      sut.execute({ userId: 'user-1', trainmentId: 'non-existing-id' }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should throw NotAllowedError when owned by someone else', async () => {
    const created = await trainmentsRepository.create({
      trainment_template_id: 'template-1',
      user_id: 'user-2',
    })

    await expect(
      sut.execute({ userId: 'user-1', trainmentId: created.id }),
    ).rejects.toBeInstanceOf(NotAllowedError)
  })
})
