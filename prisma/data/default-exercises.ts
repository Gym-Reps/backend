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
 * `/static/exercises/<slug>.webp`). They were derived from the public-domain
 * free-exercise-db (https://github.com/yuhonas/free-exercise-db, The Unlicense),
 * downsized to ~256px WebP thumbnails — see `scripts/prepare-exercise-images`.
 */
export const defaultExercises: DefaultExerciseSeed[] = (
  [
    // Chest
    ['barbell-bench-press', 'Barbell Bench Press', 'CHEST'],
    ['incline-dumbbell-press', 'Incline Dumbbell Press', 'CHEST'],
    ['dumbbell-fly', 'Dumbbell Fly', 'CHEST'],
    ['push-up', 'Push-Up', 'CHEST'],
    // Back
    ['pull-up', 'Pull-Up', 'BACK'],
    ['lat-pulldown', 'Lat Pulldown', 'BACK'],
    ['bent-over-barbell-row', 'Bent-Over Barbell Row', 'BACK'],
    ['seated-cable-row', 'Seated Cable Row', 'BACK'],
    ['deadlift', 'Deadlift', 'BACK'],
    // Shoulders
    ['overhead-press', 'Overhead Press', 'SHOULDERS'],
    ['dumbbell-shoulder-press', 'Dumbbell Shoulder Press', 'SHOULDERS'],
    ['lateral-raise', 'Lateral Raise', 'SHOULDERS'],
    ['face-pull', 'Face Pull', 'SHOULDERS'],
    // Biceps
    ['barbell-curl', 'Barbell Curl', 'BICEPS'],
    ['dumbbell-curl', 'Dumbbell Curl', 'BICEPS'],
    ['hammer-curl', 'Hammer Curl', 'BICEPS'],
    // Triceps
    ['triceps-pushdown', 'Triceps Pushdown', 'TRICEPS'],
    ['triceps-dip', 'Triceps Dip', 'TRICEPS'],
    ['skullcrusher', 'Skullcrusher', 'TRICEPS'],
    ['close-grip-bench-press', 'Close-Grip Bench Press', 'TRICEPS'],
    // Forearms
    ['barbell-wrist-curl', 'Barbell Wrist Curl', 'FOREARMS'],
    ['cable-wrist-curl', 'Cable Wrist Curl', 'FOREARMS'],
    // Core
    ['plank', 'Plank', 'CORE'],
    ['crunch', 'Crunch', 'CORE'],
    ['hanging-leg-raise', 'Hanging Leg Raise', 'CORE'],
    // Quads
    ['barbell-squat', 'Barbell Squat', 'QUADS'],
    ['leg-press', 'Leg Press', 'QUADS'],
    ['leg-extension', 'Leg Extension', 'QUADS'],
    ['barbell-lunge', 'Barbell Lunge', 'QUADS'],
    // Hamstrings
    ['romanian-deadlift', 'Romanian Deadlift', 'HAMSTRINGS'],
    ['lying-leg-curl', 'Lying Leg Curl', 'HAMSTRINGS'],
    // Glutes
    ['hip-thrust', 'Hip Thrust', 'GLUTES'],
    // Calves
    ['standing-calf-raise', 'Standing Calf Raise', 'CALVES'],
    ['seated-calf-raise', 'Seated Calf Raise', 'CALVES'],
  ] satisfies [string, string, MuscleGroup][]
).map(([slug, title, muscleGroup]) => ({
  slug,
  title,
  muscleGroup,
  imagePath: `/static/exercises/${slug}.webp`,
}))
