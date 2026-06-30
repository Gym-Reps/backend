import { z } from 'zod'

/**
 * Zod validator for the `exercise.planned_sets` contract (06_SETS_MODULE):
 * stringified, 1-based, contiguous keys; nullable weight/min_reps/max_reps.
 */
export const plannedSetsSchema = z
  .record(
    z.string().regex(/^\d+$/),
    z.object({
      weight: z.number().nullable(),
      min_reps: z.number().int().nullable(),
      max_reps: z.number().int().nullable(),
    }),
  )
  .refine(
    (plannedSets) => {
      const indices = Object.keys(plannedSets)
        .map(Number)
        .sort((a, b) => a - b)
      return (
        indices.length > 0 &&
        indices.every((value, position) => value === position + 1)
      )
    },
    { message: 'planned_sets keys must be contiguous 1..N' },
  )
