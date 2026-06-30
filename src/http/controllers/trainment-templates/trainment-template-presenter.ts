import type { TrainmentTemplate } from '@prisma-client'

export function trainmentTemplateToHTTP(template: TrainmentTemplate) {
  return {
    id: template.id,
    title: template.title,
    createdAt: template.created_at,
    updatedAt: template.updated_at,
  }
}
