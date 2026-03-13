export interface Session {
  userId: number
  email: string
  name: string
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem('prelegal_session')
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function clearSession(): void {
  localStorage.removeItem('prelegal_session')
}
