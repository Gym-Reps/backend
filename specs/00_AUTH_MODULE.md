# Authentication Flow

## Overview

Account lifecycle and session management for `reps-backend`: registration,
sign-in, password change, and JWT access tokens backed by a refresh-token
cookie. Authentication uses a short-lived **access token** (JWT, sent in the
`Authorization: Bearer` header) and a long-lived **refresh token** delivered via
a secure, `httpOnly` cookie.

Architecture: layered SOLID (Fastify controllers → factories → use-cases →
repository interface → Prisma). See `.claude/skills/backend-engineer`.

## User Entity

The `User` entity must contain the following fields:

| Field           | Type                | Notes                                          |
|-----------------|---------------------|------------------------------------------------|
| `id`            | `string` (uuid)     | Primary key.                                   |
| `username`      | `string`            | Unique, required.                              |
| `email`         | `string`            | Unique, required.                              |
| `password_hash` | `string`            | Hashed password. **Never** store plaintext.    |
| `role`          | `Role`              | Enum `MEMBER` \| `ADMIN`. Default `MEMBER`.    |
| `created_at`    | `DateTime`          | Default `now()`.                               |
| `updated_at`    | `DateTime`          | Auto-updated on write.                          |
| `deleted_at`    | `DateTime \| null`  | Nullable. Soft-delete marker.                  |

### Schema delta (vs. current `prisma/schema.prisma`)

The current `User` model differs and must be migrated:

- **Rename / replace** `name` → `username` (and add a `@unique` constraint).
- **Add** `created_at`, `updated_at`, `deleted_at`.
- **Add** `ADMIN` to the `Role` enum (currently only `MEMBER`).
- Keep `@@map("users")`.

```prisma
enum Role {
  MEMBER
  ADMIN
}

model User {
  id            String    @id @default(uuid())
  username      String    @unique
  email         String    @unique
  password_hash String
  role          Role      @default(MEMBER)
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
  deleted_at    DateTime?

  // existing relations remain:
  trainmentTemplates TrainmentTemplate[]
  trainments         Trainment[]

  @@map("users")
}
```

> Note: existing relations (`trainmentTemplates`, `trainments`) reference
> `User`; preserve them when migrating.

## Functional Requirements

1. **Register** — a user can create an account with `username`, `email`, and
   `password`. The password is hashed and stored in `password_hash`.
2. **Sign in** — a user can authenticate with `email` + `password` and receive
   an access token plus a refresh-token cookie.
3. **Change password** — an authenticated user can change their password by
   providing the current password and a new one.
4. **Refresh** — a user can exchange a valid refresh-token cookie for a new
   access token (and a rotated refresh-token cookie) without re-entering
   credentials.

## Endpoints

| Method | Path                 | Auth        | Purpose                          |
|--------|----------------------|-------------|----------------------------------|
| POST   | `/users`             | public      | Register a new account.          |
| POST   | `/sessions`          | public      | Sign in; issue tokens.           |
| PATCH  | `/users/password`    | Bearer JWT  | Change the current user's password. |
| PATCH  | `/token/refresh`     | refresh cookie | Rotate tokens.                |

### POST `/users` — Register

- Body: `{ username: string, email: string, password: string (min 6) }`.
- `201 Created` on success (no body, or the created user **without**
  `password_hash`).
- `409 Conflict` if `email` or `username` already exists.

### POST `/sessions` — Sign in

- Body: `{ email: string, password: string }`.
- `200 OK` → body `{ token: <accessJWT> }` and a `Set-Cookie: refreshToken=...`.
- `401 Unauthorized` (`InvalidCredentialsError`) if email is unknown or the
  password does not match — same generic response for both, to avoid user
  enumeration.

### PATCH `/users/password` — Change password

- Requires a valid Bearer access token (`verifyJWT`).
- Body: `{ currentPassword: string, newPassword: string (min 6) }`.
- `204 No Content` on success.
- `401 Unauthorized` if `currentPassword` does not match.

### PATCH `/token/refresh` — Refresh

- Reads the `refreshToken` cookie (no body).
- `200 OK` → body `{ token: <newAccessJWT> }`, and sets a **new** refresh-token
  cookie (rotation).
- `401 Unauthorized` if the refresh cookie is missing/invalid/expired.

## Use-cases (unit-tested in isolation)

Each is a class with `execute(...)`, depends on `UsersRepository` (interface) via
the constructor, and is wired by a `make...` factory to `PrismaUsersRepository`.

