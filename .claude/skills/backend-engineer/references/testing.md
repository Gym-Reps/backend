# Testing harness (Vitest: unit + e2e)

Two test kinds, two Vitest **projects**:

- **unit** — `src/use-cases/**` run against **in-memory** repositories. Fast,
  no DB. One per business-rule addition. **Required for every addition.**
- **e2e** — `src/http/controllers/**` boot the real Fastify `app` and hit it
  with `supertest` against a **real Postgres** (isolated schema per file).
  **Required whenever a new controller/route is added.**

## package.json scripts

```json
{
  "scripts": {
    "dev": "tsx --watch src/server.ts",
    "build": "prisma generate && tsup src --out-dir build",
    "start": "node build/server.js",
    "postinstall": "prisma generate",
    "test": "vitest run --project unit",
    "test:e2e": "vitest run --project e2e",
    "test:watch": "vitest --project unit",
    "test:e2e:watch": "vitest --project e2e",
    "test:coverage": "vitest --coverage"
  }
}
```

Dev deps to add if absent: `vitest`, `@vitest/coverage-v8`, `vite-tsconfig-paths`
(or `resolve.tsconfigPaths`), `supertest`, `@types/supertest`, `tsx`, `tsup`,
plus `bcryptjs` / `@fastify/jwt` / `@fastify/cookie` / `dayjs` as features need.

## vite.config.ts (defines the two projects)

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    dir: 'src',
    projects: [
      {
        extends: true,
        test: { name: 'unit', dir: 'src/use-cases' },
      },
      {
        extends: true,
        test: {
          name: 'e2e',
          dir: 'src/http/controllers',
          environment:
            './prisma/vitest-environment-prisma/prisma-test-environment.ts',
        },
      },
    ],
  },
})
```

Ensure `tsconfig.json` has `"paths": { "@/*": ["./src/*"] }` so the alias
resolves in tests.

## Prisma test environment (isolated schema per e2e file)

Creates a unique Postgres schema before each e2e file, runs migrations into it,
and drops it on teardown — so e2e tests never collide.

```typescript
// prisma/vitest-environment-prisma/prisma-test-environment.ts
import 'dotenv/config'
import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import type { Environment } from 'vitest/environments'

function generateDatabaseUrl(schema: string) {
  if (!process.env.DATABASE_URL) throw new Error('Provide a DATABASE_URL env variable')
  const url = new URL(process.env.DATABASE_URL)
  url.searchParams.set('schema', schema)
  return url.toString()
}

export default <Environment>{
  name: 'prisma',
  viteEnvironment: 'ssr',
  async setup() {
    const schema = randomUUID()
    const databaseUrl = generateDatabaseUrl(schema)
    process.env.DATABASE_URL = databaseUrl
    execSync('npx prisma migrate deploy')

    return {
      async teardown() {
        const prisma = new PrismaClient({
          adapter: new PrismaPg({ connectionString: databaseUrl }),
        })
        await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`)
        await prisma.$disconnect()
      },
    }
  },
}
```

Requires a running Postgres (`docker compose up -d`) and a `DATABASE_URL`. The
project's `docker-compose.yaml` exposes Postgres on `localhost:5480`.

---

## Unit test pattern (in-memory repo, `sut`)

Instantiate fresh in-memory repos and the use-case (`sut` = system under test)
in `beforeEach`. Cover the happy path **and every error branch**. Use
`vi.useFakeTimers()` for date-dependent rules.

```typescript
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { MaxNumberOfCheckInsError } from '../errors/max-number-of-check-ins-error'
import { CheckInUseCase } from './check-in'

let checkInsRepository: InMemoryCheckInsRepository
let gymsRepository: InMemoryGymsRepository
let sut: CheckInUseCase

describe('Check-In Use Case', () => {
  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository()
    gymsRepository = new InMemoryGymsRepository()
    sut = new CheckInUseCase(checkInsRepository, gymsRepository)
    await gymsRepository.create({
      id: 'gym-01', title: 'Academia 01', description: '',
      latitude: -22.92, longitude: -49.09, phone: '',
    })
    vi.useFakeTimers()
  })
  afterEach(() => vi.useRealTimers())

  it('should be able to check in', async () => {
    const { checkIn } = await sut.execute({
      gymId: 'gym-01', userId: 'user-01',
      userLatitude: -22.92, userLongitude: -49.09,
    })
    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not allow two check-ins on the same day', async () => {
    vi.setSystemTime(new Date(2026, 0, 20, 8, 0, 0))
    await sut.execute({ gymId: 'gym-01', userId: 'user-01', userLatitude: -22.92, userLongitude: -49.09 })
    await expect(
      sut.execute({ gymId: 'gym-01', userId: 'user-01', userLatitude: -22.92, userLongitude: -49.09 }),
    ).rejects.toBeInstanceOf(MaxNumberOfCheckInsError)
  })
})
```

For DDD use-cases that return `Either`, assert on the result instead of
rejection: `expect(result.isRight()).toBe(true)` /
`expect(result.value).toBeInstanceOf(ResourceNotFoundError)`.

---

## E2E test pattern (real app + supertest)

One per new controller. Boot `app` in `beforeAll`, close in `afterAll`.

```typescript
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { prisma } from '@/lib/prisma'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'

describe('Create Check-In (e2e)', () => {
  beforeAll(async () => { await app.ready() })
  afterAll(async () => { await app.close() })

  it('should be able to create a check-in', async () => {
    const { token } = await createAndAuthenticateUser(app)
    const { id: gymId } = await prisma.gym.create({
      data: { title: 'New Gym', description: '', phone: '', latitude: -27.11, longitude: -48.85 },
    })

    const response = await request(app.server)
      .post(`/gyms/${gymId}/check-ins`)
      .set('Authorization', `Bearer ${token}`)
      .send({ latitude: -27.11, longitude: -48.85 })

    expect(response.status).toEqual(201)
  })
})
```

### Auth helper (`src/utils/test/create-and-authenticate-user.ts`)

```typescript
import { hash } from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import request from 'supertest'
import { prisma } from '@/lib/prisma'

export async function createAndAuthenticateUser(app: FastifyInstance, isAdmin = false) {
  await prisma.user.create({
    data: {
      name: 'John Doe', email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
      role: isAdmin ? 'ADMIN' : 'MEMBER',
    },
  })
  const res = await request(app.server).post('/sessions').send({
    email: 'johndoe@example.com', password: '123456',
  })
  const token = res.body.token
  const { sub } = app.jwt.decode<{ sub: string }>(token) ?? { sub: '' }
  return { token, sub }
}
```

## app.ts essentials

`export const app = fastify()`, register plugins (`@fastify/jwt`,
`@fastify/cookie`), register route groups, and add a global error handler that
maps `ZodError` → 400 and logs/obscures unexpected errors → 500. Keep `app`
importable so e2e tests can boot it without `listen()`. `server.ts` imports
`app` and calls `app.listen()`.
