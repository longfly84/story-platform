export function getOrCreateSessionId(): string {
  try {
    const key = 'tn24h_session_id'
    const existing = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null
    if (existing) return existing
    const id = (typeof crypto !== 'undefined' && (crypto as any).randomUUID) ? (crypto as any).randomUUID() : `${Date.now()}-${Math.floor(Math.random()*1000000)}`
    try { if (typeof window !== 'undefined') window.localStorage.setItem(key, id) } catch (e) {}
    return id
  } catch (e) {
    return `${Date.now()}-${Math.floor(Math.random()*1000000)}`
  }
}
