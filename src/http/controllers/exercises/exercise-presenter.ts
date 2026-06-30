import type { Exercise } from '@prisma-client'

export function exerciseToHTTP(exercise: Exercise) {
  return {
    id: exercise.id,
    trainmentId: exercise.trainment_id,
    exerciseTemplateId: exercise.exercise_template_id,
    plannedSets: exercise.planned_sets,
    createdAt: exercise.created_at,
  }
}
