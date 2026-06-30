import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryExercisesRepository } from '@/repositories/in-memory/in-memory-exercises-repository'
import { InMemoryTrainmentsRepository } from '@/repositories/in-memory/in-memory-trainments-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'
import { FetchTrainmentExercisesUseCase } from './fetch-trainment-exercises'

let exercisesRepository: InMemoryExercisesRepository
let trainmentsRepository: InMemoryTrainmentsRepository
let sut: FetchTrainmentExercisesUseCase

describe('Fetch Trainment Exercises Use Case', () => {
  beforeEach(() => {
    exercisesRepository = new InMemoryExercisesRepository()
    trainmentsRepository = new InMemoryTrainmentsRepository()
    sut = new FetchTrainmentExercisesUseCase(
      exercisesRepository,
      trainmentsRepository,
    )
  })

  it('lists the performed exercises of an owned session', async () => {
    const trainment = await trainmentsRepository.create({
      trainment_template_id: 'tt1',
      user_id: 'user-1',
    })
    await exercisesRepository.create({
      trainment_id: trainment.id,
      exercise_template_id: 'et1',
    })
    await exercisesRepository.create({
      trainment_id: trainment.id,
      exercise_template_id: 'et2',
    })

    const { exercises } = await sut.execute({
      userId: 'user-1',
      trainmentId: trainment.id,
    })

    expect(exercises).toHaveLength(2)
  })

  it('throws NotAllowedError for a non-owned session', async () => {
    const trainment = await trainmentsRepository.create({
      trainment_template_id: 'tt1',
      user_id: 'user-2',
    })

    await expect(
      sut.execute({ userId: 'user-1', trainmentId: trainment.id }),
    ).rejects.toBeInstanceOf(NotAllowedError)
  })

  it('throws ResourceNotFoundError for an absent session', async () => {
    await expect(
      sut.execute({ userId: 'user-1', trainmentId: 'non-existing' }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
