// @vitest-environment jsdom
/**
 * KeyboardControl.test.ts
 *
 * Tests for the useKeyboardControl hook.
 * Requires jsdom to simulate keyboard events on document/window.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKeyboardControl } from '@/hooks/useKeyboardControl'

// Helper to fire a keydown event on document
function fireKeyDown(key: string, targetOverride?: EventTarget) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true })
  if (targetOverride) {
    Object.defineProperty(event, 'target', {
      value: targetOverride,
      writable: false,
    })
  }
  document.dispatchEvent(event)
}

function fireKeyUp(key: string) {
  const event = new KeyboardEvent('keyup', { key, bubbles: true })
  document.dispatchEvent(event)
}

describe('useKeyboardControl', () => {
  beforeEach(() => {
    // Clear any lingering key state between tests
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns empty Set when disabled', () => {
    const { result } = renderHook(() => useKeyboardControl(false))
    expect(result.current.pressedKeys.size).toBe(0)
  })

  it('keydown adds key to pressedKeys when enabled', () => {
    const { result } = renderHook(() => useKeyboardControl(true))

    act(() => {
      fireKeyDown('W')
    })

    expect(result.current.pressedKeys.has('W')).toBe(true)
  })

  it('keyup removes key from pressedKeys', () => {
    const { result } = renderHook(() => useKeyboardControl(true))

    act(() => {
      fireKeyDown('W')
    })
    act(() => {
      fireKeyUp('W')
    })

    expect(result.current.pressedKeys.has('W')).toBe(false)
  })

  it('Escape clears all pressed keys', () => {
    const { result } = renderHook(() => useKeyboardControl(true))

    act(() => {
      fireKeyDown('W')
      fireKeyDown('A')
    })
    act(() => {
      fireKeyDown('Escape')
    })

    expect(result.current.pressedKeys.size).toBe(0)
  })

  it('window blur clears all pressed keys', () => {
    const { result } = renderHook(() => useKeyboardControl(true))

    act(() => {
      fireKeyDown('ArrowUp')
    })

    act(() => {
      window.dispatchEvent(new Event('blur'))
    })

    expect(result.current.pressedKeys.size).toBe(0)
  })

  it('document visibilitychange with hidden=true clears all pressed keys', () => {
    const { result } = renderHook(() => useKeyboardControl(true))

    act(() => {
      fireKeyDown('ArrowUp')
      fireKeyDown('W')
    })

    act(() => {
      Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(result.current.pressedKeys.size).toBe(0)

    // Restore document.hidden for subsequent tests
    Object.defineProperty(document, 'hidden', { value: false, writable: true, configurable: true })
  })

  it('ignores keydown when target is INPUT element', () => {
    const { result } = renderHook(() => useKeyboardControl(true))

    const inputEl = document.createElement('input')
    inputEl.id = 'test-input'
    document.body.appendChild(inputEl)

    act(() => {
      inputEl.focus()
      const evt = new KeyboardEvent('keydown', { key: 'Z', bubbles: true })
      Object.defineProperty(evt, 'target', { value: inputEl, writable: false })
      document.dispatchEvent(evt)
    })

    expect(result.current.pressedKeys.has('Z')).toBe(false)
    document.body.removeChild(inputEl)
  })

  it('cleans up listeners on unmount (no errors after unmount)', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
    const { unmount } = renderHook(() => useKeyboardControl(true))

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalled()
    // Firing events after unmount should not throw
    expect(() => {
      fireKeyDown('W')
      fireKeyUp('W')
    }).not.toThrow()
  })
})
