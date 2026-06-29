# DDD / Clean Architecture (forum style)

Use for rich domains: behavior-heavy aggregates, invariants, domain events,
multiple bounded contexts. Use-cases return `Either` instead of throwing.

```
src/
  core/
    entities/entity.ts, aggregate-root.ts, unique-entity-id.ts
    entities/value-objects/<x>.ts
    either.ts
    errors/errors/<x>-error.ts
    events/                                  # domain-event infra
    types/optional.ts
  domain/<context>/
    enterprise/entities/<x>.ts               # aggregates + entities
    enterprise/entities/value-objects/<x>.ts
    enterprise/events/<x>-event.ts
    application/repositories/<x>-repository.ts
    application/use-cases/<x>.ts             # returns Either
    application/use-cases/<x>.spec.ts        # UNIT test (in-memory + make factory)
    application/subscribers/                 # event subscribers
test/
  repositories/in-memory-<x>-repository.ts
  factories/make-<x>.ts                      # TEST entity factories
```

Layers: **enterprise** (entities/value-objects/events — pure domain),
**application** (use-cases + repository interfaces), **infra** (Prisma repos,
mappers, HTTP — wire with the same factory pattern as the layered style).

## Core building blocks

### Either (typed success/failure — no throwing)

```typescript
// src/core/either.ts
export class Left<L, R> {
  readonly value: L
  constructor(value: L) { this.value = value }
  isRight(): this is Right<L, R> { return false }
  isLeft(): this is Left<L, R> { return true }
}
export class Right<L, R> {
  readonly value: R
  constructor(value: R) { this.value = value }
  isRight(): this is Right<L, R> { return true }
  isLeft(): this is Left<L, R> { return false }
}
export type Either<L, R> = Left<L, R> | Right<L, R>
export const left = <L, R>(value: L): Either<L, R> => new Left(value)
export const right = <L, R>(value: R): Either<L, R> => new Right(value)
```

### Entity + identity

```typescript
// src/core/entities/unique-entity-id.ts
import { randomUUID } from 'node:crypto'
export class UniqueEntityID {
  private value: string
  constructor(value?: string) { this.value = value ?? randomUUID() }
  toString() { return this.value }
  toValue() { return this.value }
  equals(id: UniqueEntityID) { return id.toValue() === this.value }
}

// src/core/entities/entity.ts
import { UniqueEntityID } from './unique-entity-id'
export class Entity<T> {
  private _id: UniqueEntityID
  protected props: T
  get id() { return this._id }
  protected constructor(props: T, id?: UniqueEntityID) {
    this.props = props
    this._id = id ?? new UniqueEntityID()
  }
  public equals(entity: Entity<any>) {
    return entity === this || entity.id === this._id
  }
}
```

Aggregates extend `AggregateRoot<T>` (an `Entity` that records domain events).
Entities expose behavior through getters/setters and a static `create(props, id?)`
factory; mutating setters call a private `touch()` to bump `updatedAt`.

## Use-case returning Either

```typescript
type EditAnswerUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  { answer: Answer }
>

export class EditAnswerUseCase {
  constructor(private answersRepository: AnswersRepository) {}

  async execute({
    authorId, content, answerId,
  }: EditAnswerUseCaseRequest): Promise<EditAnswerUseCaseResponse> {
    const answer = await this.answersRepository.getById(answerId)
    if (!answer) return left(new ResourceNotFoundError())
    if (authorId !== answer.authorId.toString()) return left(new NotAllowedError())

    answer.content = content
    const updated = await this.answersRepository.save(answer)
    return right({ answer: updated })
  }
}
```

Tests assert on `result.isRight()` / `result.isLeft()` and `result.value`.

## Test entity factories (`test/factories/make-<x>.ts`)

Build valid aggregates with sensible defaults so tests stay terse:

```typescript
export function makeAnswer(
  override: Partial<AnswerProps> = {},
  id?: UniqueEntityID,
) {
  return Answer.create(
    { authorId: new UniqueEntityID(), questionId: new UniqueEntityID(),
      content: faker.lorem.text(), ...override },
    id,
  )
}
```

In-memory repos live under `test/repositories/` and back the unit tests exactly
like the layered style. HTTP controllers, Prisma repos, mappers
(domain ↔ persistence), and `make...` factories live in an `infra` layer and
follow `layered-architecture.md` for wiring and e2e testing.