- `RegisterUseCase` — hash password (bcrypt), reject duplicate email/username.
- `AuthenticateUseCase` — verify email + password, return the `User`.
- `ChangePasswordUseCase` — load user, verify current password, hash and persist
  the new one.

> Token issuing/rotation (signing the JWT, setting cookies) is a transport
> concern and lives in the **controllers**, not in the use-cases — keep
> use-cases free of Fastify/JWT.

## Repository

`UsersRepository` interface (abstraction every use-case depends on):

```typescript
export interface UsersRepository {
  create(data: Prisma.UserCreateInput): Promise<User>
  findByEmail(email: string): Promise<User | null>
  findByUsername(username: string): Promise<User | null>
  findById(id: string): Promise<User | null>
  save(user: User): Promise<User>
}
```

Implementations: `in-memory/in-memory-users-repository.ts` (unit tests) and
`prisma/prisma-users-repository.ts` (runtime). Queries should ignore
soft-deleted users (`deleted_at: null`) where it makes sense.

## Business Rules

- Passwords are hashed with **bcrypt** (cost factor 6, matching the reference
  repos) before storage. Plaintext passwords never leave the use-case boundary.
- `email` and `username` are both unique; duplicates are rejected at
  registration.
- Sign-in failures return a single generic `InvalidCredentialsError` regardless
  of whether the email exists.
- Password change requires successful verification of the current password.

## Security — Refresh token & cookies

- **Access token (JWT):** short-lived (e.g. `expiresIn: '10m'`), carries `sub`
  (user id) and `role`. Sent by the client in `Authorization: Bearer`.
- **Refresh token (JWT):** longer-lived (e.g. `expiresIn: '7d'`), signed with
  `{ sign: { sub: user.id, expiresIn: '7d' } }`.
- The refresh token is delivered via `reply.setCookie('refreshToken', token, …)`
  with the following attributes:

  ```ts
  reply
    .setCookie('refreshToken', refreshToken, {
      path: '/',
      secure: true,      // HTTPS only
      sameSite: true,    // CSRF mitigation
      httpOnly: true,    // not readable by JS
    })
    .status(200)
    .send({ token })
  ```

- Configure `@fastify/jwt` with a `cookie` block (`cookieName: 'refreshToken'`,
  `signed: false`) and register `@fastify/cookie` so `/token/refresh` can read
  and verify the cookie via `request.jwtVerify({ onlyCookie: true })`.
- On refresh, **rotate**: issue a fresh access token and a fresh refresh cookie.
- `SECRET_KEY` (JWT secret) comes from validated env (`src/env`).

## Error cases

| Error                     | HTTP | When                                        |
|---------------------------|------|---------------------------------------------|
| `UserAlreadyExistsError`  | 409  | Email or username already taken (register). |
| `InvalidCredentialsError` | 401  | Bad email/password (sign-in, change pwd).   |
| `ResourceNotFoundError`   | 404  | Authenticated user id not found.            |
| `ZodError`                | 400  | Request body/params fail validation.        |

Map these in the controllers (try/catch) and/or `app.setErrorHandler`.

## Testing expectations

**Unit tests** (in-memory `UsersRepository`, required for every use-case):

- Register: hashes the password (assert `password_hash` ≠ plaintext and
  `compare` succeeds); rejects duplicate email; rejects duplicate username.
- Authenticate: succeeds with correct credentials; throws
  `InvalidCredentialsError` on wrong email and on wrong password.
- Change password: succeeds and re-hashes; throws on wrong current password.

**E2E tests** (real `app` + supertest + isolated Postgres schema — required
because new controllers are added):

- `POST /users` → `201`.
- `POST /sessions` → `200`, body has `token`, response sets a `refreshToken`
  cookie with `HttpOnly`.
- `PATCH /users/password` with a valid Bearer token → `204`.
- `PATCH /token/refresh` using the cookie from sign-in → `200` with a new
  `token` and a refreshed cookie.

Reuse / extend `src/utils/test/create-and-authenticate-user.ts` (note: it must
create users with `username` now).

## Out of scope / open questions

- Email verification, password-reset-by-email, and account deletion endpoints
  are not part of this spec.
- Refresh tokens are stateless JWTs (no server-side revocation list). Revisit if
  forced logout / token revocation becomes a requirement.
- Confirm the migration strategy for the existing `name` column → `username`
  (rename vs. add+backfill+drop) before running it against any data that exists.
