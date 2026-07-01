/**
 * Canonical preference shape + defaults (02_USER_PREFERENCES). Shared by the
 * use-cases, repository, presenter, and the controller's Zod schema so the
 * allowed values and defaults live in exactly one place.
 */
export const WEIGHT_UNITS = ['kg', 'lb'] as const
export const THEMES = ['dark', 'light'] as const
export const LENGTH_UNITS = ['meters', 'inches'] as const

export type WeightUnit = (typeof WEIGHT_UNITS)[number]
export type Theme = (typeof THEMES)[number]
export type LengthUnit = (typeof LENGTH_UNITS)[number]

export interface UserPreferencesValue {
  weightUnit: WeightUnit
  theme: Theme
  lengthUnit: LengthUnit
  /** Weekly training goal; integer 1–14, or `null` when no goal is set. */
  weeklyTrainingCount: number | null
}

/** A partial update — only the keys present are applied (merge semantics). */
export interface UserPreferencesPatch {
  weightUnit?: WeightUnit | undefined
  theme?: Theme | undefined
  lengthUnit?: LengthUnit | undefined
  weeklyTrainingCount?: number | null | undefined
}

export const DEFAULT_PREFERENCES: UserPreferencesValue = {
  weightUnit: 'kg',
  theme: 'light',
  lengthUnit: 'meters',
  weeklyTrainingCount: null,
}

/**
 * Reads a stored JSONB value into a fully-populated `UserPreferencesValue`,
 * backfilling any missing key from `DEFAULT_PREFERENCES` (forward-compatible as
 * new keys are added). Unknown/invalid stored values fall back to the default.
 */
export function resolvePreferences(stored: unknown): UserPreferencesValue {
  const value = (stored ?? {}) as Partial<UserPreferencesValue>

  return {
    weightUnit: WEIGHT_UNITS.includes(value.weightUnit as WeightUnit)
      ? (value.weightUnit as WeightUnit)
      : DEFAULT_PREFERENCES.weightUnit,
    theme: THEMES.includes(value.theme as Theme)
      ? (value.theme as Theme)
      : DEFAULT_PREFERENCES.theme,
    lengthUnit: LENGTH_UNITS.includes(value.lengthUnit as LengthUnit)
      ? (value.lengthUnit as LengthUnit)
      : DEFAULT_PREFERENCES.lengthUnit,
    weeklyTrainingCount:
      typeof value.weeklyTrainingCount === 'number'
        ? value.weeklyTrainingCount
        : DEFAULT_PREFERENCES.weeklyTrainingCount,
  }
}
