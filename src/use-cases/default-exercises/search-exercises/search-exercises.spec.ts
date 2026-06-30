import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryDefaultExercisesRepository } from '@/repositories/in-memory/in-memory-default-exercises-repository'
import { SearchExercisesUseCase } from './search-exercises'

let defaultExercisesRepository: InMemoryDefaultExercisesRepository
let sut: SearchExercisesUseCase

describe('Search Exercises Use Case', () => {
  beforeEach(() => {
    defaultExercisesRepository = new InMemoryDefaultExercisesRepository()
    sut = new SearchExercisesUseCase(defaultExercisesRepository)
  })

  it('should match by partial title, case-insensitively', async () => {
    await defaultExercisesRepository.create({
      title: 'Barbell Bench Press',
      slug: 'barbell-bench-press',
      muscle_group: 'CHEST',
      image_path: '/static/exercises/barbell-bench-press.webp',
    })
    await defaultExercisesRepository.create({
      title: 'Deadlift',
      slug: 'deadlift',
      muscle_group: 'BACK',
      image_path: '/static/exercises/deadlift.webp',
    })

    const { exercises, total } = await sut.execute({ query: 'bench', page: 1 })

    expect(total).toEqual(1)
    expect(exercises).toHaveLength(1)
    expect(exercises[0]?.title).toEqual('Barbell Bench Press')
  })

  it('should filter by muscle group', async () => {
    await defaultExercisesRepository.create({
      title: 'Barbell Bench Press',
      slug: 'barbell-bench-press',
      muscle_group: 'CHEST',
      image_path: '/static/exercises/barbell-bench-press.webp',
    })
    await defaultExercisesRepository.create({
      title: 'Pull Up',
      slug: 'pull-up',
      muscle_group: 'BACK',
      image_path: '/static/exercises/pull-up.webp',
    })

    const { exercises, total } = await sut.execute({
      muscleGroup: 'BACK',
      page: 1,
    })

    expect(total).toEqual(1)
    expect(exercises[0]?.title).toEqual('Pull Up')
  })

  it('should paginate, 20 per page', async () => {
    for (let i = 0; i < 22; i++) {
      await defaultExercisesRepository.create({
        title: `Exercise ${i}`,
        slug: `exercise-${i}`,
        muscle_group: 'CORE',
        image_path: `/static/exercises/exercise-${i}.webp`,
      })
    }

    const page1 = await sut.execute({ page: 1 })
    const page2 = await sut.execute({ page: 2 })

    expect(page1.exercises).toHaveLength(20)
    expect(page1.total).toEqual(22)
    expect(page2.exercises).toHaveLength(2)
    expect(page2.total).toEqual(22)
  })
})
