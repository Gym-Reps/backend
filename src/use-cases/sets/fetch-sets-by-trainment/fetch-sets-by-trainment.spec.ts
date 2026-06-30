import { beforeEach, describe, expect, it } from 'vitest'
import { InMemorySetsRepository } from '@/repositories/in-memory/in-memory-sets-repository'
import { InMemoryTrainmentsRepository } from '@/repositories/in-memory/in-memory-trainments-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'
import { FetchSetsByTrainmentUseCase } from './fetch-sets-by-trainment'

let setsRepository: InMemorySetsRepository
let trainmentsRepository: InMemoryTrainmentsRepository
let sut: FetchSetsByTrainmentUseCase

describe('Fetch Sets By Trainment Use Case', () => {
  beforeEach(() => {
    setsRepository = new InMemorySetsRepository()
    trainmentsRepository = new InMemoryTrainmentsRepository()
    sut = new FetchSetsByTrainmentUseCase(setsRepository, trainmentsRepository)
  })

  it('returns all sets for the owned session', async () => {
    const trainment = await trainmentsRepository.create({
      trainment_template_id: 'tt1',
      user_id: 'user-1',
    })
    await setsRepository.createMany([
      { trainment_id: trainment.id, exercise_id: 'e1', user_id: 'user-1', index: 1 },
      { trainment_id: trainment.id, exercise_id: 'e2', user_id: 'user-1', index: 1 },
    ])

    const { sets } = await sut.execute({
      userId: 'user-1',
      trainmentId: trainment.id,
    })

    expect(sets).toHaveLength(2)
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
