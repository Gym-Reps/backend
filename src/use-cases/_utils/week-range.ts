/**
 * Current week window as [Monday 00:00:00.000, Sunday 23:59:59.999] in UTC.
 *
 * MVP uses UTC (no per-user timezone is stored yet — see the trainment spec's
 * open questions). Pass a reference date for deterministic tests.
 */
export function getWeekRange(reference: Date = new Date()) {
  const startOfDay = new Date(
    Date.UTC(
      reference.getUTCFullYear(),
      reference.getUTCMonth(),
      reference.getUTCDate(),
    ),
  )

  const dayOfWeek = startOfDay.getUTCDay() // 0 = Sunday … 6 = Saturday
  const daysSinceMonday = (dayOfWeek + 6) % 7

  const weekStart = new Date(startOfDay)
  weekStart.setUTCDate(startOfDay.getUTCDate() - daysSinceMonday)

  const weekEnd = new Date(weekStart)
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6)
  weekEnd.setUTCHours(23, 59, 59, 999)

  return { weekStart, weekEnd }
}
