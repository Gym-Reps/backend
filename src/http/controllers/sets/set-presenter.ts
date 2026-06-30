import type { Set as SetModel } from '@prisma-client'

export function setToHTTP(set: SetModel) {
  return {
    id: set.id,
    trainmentId: set.trainment_id,
    exerciseId: set.exercise_id,
    index: set.index,
    weight: set.weight,
    repetitions: set.repetitions,
    performedAt: set.performed_at,
  }
}
