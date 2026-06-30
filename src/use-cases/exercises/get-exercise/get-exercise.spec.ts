import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryExercisesRepository } from '@/repositories/in-memory/in-memory-exercises-repository'
import { InMemoryTrainmentsRepository } from '@/repositories/in-memory/in-memory-trainments-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'
import { GetExerciseUseCase } from './get-exercise'

let exercisesRepository: InMemoryExercisesRepository
let trainmentsRepository: InMemoryTrainmentsRepository
let sut: GetExerciseUseCase

describe('Get Exercise Use Case (performed)', () => {
  beforeEach(() => {
    exercisesRepository = new InMemoryExercisesRepository()
    trainmentsRepository = new InMemoryTrainmentsRepository()
    sut = new GetExerciseUseCase(exercisesRepository, trainmentsRepository)
  })

  it('returns the exercise for the owner', async () => {
    const trainment = await trainmentsRepository.create({
      trainment_template_id: 'tt1',
      user_id: 'user-1',
    })
    const exercise = await exercisesRepository.create({
      trainment_id: trainment.id,
      exercise_template_id: 'et1',
    })

    const result = await sut.execute({
      userId: 'user-1',
      exerciseId: exercise.id,
    })

    expect(result.exercise.id).toEqual(exercise.id)
  })

  it('throws ResourceNotFoundError when absent', async () => {
    await expect(
      sut.execute({ userId: 'user-1', exerciseId: 'non-existing' }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('throws NotAllowedError when owned by another user', async () => {
    const trainment = await trainmentsRepository.create({
      trainment_template_id: 'tt1',
      user_id: 'user-2',
    })
    const exercise = await exercisesRepository.create({
      trainment_id: trainment.id,
      exercise_template_id: 'et1',
    })

    await expect(
      sut.execute({ userId: 'user-1', exerciseId: exercise.id }),
    ).rejects.toBeInstanceOf(NotAllowedError)
  })
})
