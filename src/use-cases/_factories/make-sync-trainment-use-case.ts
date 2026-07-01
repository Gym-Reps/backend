import { PrismaExerciseTemplatesRepository } from '@/repositories/prisma/prisma-exercise-templates-repository'
import { PrismaTrainmentSyncRepository } from '@/repositories/prisma/prisma-trainment-sync-repository'
import { PrismaTrainmentTemplatesRepository } from '@/repositories/prisma/prisma-trainment-templates-repository'
import { BullMqEventQueue } from '@/queues/bullmq-event-queue'
import { SyncTrainmentUseCase } from '../sync/sync-trainment/sync-trainment'

export function makeSyncTrainmentUseCase() {
  const trainmentSyncRepository = new PrismaTrainmentSyncRepository()
  const trainmentTemplatesRepository = new PrismaTrainmentTemplatesRepository()
  const exerciseTemplatesRepository = new PrismaExerciseTemplatesRepository()
  const eventQueue = new BullMqEventQueue()

  return new SyncTrainmentUseCase(
    trainmentSyncRepository,
    trainmentTemplatesRepository,
    exerciseTemplatesRepository,
    eventQueue,
  )
}
