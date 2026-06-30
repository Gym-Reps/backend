import { beforeEach, describe, expect, it } from 'vitest'
import { InMemorySetsRepository } from '@/repositories/in-memory/in-memory-sets-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'
import { UpdateSetUseCase } from './update-set'

let setsRepository: InMemorySetsRepository
let sut: UpdateSetUseCase

async function seedSet(userId = 'user-1') {
  const [set] = await setsRepository.createMany([
    {
      trainment_id: 'trainment-1',
      exercise_id: 'exercise-1',
      user_id: userId,
      index: 1,
      weight: null,
      repetitions: null,
    },
  ])
  return set!
}

describe('Update Set Use Case', () => {
  beforeEach(() => {
    setsRepository = new InMemorySetsRepository()
    sut = new UpdateSetUseCase(setsRepository)
  })

  it('logs actual weight and repetitions and stamps performed_at', async () => {
    const seeded = await seedSet()

    const { set } = await sut.execute({
      userId: 'user-1',
      setId: seeded.id,
      weight: 82.5,
      repetitions: 8,
    })

    expect(set.weight).toEqual(82.5)
    expect(set.repetitions).toEqual(8)
    expect(set.performed_at).toEqual(expect.any(Date))
  })

  it('throws ResourceNotFoundError when the set is absent', async () => {
    await expect(
      sut.execute({ userId: 'user-1', setId: 'non-existing', weight: 10 }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('throws NotAllowedError when owned by someone else', async () => {
    const seeded = await seedSet('user-2')

    await expect(
      sut.execute({ userId: 'user-1', setId: seeded.id, weight: 10 }),
    ).rejects.toBeInstanceOf(NotAllowedError)
  })
})
