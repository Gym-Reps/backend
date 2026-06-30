import type { Trainment } from '@prisma-client'

export function trainmentToHTTP(trainment: Trainment) {
  return {
    id: trainment.id,
    trainmentTemplateId: trainment.trainment_template_id,
    userId: trainment.user_id,
    startedAt: trainment.started_at,
    finishedAt: trainment.finished_at,
  }
}
