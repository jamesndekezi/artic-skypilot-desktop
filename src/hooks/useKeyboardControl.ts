/**
 * useKeyboardControl
 *
 * Tracks keyboard state for manual flight control inputs.
 * Returns the current set of pressed keys and precision mode flag.
 *
 * Never transmits keyboard state to hardware.
 * Simulation-only — no real flight commands are issued.
 */
import { useState, useEffect, useRef, useCallback } from 'react'

export interface KeyboardControlResult {
  pressedKeys: Set<string>
  precisionMode: boolean
}

export function useKeyboardControl(enabled: boolean): KeyboardControlResult {
  // Mutable ref — avoids stale closure issues in event listeners
  const keysRef = useRef<Set<string>>(new Set())

  // Reactive snapshot exposed to consumers
  const [snapshot, setSnapshot] = useState<Set<string>>(new Set())

  // Precision mode = Shift is held
  const [precisionMode, setPrecisionMode] = useState(false)

  const updateSnapshot = useCallback(() => {
    const next = new Set(keysRef.current)
    setSnapshot(next)
    setPrecisionMode(next.has('Shift'))
  }, [])

  const clearKeys = useCallback(() => {
    keysRef.current.clear()
    updateSnapshot()
  }, [updateSnapshot])

  useEffect(() => {
    if (!enabled) {
      clearKeys()
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore key events when focus is in a text control
      const target = event.target as HTMLElement | null
      if (target) {
        const tag = target.tagName
        if (
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          target.isContentEditable
        ) {
          return
        }
      }

      keysRef.current.add(event.key)
      updateSnapshot()

      // Escape also clears all other pressed keys
      if (event.key === 'Escape') {
        clearKeys()
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      keysRef.current.delete(event.key)
      updateSnapshot()
    }

    const handleBlur = () => {
      clearKeys()
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearKeys()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled, clearKeys, updateSnapshot])

  return { pressedKeys: snapshot, precisionMode }
}
