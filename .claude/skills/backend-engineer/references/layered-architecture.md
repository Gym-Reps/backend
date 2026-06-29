# Layered SOLID architecture (gympass style)

The default architecture for `reps-backend`. Five layers, dependencies point
inward (controllers → factories → use-cases → repository interfaces).

```
src/
  http/
    controllers/<resource>/<action>/<action>.ts        # HTTP handler
    controllers/<resource>/<action>/<action>.e2e-spec.ts
    controllers/<resource>/routes.ts                   # route registration
    middlewares/verify-jwt.ts, verify-user-role.ts
  use-cases/<feature>/<feature>.ts                     # business rule
  use-cases/<feature>/<feature>.spec.ts                # UNIT test (in-memory)
  use-cases/_factories/make-<feature>-use-case.ts      # FACTORY → prisma repos
  use-cases/errors/<x>-error.ts                        # domain errors
  repositories/<x>-repository.ts                       # INTERFACE (abstraction)
  repositories/in-memory/in-memory-<x>-repository.ts   # for unit tests
  repositories/prisma/prisma-<x>-repository.ts         # real persistence
  lib/prisma.ts                                        # PrismaClient singleton
  utils/test/create-and-authenticate-user.ts           # e2e helper
  env/index.ts                                         # zod-validated env
  app.ts                                               # fastify instance + plugins
  server.ts                                            # listen()
```

## SOLID mapping

- **S** — one use-case = one reason to change; controllers only translate HTTP.
- **O** — add behavior with new use-cases/repos, don't edit existing ones.
- **L** — in-memory and prisma repos are interchangeable behind the interface.
- **I** — repository interfaces expose only the methods a use-case needs.
- **D** — use-cases depend on the interface; factories inject the prisma impl.

---

## Repository pattern

### Interface (the abstraction every use-case depends on)

```typescript
// src/repositories/check-ins-repository.ts
import type { CheckIn, Prisma } from '@prisma/client'

export interface CheckInsRepository {
  create(data: Prisma.CheckInUncheckedCreateInput): Promise<CheckIn>
  findByUserIdOnDate(userId: string, date: Date): Promise<CheckIn | null>
  findManyByUserId(userId: string, page: number): Promise<CheckIn[]>
  countByUserId(userId: string): Promise<number>
  findById(id: string): Promise<CheckIn | null>
  save(checkIn: CheckIn): Promise<CheckIn>
}
```

### In-memory implementation (drives unit tests, no DB)

```typescript
// src/repositories/in-memory/in-memory-check-ins-repository.ts
import { randomUUID } from 'node:crypto'
import type { CheckIn, Prisma } from '@prisma/client'
import type { CheckInsRepository } from '../check-ins-repository'

export class InMemoryCheckInsRepository implements CheckInsRepository {
  public items: CheckIn[] = []

  async create(data: Prisma.CheckInUncheckedCreateInput) {
    const checkIn: CheckIn = {
      id: randomUUID(),
      created_at: new Date(),
      gym_id: data.gym_id,
      user_id: data.user_id,
      validated_at: data.validated_at ? new Date(data.validated_at) : null,
    }
    this.items.push(checkIn)
    return checkIn
  }

  async findById(id: string) {
    return this.items.find((item) => item.id === id) ?? null
  }

  async save(checkIn: CheckIn) {
    const index = this.items.findIndex((item) => item.id === checkIn.id)
    if (index >= 0) this.items[index] = checkIn
    return checkIn
  }
  // ...implement every interface method against the in-memory array
}
```

### Prisma implementation (real persistence — the only place Prisma is touched)

```typescript
// src/repositories/prisma/prisma-check-ins-repository.ts
import { Prisma, CheckIn } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { CheckInsRepository } from '../check-ins-repository'

export class PrismaCheckInsRepository implements CheckInsRepository {
  async create(data: Prisma.CheckInUncheckedCreateInput) {
    return prisma.checkIn.create({ data })
  }
  async findById(id: string) {
    return prisma.checkIn.findUnique({ where: { id } })
  }
  async save(data: CheckIn) {
    return prisma.checkIn.update({ where: { id: data.id }, data })
  }
  // ...mirror every interface method with prisma calls
}
```

`src/lib/prisma.ts` exports a single `PrismaClient` (with `@prisma/adapter-pg`)
so all prisma repos share one connection.

---

## Use-case (business rule, DIP via constructor injection)

