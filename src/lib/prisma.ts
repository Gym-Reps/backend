import { env } from "@/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma-client";

const isDev = env.NODE_ENV === 'dev'

// The `pg` driver ignores the `?schema=` connection-string param (it's a
// Prisma-engine convention), so pass it to the adapter explicitly. This is what
// makes per-test schema isolation work; production URLs without it are unaffected.
const schema = new URL(env.DATABASE_URL).searchParams.get('schema') ?? undefined

const adapter = new PrismaPg(
    { connectionString: env.DATABASE_URL },
    schema ? { schema } : undefined,
)

export const prisma = new PrismaClient({
    adapter,
    log: isDev ? ["query"] : []
})
