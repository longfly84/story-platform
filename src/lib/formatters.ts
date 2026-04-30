export function formatCount(n?: number) {
  if (n === undefined || n === null) return "-"
  if (n >= 1_000_000) {
    const v = +(n / 1_000_000).toFixed(1)
    return `${v % 1 === 0 ? v.toFixed(0) : v}M`
  }
  if (n >= 1_000) {
    const v = +(n / 1_000).toFixed(1)
    return `${v % 1 === 0 ? v.toFixed(0) : v}K`
  }
  return String(n)
}
