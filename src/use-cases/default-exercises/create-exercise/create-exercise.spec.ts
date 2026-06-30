import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryDefaultExercisesRepository } from '@/repositories/in-memory/in-memory-default-exercises-repository'
import { ExerciseAlreadyExistsError } from '../../errors/exercise-already-exists-error'
import { CreateExerciseUseCase } from './create-exercise'

let defaultExercisesRepository: InMemoryDefaultExercisesRepository
let sut: CreateExerciseUseCase

describe('Create Exercise Use Case', () => {
  beforeEach(() => {
    defaultExercisesRepository = new InMemoryDefaultExercisesRepository()
    sut = new CreateExerciseUseCase(defaultExercisesRepository)
  })

  it('should create an entry, deriving the slug from the title', async () => {
    const { exercise } = await sut.execute({
      title: 'Barbell Bench Press',
      muscleGroup: 'CHEST',
      imagePath: '/static/exercises/barbell-bench-press.webp',
    })

    expect(exercise.id).toEqual(expect.any(String))
    expect(exercise.slug).toEqual('barbell-bench-press')
    expect(defaultExercisesRepository.items).toHaveLength(1)
  })

  it('should honor an explicit slug', async () => {
    const { exercise } = await sut.execute({
      title: 'Barbell Bench Press',
      muscleGroup: 'CHEST',
      imagePath: '/static/exercises/bench.webp',
      slug: 'bench',
    })

    expect(exercise.slug).toEqual('bench')
  })

  it('should reject a duplicate slug', async () => {
    await sut.execute({
      title: 'Barbell Bench Press',
      muscleGroup: 'CHEST',
      imagePath: '/static/exercises/barbell-bench-press.webp',
    })

    await expect(
      sut.execute({
        title: 'Barbell Bench Press',
        muscleGroup: 'CHEST',
        imagePath: '/static/exercises/barbell-bench-press.webp',
      }),
    ).rejects.toBeInstanceOf(ExerciseAlreadyExistsError)
  })
})
