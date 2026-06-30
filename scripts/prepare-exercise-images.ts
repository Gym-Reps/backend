/**
 * One-off asset prep: download each catalog exercise's photo from the
 * public-domain free-exercise-db (https://github.com/yuhonas/free-exercise-db,
 * The Unlicense) and write a lightweight ~256px WebP thumbnail to
 * `public/exercises/<slug>.webp`.
 *
 * Run with: `npx tsx scripts/prepare-exercise-images.ts`
 *
 * The generated images are committed to the repo (served via @fastify/static),
 * so this script only needs to be re-run when the catalog list changes.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const RAW_BASE =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises'

// slug → free-exercise-db id (the folder holding that exercise's images).
const SOURCES: Record<string, string> = {
  'barbell-bench-press': 'Barbell_Bench_Press_-_Medium_Grip',
  'incline-dumbbell-press': 'Incline_Dumbbell_Press',
  'dumbbell-fly': 'Dumbbell_Flyes',
  'push-up': 'Pushups',
  'pull-up': 'Pullups',
  'lat-pulldown': 'Wide-Grip_Lat_Pulldown',
  'bent-over-barbell-row': 'Bent_Over_Barbell_Row',
  'seated-cable-row': 'Seated_Cable_Rows',
  deadlift: 'Barbell_Deadlift',
  'overhead-press': 'Standing_Military_Press',
  'dumbbell-shoulder-press': 'Dumbbell_Shoulder_Press',
  'lateral-raise': 'Side_Lateral_Raise',
  'face-pull': 'Face_Pull',
  'barbell-curl': 'Barbell_Curl',
  'dumbbell-curl': 'Dumbbell_Bicep_Curl',
  'hammer-curl': 'Hammer_Curls',
  'triceps-pushdown': 'Triceps_Pushdown',
  'triceps-dip': 'Dips_-_Triceps_Version',
  skullcrusher: 'EZ-Bar_Skullcrusher',
  'close-grip-bench-press': 'Close-Grip_Barbell_Bench_Press',
  'barbell-wrist-curl': 'Palms-Up_Barbell_Wrist_Curl_Over_A_Bench',
  'cable-wrist-curl': 'Cable_Wrist_Curl',
  plank: 'Plank',
  crunch: 'Crunches',
  'hanging-leg-raise': 'Hanging_Leg_Raise',
  'barbell-squat': 'Barbell_Full_Squat',
  'leg-press': 'Leg_Press',
  'leg-extension': 'Leg_Extensions',
  'barbell-lunge': 'Barbell_Lunge',
  'romanian-deadlift': 'Romanian_Deadlift',
  'lying-leg-curl': 'Lying_Leg_Curls',
  'hip-thrust': 'Barbell_Hip_Thrust',
  'standing-calf-raise': 'Standing_Calf_Raises',
  'seated-calf-raise': 'Seated_Calf_Raise',
}

async function main() {
  const outDir = path.resolve(process.cwd(), 'public', 'exercises')
  await mkdir(outDir, { recursive: true })

  const entries = Object.entries(SOURCES)
  let ok = 0

  for (const [slug, id] of entries) {
    const url = `${RAW_BASE}/${id}/0.jpg`
    const response = await fetch(url)

    if (!response.ok) {
      console.error(`✗ ${slug}: HTTP ${response.status} for ${url}`)
      continue
    }

    const input = Buffer.from(await response.arrayBuffer())
    const output = await sharp(input)
      .resize({ width: 256, height: 256, fit: 'cover', position: 'centre' })
      .webp({ quality: 78 })
      .toBuffer()

    await writeFile(path.join(outDir, `${slug}.webp`), output)
    ok += 1
    console.log(`✓ ${slug}.webp (${(output.length / 1024).toFixed(1)} KB)`)
  }

  console.log(`\nDone: ${ok}/${entries.length} images written to ${outDir}`)

  if (ok !== entries.length) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
