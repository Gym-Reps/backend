import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryExerciseTemplatesRepository } from '@/repositories/in-memory/in-memory-exercise-templates-repository'
import { InMemoryExercisesRepository } from '@/repositories/in-memory/in-memory-exercises-repository'
import { InMemoryTrainmentTemplatesRepository } from '@/repositories/in-memory/in-memory-trainment-templates-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { RemoveExerciseTemplateUseCase } from './remove-exercise-template'

let exerciseTemplatesRepository: InMemoryExerciseTemplatesRepository
let trainmentTemplatesRepository: InMemoryTrainmentTemplatesRepository
let sut: RemoveExerciseTemplateUseCase

describe('Remove Exercise Template Use Case', () => {
  beforeEach(() => {
    exerciseTemplatesRepository = new InMemoryExerciseTemplatesRepository()
    trainmentTemplatesRepository = new InMemoryTrainmentTemplatesRepository()
    sut = new RemoveExerciseTemplateUseCase(
      exerciseTemplatesRepository,
      trainmentTemplatesRepository,
    )
  })

  it('soft-deletes the slot, bumps the parent updated_at, and a past exercise still resolves it', async () => {
    const template = await trainmentTemplatesRepository.create({
      user_id: 'user-1',
      title: 'Lower A',
    })
    template.updated_at = new Date('2020-01-01')
    await trainmentTemplatesRepository.save(template)

    const slot = await exerciseTemplatesRepository.create({
      trainment_template_id: template.id,
      exercise_catalog_id: 'c1',
      title: 'Squat',
    })

    // a performed exercise referencing the slot
    const exercisesRepository = new InMemoryExercisesRepository()
    const performed = await exercisesRepository.create({
      trainment_id: 't1',
      exercise_template_id: slot.id,
    })

    await sut.execute({ userId: 'user-1', exerciseTemplateId: slot.id })

    expect(await exerciseTemplatesRepository.findById(slot.id)).toBeNull()
    expect(
      await exerciseTemplatesRepository.findManyByTemplateId(template.id),
    ).toHaveLength(0)

    const parent = await trainmentTemplatesRepository.findById(template.id)
    expect(parent!.updated_at.getTime()).toBeGreaterThan(
      new Date('2020-01-01').getTime(),
    )

    // the past performed exercise still points at the (now-deleted) slot
    const stillThere = await exercisesRepository.findById(performed.id)
    expect(stillThere?.exercise_template_id).toEqual(slot.id)
  })

  it('throws NotAllowedError for a non-owned slot', async () => {
    const template = await trainmentTemplatesRepository.create({
      user_id: 'user-2',
      title: 'Lower A',
    })
    const slot = await exerciseTemplatesRepository.create({
      trainment_template_id: template.id,
      exercise_catalog_id: 'c1',
      title: 'Squat',
    })

    await expect(
      sut.execute({ userId: 'user-1', exerciseTemplateId: slot.id }),
    ).rejects.toBeInstanceOf(NotAllowedError)
  })
})
