import type { Event, Exercise, Metric } from '@prisma-client'
import type { ExercisesRepository } from '@/repositories/exercises-repository'
import type { MetricsRepository } from '@/repositories/metrics-repository'
import type { SetsRepository } from '@/repositories/sets-repository'
import type { TrainmentsRepository } from '@/repositories/trainments-repository'
import type { EventHandler } from '../../events/_handlers/event-handler'

interface ComputeTrainmentMetricsUseCaseRequest {
  trainmentId: string
}

interface ComputeTrainmentMetricsUseCaseResponse {
  metrics: Metric[]
}

/**
 * The `COMPUTE_TRAINMENT_METRICS` handler (09_METRICS). For a finished current
 * trainment it finds the immediately-preceding same-template session, matches
 * exercises by template slot and sets by `index`, and upserts a signed
 * (current − previous) weight/reps diff per set. Idempotent: keyed on the unique
 * `current_set_id`, so re-processing the event yields identical rows.
 */
export class ComputeTrainmentMetricsUseCase implements EventHandler {
  constructor(
    private trainmentsRepository: TrainmentsRepository,
    private exercisesRepository: ExercisesRepository,
    private setsRepository: SetsRepository,
    private metricsRepository: MetricsRepository,
  ) {}

  /** EventHandler entrypoint: reads `trainmentId` from the event metadata. */
  async handle(event: Event): Promise<void> {
    const { trainmentId } = (event.metadata ?? {}) as { trainmentId?: string }

    if (!trainmentId) {
      return
    }

    await this.execute({ trainmentId })
  }

  async execute({
    trainmentId,
  }: ComputeTrainmentMetricsUseCaseRequest): Promise<ComputeTrainmentMetricsUseCaseResponse> {
    const current = await this.trainmentsRepository.findById(trainmentId)

    // Missing trainment (e.g. deleted after enqueue) is a terminal no-op.
    if (!current) {
      return { metrics: [] }
    }

    const previous = await this.trainmentsRepository.findPreviousSameTemplate({
      userId: current.user_id,
      trainmentTemplateId: current.trainment_template_id,
      before: current.started_at,
      excludeTrainmentId: current.id,
    })

    // First-ever session of this template → no baseline to diff against.
    if (!previous) {
      return { metrics: [] }
    }

    const currentExercises =
      await this.exercisesRepository.findManyByTrainmentId(current.id)
    const previousExercises =
      await this.exercisesRepository.findManyByTrainmentId(previous.id)

    // Match exercises by their template slot (same Bench-Press slot in Upper A).
    const previousByTemplate = new Map<string, Exercise>()
    for (const exercise of previousExercises) {
      if (!previousByTemplate.has(exercise.exercise_template_id)) {
        previousByTemplate.set(exercise.exercise_template_id, exercise)
      }
    }

    const metrics: Metric[] = []

    for (const exercise of currentExercises) {
      const previousExercise = previousByTemplate.get(
        exercise.exercise_template_id,
      )

      if (!previousExercise) {
        continue
      }

      const currentSets = await this.setsRepository.findManyByExerciseId(
        exercise.id,
      )
      const previousSets = await this.setsRepository.findManyByExerciseId(
        previousExercise.id,
      )
      const previousByIndex = new Map(previousSets.map((set) => [set.index, set]))

      for (const set of currentSets) {
        const previousSet = previousByIndex.get(set.index)

        // No matching slot/index (set counts differ) → skip.
        if (!previousSet) {
          continue
        }

        // Unlogged sets carry no comparable value → skip.
        if (
          set.weight === null ||
          set.repetitions === null ||
          previousSet.weight === null ||
          previousSet.repetitions === null
        ) {
          continue
        }

        const metric = await this.metricsRepository.upsertByCurrentSetId({
          user_id: current.user_id,
          trainment_id: current.id,
          exercise_id: exercise.id,
          previous_set_id: previousSet.id,
          current_set_id: set.id,
          weight_diff: set.weight - previousSet.weight,
          repetitions_diff: set.repetitions - previousSet.repetitions,
        })

        metrics.push(metric)
      }
    }

    return { metrics }
  }
}
