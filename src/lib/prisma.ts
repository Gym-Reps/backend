import { env } from "@/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client/extension";

const isDev = env.NODE_ENV === 'dev'

const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL
})

export const prisma = new PrismaClient({
    adapter,
    log: isDev ? ["query"]: []
})