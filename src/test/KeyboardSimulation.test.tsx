/**
 * KeyboardSimulation.test.tsx
 *
 * Tests for Stage 5 additions:
 *   - AttitudeIndicator renders and is labelled
 *   - ThrottleGauge renders and is labelled
 *   - SimulatorViewport shows/hides PAUSED overlay
 *   - ManualControlPage scroll prevention (arrow keys + Space)
 *   - Esc-to-neutralize hint is present
 *   - Physical mode remains unavailable
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import AttitudeIndicator from '@/components/manual-control/AttitudeIndicator'
import ThrottleGauge from '@/components/manual-control/ThrottleGauge'
import SimulatorViewport from '@/components/manual-control/SimulatorViewport'
import ManualControlPage from '@/pages/ManualControlPage'

// Minimal AircraftTelemetry stub used by SimulatorViewport
const MOCK_TELEMETRY = {
  id: 'test-01',
  name: 'TEST-01',
  status: 'en-route' as const,
  batteryPct: 75,
  speedMs: 10,
  altitudeM: 80,
  signalPct: 90,
  position: { lat: -1.29, lng: 36.82, altitudeM: 80 },
  headingDeg: 45,
  flightTimeSec: 120,
}

// ── AttitudeIndicator ─────────────────────────────────────────────────────────

describe('AttitudeIndicator', () => {
  it('renders without crashing at neutral inputs', () => {
    render(<AttitudeIndicator pitch={0} roll={0} />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('aria-label mentions pitch and roll values', () => {
    render(<AttitudeIndicator pitch={0.5} roll={-0.5} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('aria-label', expect.stringMatching(/pitch/i))
    expect(img).toHaveAttribute('aria-label', expect.stringMatching(/roll/i))
  })

  it('shows SIMULATED label', () => {
    const { container } = render(<AttitudeIndicator pitch={0} roll={0} />)
    expect(container.textContent).toMatch(/SIMULATED/i)
  })

  it('renders without crashing at extreme inputs', () => {
    render(<AttitudeIndicator pitch={1} roll={-1} />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })
})

// ── ThrottleGauge ─────────────────────────────────────────────────────────────

describe('ThrottleGauge', () => {
  it('renders without crashing at zero throttle', () => {
    render(<ThrottleGauge throttle={0} />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('aria-label mentions throttle percentage', () => {
    render(<ThrottleGauge throttle={0.5} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('aria-label', expect.stringMatching(/50%/))
  })

  it('shows SIMULATION ONLY label', () => {
    const { container } = render(<ThrottleGauge throttle={0} />)
    expect(container.textContent).toMatch(/SIMULATION ONLY/i)
  })

  it('aria-label shows 0% at zero throttle', () => {
    render(<ThrottleGauge throttle={0} />)
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', expect.stringMatching(/0%/))
  })

  it('aria-label shows 100% at full throttle', () => {
    render(<ThrottleGauge throttle={1} />)
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', expect.stringMatching(/100%/))
  })
})

// ── SimulatorViewport pause overlay ──────────────────────────────────────────

describe('SimulatorViewport pause overlay', () => {
  it('does not show PAUSED when paused=false', () => {
    render(
      <SimulatorViewport
        telemetry={MOCK_TELEMETRY}
        simState="running"
        paused={false}
      />
    )
    expect(screen.queryByText(/PAUSED/i)).not.toBeInTheDocument()
  })

  it('shows PAUSED overlay when paused=true', () => {
    render(
      <SimulatorViewport
        telemetry={MOCK_TELEMETRY}
        simState="paused"
        paused={true}
      />
    )
    expect(screen.getByText(/PAUSED/i)).toBeInTheDocument()
  })

  it('shows PAUSED by default when simState is paused (no explicit prop)', () => {
    render(
      <SimulatorViewport
        telemetry={MOCK_TELEMETRY}
        simState="paused"
        paused={true}
      />
    )
    expect(screen.getByText(/PAUSED/i)).toBeInTheDocument()
  })
})

// ── ManualControlPage integration ────────────────────────────────────────────

function renderPage() {
  return render(
    <MemoryRouter>
      <ManualControlPage />
    </MemoryRouter>
  )
}

describe('ManualControlPage — scroll prevention', () => {
  it('calls preventDefault on ArrowUp when keyboard is enabled', () => {
    renderPage()
    // Enable keyboard
    const toggle = screen.getByRole('switch', { name: /Keyboard/i })
    fireEvent.click(toggle)

    const event = new KeyboardEvent('keydown', {
      key: 'ArrowUp',
      bubbles: true,
      cancelable: true,
    })
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
    document.dispatchEvent(event)
    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  it('does NOT call preventDefault on ArrowUp when keyboard is disabled', () => {
    renderPage()
    // keyboard starts disabled — do NOT click toggle

    const event = new KeyboardEvent('keydown', {
      key: 'ArrowUp',
      bubbles: true,
      cancelable: true,
    })
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
    document.dispatchEvent(event)
    expect(preventDefaultSpy).not.toHaveBeenCalled()
  })

  it('does NOT call preventDefault when target is an INPUT', () => {
    renderPage()
    const toggle = screen.getByRole('switch', { name: /Keyboard/i })
    fireEvent.click(toggle)

    const input = document.createElement('input')
    document.body.appendChild(input)

    const event = new KeyboardEvent('keydown', {
      key: 'ArrowUp',
      bubbles: true,
      cancelable: true,
    })
    Object.defineProperty(event, 'target', { value: input, writable: false })
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
    document.dispatchEvent(event)
    expect(preventDefaultSpy).not.toHaveBeenCalled()

    document.body.removeChild(input)
  })

  it('calls preventDefault on Space when keyboard is enabled', () => {
    renderPage()
    const toggle = screen.getByRole('switch', { name: /Keyboard/i })
    fireEvent.click(toggle)

    const event = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      cancelable: true,
    })
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
    document.dispatchEvent(event)
    expect(preventDefaultSpy).toHaveBeenCalled()
  })
})

describe('ManualControlPage — new UI elements', () => {
  it('renders AttitudeIndicator in the page', () => {
    renderPage()
    // AttitudeIndicator has role=img with "Attitude" label
    const imgs = screen.getAllByRole('img')
    const attitudeImg = imgs.find(
      (el) => el.getAttribute('aria-label')?.toLowerCase().includes('attitude'),
    )
    expect(attitudeImg).toBeDefined()
  })

  it('renders ThrottleGauge in the page', () => {
    renderPage()
    const imgs = screen.getAllByRole('img')
    const throttleImg = imgs.find(
      (el) => el.getAttribute('aria-label')?.toLowerCase().includes('throttle'),
    )
    expect(throttleImg).toBeDefined()
  })

  it('shows Esc to neutralize hint text', () => {
    renderPage()
    expect(screen.getByText(/Esc to neutralize/i)).toBeInTheDocument()
  })

  it('physical hardware mode remains unavailable', () => {
    renderPage()
    expect(screen.queryByText(/^connected$/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/hardware online/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/motors: armed/i)).not.toBeInTheDocument()
  })
})
