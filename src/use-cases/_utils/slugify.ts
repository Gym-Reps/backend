/**
 * Lowercase, ASCII-folded, hyphenated slug — e.g. "Barbell Bench Press" →
 * "barbell-bench-press". Stable enough to use as the catalog upsert key.
 */
export function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
