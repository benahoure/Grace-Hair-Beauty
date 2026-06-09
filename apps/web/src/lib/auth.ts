const tokenKey = 'grace-hair-beauty-admin-token'
const codeVerifierKey = 'grace-hair-beauty-pkce-verifier'

function base64urlEncode(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  const verifier = base64urlEncode(array.buffer)
  const encoder = new TextEncoder()
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(verifier))
  const challenge = base64urlEncode(digest)
  return { verifier, challenge }
}

export function getAdminToken(): string | null {
  return window.sessionStorage.getItem(tokenKey)
}

export function setAdminToken(token: string): void {
  window.sessionStorage.setItem(tokenKey, token)
}

export function clearAdminToken(): void {
  window.sessionStorage.removeItem(tokenKey)
  window.sessionStorage.removeItem(codeVerifierKey)
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

export function logoutFromCognito(): void {
  clearAdminToken()
  const domain = import.meta.env.VITE_COGNITO_DOMAIN
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID
  if (!domain || !clientId) return
  const logoutUri = encodeURIComponent(`${window.location.origin}/admin`)
  window.location.assign(`https://${domain}/logout?client_id=${clientId}&logout_uri=${logoutUri}`)
}

export async function redirectToCognito(): Promise<void> {
  const domain = import.meta.env.VITE_COGNITO_DOMAIN
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID
  if (!domain || !clientId) return

  const { verifier, challenge } = await generatePKCE()
  window.sessionStorage.setItem(codeVerifierKey, verifier)

  const redirectUri = encodeURIComponent(`${window.location.origin}/admin`)
  const url = `https://${domain}/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=openid%20profile%20email&code_challenge=${challenge}&code_challenge_method=S256`
  window.location.assign(url)
}

export async function exchangeCodeForToken(code: string): Promise<string | null> {
  const domain = import.meta.env.VITE_COGNITO_DOMAIN
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID
  const verifier = window.sessionStorage.getItem(codeVerifierKey)
  if (!domain || !clientId || !verifier) return null

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    code,
    redirect_uri: `${window.location.origin}/admin`,
    code_verifier: verifier,
  })

  try {
    const response = await fetch(`https://${domain}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })
    if (!response.ok) return null
    const data = await response.json()
    window.sessionStorage.removeItem(codeVerifierKey)
    return (data.id_token ?? data.access_token) || null
  } catch {
    return null
  }
}
