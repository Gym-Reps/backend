import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryTrainmentTemplatesRepository } from '@/repositories/in-memory/in-memory-trainment-templates-repository'
import { InMemoryTrainmentsRepository } from '@/repositories/in-memory/in-memory-trainments-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'
import { StartTrainmentUseCase } from './start-trainment'

let trainmentsRepository: InMemoryTrainmentsRepository
let trainmentTemplatesRepository: InMemoryTrainmentTemplatesRepository
let sut: StartTrainmentUseCase

describe('Start Trainment Use Case', () => {
  beforeEach(() => {
    trainmentsRepository = new InMemoryTrainmentsRepository()
    trainmentTemplatesRepository = new InMemoryTrainmentTemplatesRepository()
    sut = new StartTrainmentUseCase(
      trainmentsRepository,
      trainmentTemplatesRepository,
    )
  })

  it('should start a session from an owned template with finished_at null', async () => {
    const template = await trainmentTemplatesRepository.create({
      user_id: 'user-1',
      title: 'Upper A',
    })

    const { trainment } = await sut.execute({
      userId: 'user-1',
      trainmentTemplateId: template.id,
    })

    expect(trainment.id).toEqual(expect.any(String))
    expect(trainment.started_at).toEqual(expect.any(Date))
    expect(trainment.finished_at).toBeNull()
    expect(trainment.trainment_template_id).toEqual(template.id)
    expect(trainmentsRepository.items).toHaveLength(1)
  })

  it('should throw ResourceNotFoundError when the template is absent', async () => {
    await expect(
      sut.execute({
        userId: 'user-1',
        trainmentTemplateId: 'non-existing-id',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should throw NotAllowedError when the template belongs to someone else', async () => {
    const template = await trainmentTemplatesRepository.create({
      user_id: 'user-2',
      title: 'Upper A',
    })

    await expect(
      sut.execute({
        userId: 'user-1',
        trainmentTemplateId: template.id,
      }),
    ).rejects.toBeInstanceOf(NotAllowedError)
  })

  it('should reject starting from a soft-deleted template but keep past trainments resolvable', async () => {
    const template = await trainmentTemplatesRepository.create({
      user_id: 'user-1',
      title: 'Upper A',
    })

    const { trainment } = await sut.execute({
      userId: 'user-1',
      trainmentTemplateId: template.id,
    })

    template.deleted_at = new Date()
    await trainmentTemplatesRepository.save(template)

    await expect(
      sut.execute({
        userId: 'user-1',
        trainmentTemplateId: template.id,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)

    // the historical session still resolves even though its template is retired
    await expect(
      trainmentsRepository.findById(trainment.id),
    ).resolves.toEqual(trainment)
  })
})
