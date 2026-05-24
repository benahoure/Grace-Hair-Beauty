const tokenKey = 'grace-hair-beauty-admin-token'

export function getAdminToken(): string | null {
  return window.sessionStorage.getItem(tokenKey)
}

export function setAdminToken(token: string): void {
  window.sessionStorage.setItem(tokenKey, token)
}

export function clearAdminToken(): void {
  window.sessionStorage.removeItem(tokenKey)
}

export function adminIsAuthenticated(): boolean {
  const token = getAdminToken()
  if (!token) return false

  try {
    const [, payload] = token.split('.')
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      '=',
    )
    const decoded = JSON.parse(window.atob(paddedPayload))
    if (typeof decoded.exp !== 'number') return false
    return decoded.exp * 1000 > Date.now()
  } catch {
    clearAdminToken()
    return false
  }
}

export function redirectToCognito(): void {
  const domain = import.meta.env.VITE_COGNITO_DOMAIN
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID
  if (!domain || !clientId) return

  const redirectUri = encodeURIComponent(`${window.location.origin}/admin`)
  const url = `https://${domain}/login?client_id=${clientId}&response_type=token&scope=openid+profile+email&redirect_uri=${redirectUri}`
  window.location.assign(url)
}
