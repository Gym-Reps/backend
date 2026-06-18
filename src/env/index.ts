import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'prod']).default('dev'),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.url(),
//   SECRET_KEY: z.string(),
})

const _env = envSchema.safeParse({
  NODE_ENV: process.env['NODE_ENV'],
  PORT: process.env['PORT'],
  DATABASE_URL: process.env['DATABASE_URL'],
//   SECRET_KEY: process.env['SECRET_KEY'],
})

if (!_env.success) {
  console.error(`Invalid environment variables, ${z.treeifyError(_env.error)}`)
  throw new Error('Invalid environment variables')
}

export const env = _env.data
