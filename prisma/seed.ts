import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'
import { defaultExercises } from './data/default-exercises.js'

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

// The `..._seed_default_exercises` migration is the primary ingestion path (runs
// on every `migrate deploy`). This seed mirrors the same canonical list so a
// plain `prisma db seed` produces an identical catalog; `slug` is the upsert key.
async function main() {
  for (const exercise of defaultExercises) {
    const data = {
      title: exercise.title,
      slug: exercise.slug,
      muscle_group: exercise.muscleGroup,
      image_path: exercise.imagePath,
    }

    await prisma.defaultExercise.upsert({
      where: { slug: exercise.slug },
      update: data,
      create: data,
    })
  }

  console.log(`Seeded ${defaultExercises.length} catalog exercises.`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
