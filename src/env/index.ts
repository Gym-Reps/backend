import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'prod']).default('dev'),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.url(),
  SECRET_KEY: z.string(),
  APP_URL: z.url().default('http://localhost:3333'),
  // Comma-separated list of allowed origins, or "*" to
  //  reflect any origin.
  CORS_ORIGIN: z.string().default('*'),
})

const _env = envSchema.safeParse({
  NODE_ENV: process.env['NODE_ENV'],
  PORT: process.env['PORT'],
  DATABASE_URL: process.env['DATABASE_URL'],
  SECRET_KEY: process.env['SECRET_KEY'],
  APP_URL: process.env['APP_URL'],
  CORS_ORIGIN: process.env['CORS_ORIGIN'],
})

if (!_env.success) {
  console.error(`Invalid environment variables, ${z.treeifyError(_env.error)}`)
  throw new Error('Invalid environment variables')
}

export const env = _env.data
