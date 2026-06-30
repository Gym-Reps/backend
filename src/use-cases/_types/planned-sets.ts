/**
 * The `exercise.planned_sets` JSONB contract (owned by the Exercises module,
 * specified by 06_SETS_MODULE):
 *
 *   { "1": { weight, min_reps, max_reps }, "2": { ... } }
 *
 * Keys are stringified, 1-based, contiguous indices; values are nullable
 * placeholders. `N = Object.keys(planned_sets).length` is the authoritative
 * number of sets for the exercise.
 */
export interface PlannedSetEntry {
  weight: number | null
  min_reps: number | null
  max_reps: number | null
}

export type PlannedSets = Record<string, PlannedSetEntry>

/**
 * Read a persisted `exercise.planned_sets` (typed as Prisma JSON) as PlannedSets.
 * Writes always conform to the contract, so the cast is safe; `null`/absent ⇒ {}.
 */
export function asPlannedSets(value: unknown): PlannedSets {
  return (value ?? {}) as PlannedSets
}

/** Numeric set indices present in a planned_sets map, ascending. */
export function plannedSetIndices(plannedSets: PlannedSets): number[] {
  return Object.keys(plannedSets)
    .map(Number)
    .sort((a, b) => a - b)
}

/** Number of planned sets (the authoritative set count). */
export function plannedSetCount(plannedSets: PlannedSets): number {
  return Object.keys(plannedSets).length
}
