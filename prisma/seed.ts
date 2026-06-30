import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('Provide a DATABASE_URL env variable')
}

const schema = new URL(databaseUrl).searchParams.get('schema') ?? undefined
const adapter = new PrismaPg(
  { connectionString: databaseUrl },
  schema ? { schema } : undefined,
)
const prisma = new PrismaClient({ adapter })

// Curated catalog. `slug` is the stable upsert key; matching images live under
// public/exercises/<slug>.webp and are served at /static/exercises/<slug>.webp.
const exercises = [
  { title: 'Barbell Bench Press', slug: 'barbell-bench-press', muscle_group: 'CHEST' },
  { title: 'Incline Dumbbell Press', slug: 'incline-dumbbell-press', muscle_group: 'CHEST' },
  { title: 'Pull Up', slug: 'pull-up', muscle_group: 'BACK' },
  { title: 'Barbell Row', slug: 'barbell-row', muscle_group: 'BACK' },
  { title: 'Deadlift', slug: 'deadlift', muscle_group: 'BACK' },
  { title: 'Overhead Press', slug: 'overhead-press', muscle_group: 'SHOULDERS' },
  { title: 'Lateral Raise', slug: 'lateral-raise', muscle_group: 'SHOULDERS' },
  { title: 'Barbell Curl', slug: 'barbell-curl', muscle_group: 'BICEPS' },
  { title: 'Triceps Pushdown', slug: 'triceps-pushdown', muscle_group: 'TRICEPS' },
  { title: 'Plank', slug: 'plank', muscle_group: 'CORE' },
  { title: 'Back Squat', slug: 'back-squat', muscle_group: 'QUADS' },
  { title: 'Romanian Deadlift', slug: 'romanian-deadlift', muscle_group: 'HAMSTRINGS' },
  { title: 'Hip Thrust', slug: 'hip-thrust', muscle_group: 'GLUTES' },
  { title: 'Standing Calf Raise', slug: 'standing-calf-raise', muscle_group: 'CALVES' },
] as const

async function main() {
  for (const exercise of exercises) {
    const data = {
      title: exercise.title,
      slug: exercise.slug,
      muscle_group: exercise.muscle_group,
      image_path: `/static/exercises/${exercise.slug}.webp`,
    }

    await prisma.defaultExercise.upsert({
      where: { slug: exercise.slug },
      update: data,
      create: data,
    })
  }

  console.log(`Seeded ${exercises.length} catalog exercises.`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