```typescript
// src/use-cases/check-in/check-in.ts
import type { CheckIn } from '@prisma/client'
import type { CheckInsRepository } from '@/repositories/check-ins-repository'
import type { GymsRepository } from '@/repositories/gyms-repository'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { MaxNumberOfCheckInsError } from '../errors/max-number-of-check-ins-error'

interface CheckInUseCaseRequest {
  userId: string
  gymId: string
  userLatitude: number
  userLongitude: number
}

interface CheckInUseCaseResponse {
  checkIn: CheckIn
}

export class CheckInUseCase {
  constructor(
    private checkInsRepository: CheckInsRepository,
    private gymsRepository: GymsRepository,
  ) {}

  async execute({
    userId,
    gymId,
  }: CheckInUseCaseRequest): Promise<CheckInUseCaseResponse> {
    const gym = await this.gymsRepository.findById(gymId)
    if (!gym) throw new ResourceNotFoundError()

    const checkInOnSameDay = await this.checkInsRepository.findByUserIdOnDate(
      userId,
      new Date(),
    )
    if (checkInOnSameDay) throw new MaxNumberOfCheckInsError()

    const checkIn = await this.checkInsRepository.create({
      gym_id: gymId,
      user_id: userId,
    })
    return { checkIn }
  }
}
```

Conventions: request/response interfaces named `<UseCase>Request` /
`<UseCase>Response`; one public `execute`; throw domain errors from
`use-cases/errors/`. (In the layered style, use-cases **throw**; in DDD they
return `Either` — see `ddd-architecture.md`.)

### Domain error

```typescript
// src/use-cases/errors/resource-not-found-error.ts
export class ResourceNotFoundError extends Error {
  constructor() {
    super('Resource not found')
  }
}
```

---

## Factory pattern (composition root)

Each use-case has a `make...` factory that builds it with the **prisma**
repositories. Controllers depend on factories, not on Prisma.

```typescript
// src/use-cases/_factories/make-check-in-use-case.ts
import { PrismaCheckInsRepository } from '@/repositories/prisma/prisma-check-ins-repository'
import { PrismaGymsRepository } from '@/repositories/prisma/prisma-gyms-repository'
import { CheckInUseCase } from '../check-in/check-in'

export function makeCheckInUseCase() {
  const checkInsRepository = new PrismaCheckInsRepository()
  const gymsRepository = new PrismaGymsRepository()
  return new CheckInUseCase(checkInsRepository, gymsRepository)
}
```

---

## Controller (HTTP edge — Zod validation, then delegate)

```typescript
// src/http/controllers/check-ins/create/create.ts
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeCheckInUseCase } from '@/use-cases/_factories/make-check-in-use-case'

export async function createCheckIn(request: FastifyRequest, reply: FastifyReply) {
  const bodySchema = z.object({
    latitude: z.number().refine((v) => Math.abs(v) <= 90),
    longitude: z.number().refine((v) => Math.abs(v) <= 180),
  })
  const paramsSchema = z.object({ gymId: z.uuid() })

  const { latitude, longitude } = bodySchema.parse(request.body)
  const { gymId } = paramsSchema.parse(request.params)

  const checkInUseCase = makeCheckInUseCase()
  const { checkIn } = await checkInUseCase.execute({
    gymId,
    userId: request.user.sub,
    userLatitude: latitude,
    userLongitude: longitude,
  })

  return reply.status(201).send({ checkIn })
}
```

Map domain errors to status codes either in `app.setErrorHandler` (global, e.g.
`ZodError` → 400) or with `try/catch` in the controller (e.g.
`ResourceNotFoundError` → 404, `MaxNumberOfCheckInsError` → 409).

## Routes

```typescript
// src/http/controllers/check-ins/routes.ts
import type { FastifyInstance } from 'fastify'
import { verifyJWT } from '../../middlewares/verify-jwt'
import { verifyUserRole } from '@/http/middlewares/verify-user-role'
import { createCheckIn } from './create/create'
import { validateCheckIn } from './validate/validate'

export async function checkInsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)
  app.post('/gyms/:gymId/check-ins', createCheckIn)
  app.patch(
    '/check-ins/:checkInId/validate',
    { onRequest: [verifyUserRole('ADMIN')] },
    validateCheckIn,
  )
}
```

Register the router group in `src/app.ts` with `app.register(checkInsRoutes)`.
