import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryExercisesRepository } from '@/repositories/in-memory/in-memory-exercises-repository'
import { InMemorySetsRepository } from '@/repositories/in-memory/in-memory-sets-repository'
import { InMemoryTrainmentsRepository } from '@/repositories/in-memory/in-memory-trainments-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { RemoveExerciseFromTrainmentUseCase } from './remove-exercise-from-trainment'

let exercisesRepository: InMemoryExercisesRepository
let trainmentsRepository: InMemoryTrainmentsRepository
let setsRepository: InMemorySetsRepository
let sut: RemoveExerciseFromTrainmentUseCase

async function seed(userId = 'user-1') {
  const trainment = await trainmentsRepository.create({
    trainment_template_id: 'tt1',
    user_id: userId,
  })
  const exercise = await exercisesRepository.create({
    trainment_id: trainment.id,
    exercise_template_id: 'et1',
  })
  await setsRepository.createMany([
    { trainment_id: trainment.id, exercise_id: exercise.id, user_id: userId, index: 1 },
    { trainment_id: trainment.id, exercise_id: exercise.id, user_id: userId, index: 2 },
  ])
  return { exercise }
}

describe('Remove Exercise From Trainment Use Case', () => {
  beforeEach(() => {
    exercisesRepository = new InMemoryExercisesRepository()
    trainmentsRepository = new InMemoryTrainmentsRepository()
    setsRepository = new InMemorySetsRepository()
    sut = new RemoveExerciseFromTrainmentUseCase(
      exercisesRepository,
      trainmentsRepository,
      setsRepository,
    )
  })

  it('deletes the exercise and its sets', async () => {
    const { exercise } = await seed()

    await sut.execute({ userId: 'user-1', exerciseId: exercise.id })

    expect(await exercisesRepository.findById(exercise.id)).toBeNull()
    expect(await setsRepository.countByExerciseId(exercise.id)).toEqual(0)
  })

  it('throws NotAllowedError when owned by another user', async () => {
    const { exercise } = await seed('user-2')

    await expect(
      sut.execute({ userId: 'user-1', exerciseId: exercise.id }),
    ).rejects.toBeInstanceOf(NotAllowedError)

    // nothing was deleted
    expect(await setsRepository.countByExerciseId(exercise.id)).toEqual(2)
  })
})
