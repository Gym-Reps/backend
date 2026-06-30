import type { Trainment } from '@prisma-client'
import type { TrainmentsRepository } from '@/repositories/trainments-repository'
import { getWeekRange } from '../../_utils/week-range'

interface GetWeeklyProgressUseCaseRequest {
  userId: string
  /** Reference instant for the week window; defaults to now. Kept for tests. */
  reference?: Date
}

interface GetWeeklyProgressUseCaseResponse {
  weekStart: Date
  weekEnd: Date
  completed: number
  goal: number | null
  trainments: Trainment[]
}

export class GetWeeklyProgressUseCase {
  constructor(private trainmentsRepository: TrainmentsRepository) {}

  async execute({
    userId,
    reference,
  }: GetWeeklyProgressUseCaseRequest): Promise<GetWeeklyProgressUseCaseResponse> {
    const { weekStart, weekEnd } = getWeekRange(reference)

    const trainments =
      await this.trainmentsRepository.findFinishedByUserIdInPeriod(
        userId,
        weekStart,
        weekEnd,
      )

    // TODO(02_USER_PREFERENCES_MODULE): read weeklyTrainingCount from the user's
    // preferences for the goal. Until that module exists, no goal is available.
    const goal: number | null = null

    return {
      weekStart,
      weekEnd,
      completed: trainments.length,
      goal,
      trainments,
    }
  }
}
