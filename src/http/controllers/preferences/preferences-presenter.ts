import type { UserPreferences } from '@prisma-client'
import { resolvePreferences } from '@/use-cases/user-preferences/preferences'

/** Exposes the fully-resolved preference value (defaults backfilled). */
export function preferencesToHTTP(userPreferences: UserPreferences) {
  return resolvePreferences(userPreferences.preferences)
}
