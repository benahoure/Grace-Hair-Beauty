import { useEffect, useState } from 'react'

function canUseWebGL(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export function useWebGL(): boolean {
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    setSupported(canUseWebGL())
  }, [])

  return supported
}
