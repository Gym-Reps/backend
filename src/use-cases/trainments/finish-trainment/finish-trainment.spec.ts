import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryTrainmentsRepository } from '@/repositories/in-memory/in-memory-trainments-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'
import { TrainmentAlreadyFinishedError } from '../../errors/trainment-already-finished-error'
import { FinishTrainmentUseCase } from './finish-trainment'

let trainmentsRepository: InMemoryTrainmentsRepository
let sut: FinishTrainmentUseCase

describe('Finish Trainment Use Case', () => {
  beforeEach(() => {
    trainmentsRepository = new InMemoryTrainmentsRepository()
    sut = new FinishTrainmentUseCase(trainmentsRepository)
  })

  it('should set finished_at on an in-progress session', async () => {
    const created = await trainmentsRepository.create({
      trainment_template_id: 'template-1',
      user_id: 'user-1',
    })

    const { trainment } = await sut.execute({
      userId: 'user-1',
      trainmentId: created.id,
    })

    expect(trainment.finished_at).toEqual(expect.any(Date))
  })

  it('should throw ResourceNotFoundError when the trainment is absent', async () => {
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

  it('should throw TrainmentAlreadyFinishedError on a second finish', async () => {
    const created = await trainmentsRepository.create({
      trainment_template_id: 'template-1',
      user_id: 'user-1',
    })

    await sut.execute({ userId: 'user-1', trainmentId: created.id })

    await expect(
      sut.execute({ userId: 'user-1', trainmentId: created.id }),
    ).rejects.toBeInstanceOf(TrainmentAlreadyFinishedError)
  })
})
