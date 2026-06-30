import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryDefaultExercisesRepository } from '@/repositories/in-memory/in-memory-default-exercises-repository'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'
import { GetExerciseUseCase } from './get-exercise'

let defaultExercisesRepository: InMemoryDefaultExercisesRepository
let sut: GetExerciseUseCase

describe('Get Exercise Use Case', () => {
  beforeEach(() => {
    defaultExercisesRepository = new InMemoryDefaultExercisesRepository()
    sut = new GetExerciseUseCase(defaultExercisesRepository)
  })

  it('should return the catalog entry by id', async () => {
    const created = await defaultExercisesRepository.create({
      title: 'Barbell Bench Press',
      slug: 'barbell-bench-press',
      muscle_group: 'CHEST',
      image_path: '/static/exercises/barbell-bench-press.webp',
    })

    const { exercise } = await sut.execute({ exerciseId: created.id })

    expect(exercise.title).toEqual('Barbell Bench Press')
  })

  it('should throw ResourceNotFoundError when absent', async () => {
    await expect(
      sut.execute({ exerciseId: 'non-existing-id' }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
