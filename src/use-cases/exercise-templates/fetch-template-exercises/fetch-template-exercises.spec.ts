import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryExerciseTemplatesRepository } from '@/repositories/in-memory/in-memory-exercise-templates-repository'
import { InMemoryTrainmentTemplatesRepository } from '@/repositories/in-memory/in-memory-trainment-templates-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { FetchTemplateExercisesUseCase } from './fetch-template-exercises'

let exerciseTemplatesRepository: InMemoryExerciseTemplatesRepository
let trainmentTemplatesRepository: InMemoryTrainmentTemplatesRepository
let sut: FetchTemplateExercisesUseCase

describe('Fetch Template Exercises Use Case', () => {
  beforeEach(() => {
    exerciseTemplatesRepository = new InMemoryExerciseTemplatesRepository()
    trainmentTemplatesRepository = new InMemoryTrainmentTemplatesRepository()
    sut = new FetchTemplateExercisesUseCase(
      exerciseTemplatesRepository,
      trainmentTemplatesRepository,
    )
  })

  it('lists active slots and excludes soft-deleted ones', async () => {
    const template = await trainmentTemplatesRepository.create({
      user_id: 'user-1',
      title: 'Lower A',
    })

    await exerciseTemplatesRepository.create({
      trainment_template_id: template.id,
      exercise_catalog_id: 'c1',
      title: 'Squat',
    })
    const removed = await exerciseTemplatesRepository.create({
      trainment_template_id: template.id,
      exercise_catalog_id: 'c2',
      title: 'Leg Press',
    })
    removed.deleted_at = new Date()
    await exerciseTemplatesRepository.save(removed)

    const { exerciseTemplates } = await sut.execute({
      userId: 'user-1',
      trainmentTemplateId: template.id,
    })

    expect(exerciseTemplates).toHaveLength(1)
    expect(exerciseTemplates[0]?.title).toEqual('Squat')
  })

  it('throws NotAllowedError for a non-owned template', async () => {
    const template = await trainmentTemplatesRepository.create({
      user_id: 'user-2',
      title: 'Lower A',
    })

    await expect(
      sut.execute({ userId: 'user-1', trainmentTemplateId: template.id }),
    ).rejects.toBeInstanceOf(NotAllowedError)
  })
})
