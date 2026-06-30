import type { DefaultExercise } from '@prisma-client'
import { env } from '@/env'

/**
 * Exposes the resolved `imageUrl` (`${APP_URL}${image_path}`) and hides the
 * internal `image_path`/timestamps — the stored path stays host-agnostic.
 */
export function catalogExerciseToHTTP(exercise: DefaultExercise) {
  return {
    id: exercise.id,
    title: exercise.title,
    slug: exercise.slug,
    muscleGroup: exercise.muscle_group,
    imageUrl: `${env.APP_URL}${exercise.image_path}`,
  }
}
