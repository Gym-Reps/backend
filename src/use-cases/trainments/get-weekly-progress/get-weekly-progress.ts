import type { Trainment } from '@prisma-client'
import type { TrainmentsRepository } from '@/repositories/trainments-repository'
import type { UserPreferencesRepository } from '@/repositories/user-preferences-repository'
import { resolvePreferences } from '../../user-preferences/preferences'
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
  constructor(
    private trainmentsRepository: TrainmentsRepository,
    private userPreferencesRepository: UserPreferencesRepository,
  ) {}

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

    // The weekly goal lives in the user's preferences (02_USER_PREFERENCES);
    // `weeklyTrainingCount` may be null (no goal set).
    const preferences =
      await this.userPreferencesRepository.findByUserId(userId)
    const goal = preferences
      ? resolvePreferences(preferences.preferences).weeklyTrainingCount
      : null

    return {
      weekStart,
      weekEnd,
      completed: trainments.length,
      goal,
      trainments,
    }
  }
}
