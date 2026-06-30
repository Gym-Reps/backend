/**
 * One-off asset prep: download each catalog exercise's neutral, faceless
 * line-art figure from the OpenTraining / Everkinetic exercise set
 * (https://github.com/chaosbastler/opentraining-exercises, CC-BY-SA 3.0) and
 * write a lightweight ~256px WebP thumbnail to `public/exercises/<slug>.webp`.
 *
 * The source figures are black-on-transparent line drawings of a generic
 * mannequin (no real person), so they're flattened onto white and letterboxed
 * (`fit: contain`) to keep the whole pose visible.
 *
 * Run with: `npm run prepare:exercise-images`. The generated images are
 * committed (served via @fastify/static); re-run only when the catalog changes.
 * Attribution + license: see `public/exercises/CREDITS.md`.
 */
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { defaultExercises } from '../prisma/data/default-exercises.js'

const RAW_BASE =
  'https://raw.githubusercontent.com/chaosbastler/opentraining-exercises/master'

// slug → OpenTraining image basename (the "-1.png" start frame is appended).
const SOURCES: Record<string, string> = {
  // Chest
  'barbell-bench-press': 'Bench-press',
  'incline-dumbbell-press': 'still_unsorted/Dumbbell-incline-bench-press',
  'dumbbell-fly': 'Dumbbell-flys',
  'push-up': 'Push-ups',
  'cable-crossover': 'still_unsorted/Cable-crossover',
  // Back
  'pull-up': 'still_unsorted/Chin-ups',
  'lat-pulldown': 'still_unsorted/Close-grip-front-lat-pull-down',
  'bent-over-barbell-row': 'still_unsorted/Reverse-grip-bent-over-rows',
  'seated-cable-row': 'still_unsorted/Cable-seated-rows',
  deadlift: 'still_unsorted/Dead-lifts',
  superman: 'Supermans',
  // Shoulders
  'overhead-press': 'still_unsorted/Seated-military-shoulder-press',
  'dumbbell-shoulder-press': 'still_unsorted/Dumbbell-shoulder-press',
  'lateral-raise': 'Dumbbell-lateral-raises',
  'rear-delt-row': 'Rear-deltoid-row',
  'arnold-press': 'Arnold-press',
  // Biceps
  'barbell-curl': 'Biceps-curl',
  'dumbbell-curl': 'Bicep-curls',
  'hammer-curl': 'Bicep-hammer-curl',
  'concentration-curl': 'Concentration-curls',
  // Triceps
  'triceps-pushdown': 'Low-triceps-extension',
  'triceps-dip': 'Tricep-dips',
  skullcrusher: 'Lying-triceps-extension-across-face',
  'close-grip-bench-press': 'Narrow-grip-bench-press',
  'bench-dip': 'Bench-dips',
  // Core
  'side-plank': 'Side-plank',
  crunch: 'Crunches',
  'leg-raise': 'Leg-raises',
  // Quads
  'barbell-squat': 'Squats',
  'barbell-lunge': 'Lunges',
  // Hamstrings
  'good-morning': 'still_unsorted/Good-mornings',
  'leg-curl': 'still_unsorted/Seated-leg-curl',
  // Glutes
  'glute-bridge': 'Bridge',
  'glute-kickback': 'still_unsorted/One-legged-kickback',
}

async function main() {
  // Every catalog slug must have a mapped source.
  const unmapped = defaultExercises.filter((e) => !SOURCES[e.slug])
  if (unmapped.length) {
    throw new Error(
      `No image source for: ${unmapped.map((e) => e.slug).join(', ')}`,
    )
  }

  const outDir = path.resolve(process.cwd(), 'public', 'exercises')
  await mkdir(outDir, { recursive: true })

  // Clear any previously generated thumbnails so removed slugs don't linger.
  for (const file of await readdir(outDir)) {
    if (file.endsWith('.webp')) {
      await rm(path.join(outDir, file))
    }
  }

  let ok = 0

  for (const { slug } of defaultExercises) {
    const url = `${RAW_BASE}/${SOURCES[slug]}-1.png`
    const response = await fetch(url)

    if (!response.ok) {
      console.error(`✗ ${slug}: HTTP ${response.status} for ${url}`)
      continue
    }

    const input = Buffer.from(await response.arrayBuffer())
    const output = await sharp(input)
      .flatten({ background: '#ffffff' })
      .resize({
        width: 256,
        height: 256,
        fit: 'contain',
        background: '#ffffff',
      })
      .webp({ quality: 80 })
      .toBuffer()

    await writeFile(path.join(outDir, `${slug}.webp`), output)
    ok += 1
    console.log(`✓ ${slug}.webp (${(output.length / 1024).toFixed(1)} KB)`)
  }

  console.log(`\nDone: ${ok}/${defaultExercises.length} images written to ${outDir}`)

  if (ok !== defaultExercises.length) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
