import { useCallback } from 'react'
import { useUIStore } from '../store/ui.store'

export function useStealth() {
  const isStealthActive = useUIStore((s) => s.isStealthActive)
  const setStealthActive = useUIStore((s) => s.setStealthActive)

  const toggleStealth = useCallback(async () => {
    const newState = !isStealthActive
    setStealthActive(newState)
    if (typeof window !== 'undefined' && window.eves) {
      await window.eves.toggleStealth(newState)
    }
  }, [isStealthActive, setStealthActive])

  return { isStealthActive, toggleStealth }
}
