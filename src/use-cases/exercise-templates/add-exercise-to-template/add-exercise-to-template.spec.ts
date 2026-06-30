import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryDefaultExercisesRepository } from '@/repositories/in-memory/in-memory-default-exercises-repository'
import { InMemoryExerciseTemplatesRepository } from '@/repositories/in-memory/in-memory-exercise-templates-repository'
import { InMemoryTrainmentTemplatesRepository } from '@/repositories/in-memory/in-memory-trainment-templates-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'
import { AddExerciseToTemplateUseCase } from './add-exercise-to-template'

let exerciseTemplatesRepository: InMemoryExerciseTemplatesRepository
let trainmentTemplatesRepository: InMemoryTrainmentTemplatesRepository
let defaultExercisesRepository: InMemoryDefaultExercisesRepository
let sut: AddExerciseToTemplateUseCase

async function seedCatalog() {
  return defaultExercisesRepository.create({
    title: 'Barbell Squat',
    slug: 'barbell-squat',
    muscle_group: 'QUADS',
    image_path: '/static/exercises/barbell-squat.webp',
  })
}

describe('Add Exercise To Template Use Case', () => {
  beforeEach(() => {
    exerciseTemplatesRepository = new InMemoryExerciseTemplatesRepository()
    trainmentTemplatesRepository = new InMemoryTrainmentTemplatesRepository()
    defaultExercisesRepository = new InMemoryDefaultExercisesRepository()
    sut = new AddExerciseToTemplateUseCase(
      exerciseTemplatesRepository,
      trainmentTemplatesRepository,
      defaultExercisesRepository,
    )
  })

  it('adds a catalog exercise, snapshotting its title, and bumps the parent updated_at', async () => {
    const template = await trainmentTemplatesRepository.create({
      user_id: 'user-1',
      title: 'Lower A',
    })
    template.updated_at = new Date('2020-01-01')
    await trainmentTemplatesRepository.save(template)

    const catalog = await seedCatalog()

    const { exerciseTemplate } = await sut.execute({
      userId: 'user-1',
      trainmentTemplateId: template.id,
      exerciseCatalogId: catalog.id,
    })

    expect(exerciseTemplate.title).toEqual('Barbell Squat')
    expect(exerciseTemplate.exercise_catalog_id).toEqual(catalog.id)
    expect(exerciseTemplate.trainment_template_id).toEqual(template.id)

    const parent = await trainmentTemplatesRepository.findById(template.id)
    expect(parent!.updated_at.getTime()).toBeGreaterThan(
      new Date('2020-01-01').getTime(),
    )
  })

  it('throws NotAllowedError for a non-owned template', async () => {
    const template = await trainmentTemplatesRepository.create({
      user_id: 'user-2',
      title: 'Lower A',
    })
    const catalog = await seedCatalog()

    await expect(
      sut.execute({
        userId: 'user-1',
        trainmentTemplateId: template.id,
        exerciseCatalogId: catalog.id,
      }),
    ).rejects.toBeInstanceOf(NotAllowedError)
  })

  it('throws ResourceNotFoundError for an unknown catalog id', async () => {
    const template = await trainmentTemplatesRepository.create({
      user_id: 'user-1',
      title: 'Lower A',
    })

    await expect(
      sut.execute({
        userId: 'user-1',
        trainmentTemplateId: template.id,
        exerciseCatalogId: 'non-existing',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
