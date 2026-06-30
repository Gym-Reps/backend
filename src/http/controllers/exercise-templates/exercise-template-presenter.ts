import type { ExerciseTemplate } from '@prisma-client'

export function exerciseTemplateToHTTP(exerciseTemplate: ExerciseTemplate) {
  return {
    id: exerciseTemplate.id,
    trainmentTemplateId: exerciseTemplate.trainment_template_id,
    exerciseCatalogId: exerciseTemplate.exercise_catalog_id,
    title: exerciseTemplate.title,
    createdAt: exerciseTemplate.created_at,
  }
}
