import type { MuscleGroup } from '../../generated/prisma/enums.js'

export interface DefaultExerciseSeed {
  slug: string
  title: string
  muscleGroup: MuscleGroup
  imagePath: string
}

/**
 * Canonical catalog of common gym exercises. Single source of truth shared by
 * the data migration (`..._seed_default_exercises`) and `prisma/seed.ts`.
 *
 * Images live under `public/exercises/<slug>.webp` (served at
 * `/static/exercises/<slug>.webp`). They are neutral, faceless line-art figures
 * derived from the OpenTraining / Everkinetic exercise set
 * (https://github.com/chaosbastler/opentraining-exercises, CC-BY-SA 3.0),
 * downsized to ~256px WebP — see `scripts/prepare-exercise-images.ts` and
 * `public/exercises/CREDITS.md`. This set has no forearm/calf line-art, so those
 * groups are intentionally not represented yet.
 */
export const defaultExercises: DefaultExerciseSeed[] = (
  [
    // Chest
    ['barbell-bench-press', 'Barbell Bench Press', 'CHEST'],
    ['incline-dumbbell-press', 'Incline Dumbbell Press', 'CHEST'],
    ['dumbbell-fly', 'Dumbbell Fly', 'CHEST'],
    ['push-up', 'Push-Up', 'CHEST'],
    ['cable-crossover', 'Cable Crossover', 'CHEST'],
    // Back
    ['pull-up', 'Pull-Up', 'BACK'],
    ['lat-pulldown', 'Lat Pulldown', 'BACK'],
    ['bent-over-barbell-row', 'Bent-Over Barbell Row', 'BACK'],
    ['seated-cable-row', 'Seated Cable Row', 'BACK'],
    ['deadlift', 'Deadlift', 'BACK'],
    ['superman', 'Superman', 'BACK'],
    // Shoulders
    ['overhead-press', 'Overhead Press', 'SHOULDERS'],
    ['dumbbell-shoulder-press', 'Dumbbell Shoulder Press', 'SHOULDERS'],
    ['lateral-raise', 'Lateral Raise', 'SHOULDERS'],
    ['rear-delt-row', 'Rear Delt Row', 'SHOULDERS'],
    ['arnold-press', 'Arnold Press', 'SHOULDERS'],
    // Biceps
    ['barbell-curl', 'Barbell Curl', 'BICEPS'],
    ['dumbbell-curl', 'Dumbbell Curl', 'BICEPS'],
    ['hammer-curl', 'Hammer Curl', 'BICEPS'],
    ['concentration-curl', 'Concentration Curl', 'BICEPS'],
    // Triceps
    ['triceps-pushdown', 'Triceps Pushdown', 'TRICEPS'],
    ['triceps-dip', 'Triceps Dip', 'TRICEPS'],
    ['skullcrusher', 'Skullcrusher', 'TRICEPS'],
    ['close-grip-bench-press', 'Close-Grip Bench Press', 'TRICEPS'],
    ['bench-dip', 'Bench Dip', 'TRICEPS'],
    // Core
    ['side-plank', 'Side Plank', 'CORE'],
    ['crunch', 'Crunch', 'CORE'],
    ['leg-raise', 'Leg Raise', 'CORE'],
    // Quads
    ['barbell-squat', 'Barbell Squat', 'QUADS'],
    ['barbell-lunge', 'Barbell Lunge', 'QUADS'],
    // Hamstrings
    ['good-morning', 'Good Morning', 'HAMSTRINGS'],
    ['leg-curl', 'Leg Curl', 'HAMSTRINGS'],
    // Glutes
    ['glute-bridge', 'Glute Bridge', 'GLUTES'],
    ['glute-kickback', 'Glute Kickback', 'GLUTES'],
  ] satisfies [string, string, MuscleGroup][]
).map(([slug, title, muscleGroup]) => ({
  slug,
  title,
  muscleGroup,
  imagePath: `/static/exercises/${slug}.webp`,
}))
