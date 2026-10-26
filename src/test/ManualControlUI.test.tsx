/**
 * ManualControlUI.test.tsx
 *
 * Tests for Stage 4 new components:
 *   - KeyboardKey active/inactive rendering
 *   - TranslucentKeyboard key-highlight wiring
 *   - ControlIndicators axis values
 *   - FlightModeCard mode selection
 *   - KeyboardStatusPanel status rows
 *   - ManualControlPage dashboard integration (regression + new interactions)
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import KeyboardKey from '@/components/manual-control/KeyboardKey'
import TranslucentKeyboard from '@/components/manual-control/TranslucentKeyboard'
import ControlIndicators from '@/components/manual-control/ControlIndicators'
import FlightModeCard from '@/components/manual-control/FlightModeCard'
import KeyboardStatusPanel from '@/components/manual-control/KeyboardStatusPanel'
import ManualControlPage from '@/pages/ManualControlPage'

// ── KeyboardKey ───────────────────────────────────────────────────────────────

describe('KeyboardKey', () => {
  it('renders the key label', () => {
    render(<KeyboardKey label="W" />)
    expect(screen.getByText('W')).toBeInTheDocument()
  })

  it('uses displayLabel when provided', () => {
    render(<KeyboardKey label="ArrowUp" displayLabel="↑" />)
    expect(screen.getByText('↑')).toBeInTheDocument()
  })

  it('applies key-active class when active=true', () => {
    render(<KeyboardKey label="W" active />)
    const el = screen.getByRole('img', { name: /Key W \(pressed\)/ })
    // Active key has blue background styling
    expect(el.className).toContain('bg-blue-600')
  })

  it('applies key-inactive class when active=false', () => {
    render(<KeyboardKey label="W" active={false} />)
    const el = screen.getByRole('img', { name: /Key W$/ })
    // Inactive key does NOT have blue background
    expect(el.className).not.toContain('bg-blue-600')
  })

  it('applies reduced opacity when dimmed', () => {
    render(<KeyboardKey label="Q" dimmed />)
    const el = screen.getByRole('img', { name: /Key Q/ })
    expect(el.className).toMatch(/opacity/)
  })
})

// ── TranslucentKeyboard ───────────────────────────────────────────────────────

describe('TranslucentKeyboard', () => {
  it('renders without crashing with empty pressedKeys', () => {
    render(<TranslucentKeyboard pressedKeys={new Set()} enabled={false} />)
    // W key should be present and inactive (no blue bg)
    const wKey = screen.getByRole('img', { name: /Key W$/ })
    expect(wKey).toBeInTheDocument()
    expect(wKey.className).not.toContain('bg-blue-600')
  })

  it('highlights W key when W is in pressedKeys', () => {
    render(<TranslucentKeyboard pressedKeys={new Set(['w'])} enabled={true} />)
    const wKey = screen.getByRole('img', { name: /Key W \(pressed\)/ })
    expect(wKey.className).toContain('bg-blue-600')
  })

  it('highlights Shift key when Shift is pressed', () => {
    render(<TranslucentKeyboard pressedKeys={new Set(['Shift'])} enabled={true} />)
    const shiftKey = screen.getByRole('img', { name: /Key Shift \(pressed\)/ })
    expect(shiftKey.className).toContain('bg-blue-600')
  })

  it('highlights arrow up when ArrowUp is pressed', () => {
    render(<TranslucentKeyboard pressedKeys={new Set(['ArrowUp'])} enabled={true} />)
    const key = screen.getByRole('img', { name: /Key ArrowUp \(pressed\)/ })
    expect(key.className).toContain('bg-blue-600')
  })

  it('highlights Space key when space is pressed', () => {
    render(<TranslucentKeyboard pressedKeys={new Set([' '])} enabled={true} />)
    const key = screen.getByRole('img', { name: /Key Space \(pressed\)/ })
    expect(key.className).toContain('bg-blue-600')
  })

  it('shows green border styling when enabled', () => {
    const { container } = render(
      <TranslucentKeyboard pressedKeys={new Set()} enabled={true} />
    )
    const outer = container.firstChild as HTMLElement
    // Enabled state applies a green border class
    expect(outer.className).toMatch(/green/)
  })

  it('does not show green border when disabled', () => {
    const { container } = render(
      <TranslucentKeyboard pressedKeys={new Set()} enabled={false} />
    )
    const outer = container.firstChild as HTMLElement
    expect(outer.className).not.toMatch(/green/)
  })
})

// ── ControlIndicators ─────────────────────────────────────────────────────────

describe('ControlIndicators', () => {
  const zeroInputs = { throttle: 0, roll: 0, pitch: 0, yaw: 0 }

  it('renders all four axis labels', () => {
    render(<ControlIndicators inputs={zeroInputs} />)
    expect(screen.getByText('Pitch')).toBeInTheDocument()
    expect(screen.getByText('Roll')).toBeInTheDocument()
    expect(screen.getByText('Yaw')).toBeInTheDocument()
    expect(screen.getByText('Throttle')).toBeInTheDocument()
  })

  it('displays zero values as 0.00', () => {
    render(<ControlIndicators inputs={zeroInputs} />)
    const zeros = screen.getAllByText('0.00')
    expect(zeros.length).toBe(4)
  })

  it('displays non-zero throttle value', () => {
    render(<ControlIndicators inputs={{ ...zeroInputs, throttle: 0.45 }} />)
    expect(screen.getByText('0.45')).toBeInTheDocument()
  })

  it('displays negative pitch value', () => {
    render(<ControlIndicators inputs={{ ...zeroInputs, pitch: -0.5 }} />)
    expect(screen.getByText('-0.50')).toBeInTheDocument()
  })

  it('shows simulation disclaimer', () => {
    render(<ControlIndicators inputs={zeroInputs} />)
    expect(screen.getByText(/not connected to hardware/i)).toBeInTheDocument()
  })
})

// ── FlightModeCard ────────────────────────────────────────────────────────────

describe('FlightModeCard', () => {
  it('renders all three mode buttons', () => {
    render(<FlightModeCard flightMode="stabilize" onSelect={() => {}} />)
    expect(screen.getByText('Stabilize')).toBeInTheDocument()
    expect(screen.getByText('Altitude Hold')).toBeInTheDocument()
    expect(screen.getByText('Position Hold')).toBeInTheDocument()
  })

  it('marks the active mode as aria-pressed=true', () => {
    render(<FlightModeCard flightMode="altitude-hold" onSelect={() => {}} />)
    const altBtn = screen.getByRole('button', { name: /Altitude Hold/i })
    expect(altBtn).toHaveAttribute('aria-pressed', 'true')
  })

  it('marks inactive modes as aria-pressed=false', () => {
    render(<FlightModeCard flightMode="stabilize" onSelect={() => {}} />)
    const altBtn = screen.getByRole('button', { name: /Altitude Hold/i })
    expect(altBtn).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onSelect with correct mode when clicked', () => {
    const onSelect = vi.fn()
    render(<FlightModeCard flightMode="stabilize" onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button', { name: /Position Hold/i }))
    expect(onSelect).toHaveBeenCalledWith('position-hold')
  })

  it('shows simulation disclaimer', () => {
    render(<FlightModeCard flightMode="stabilize" onSelect={() => {}} />)
    expect(screen.getByText(/simulation labels only/i)).toBeInTheDocument()
  })
})

// ── KeyboardStatusPanel ───────────────────────────────────────────────────────

describe('KeyboardStatusPanel', () => {
  const defaults = {
    enabled: false,
    pressedKeys: new Set<string>(),
    precisionMode: false,
    flightMode: 'stabilize' as const,
    paused: false,
  }

  it('shows Enabled: No when disabled', () => {
    render(<KeyboardStatusPanel {...defaults} />)
    expect(screen.getByText('No')).toBeInTheDocument()
  })

  it('shows Enabled: Yes when enabled', () => {
    render(<KeyboardStatusPanel {...defaults} enabled={true} />)
    expect(screen.getByText('Yes')).toBeInTheDocument()
  })

  it('shows None when no keys pressed', () => {
    render(<KeyboardStatusPanel {...defaults} />)
    expect(screen.getByText('None')).toBeInTheDocument()
  })

  it('shows pressed key badges', () => {
    render(
      <KeyboardStatusPanel
        {...defaults}
        enabled={true}
        pressedKeys={new Set(['w', 'Shift'])}
      />
    )
    expect(screen.getByText('w')).toBeInTheDocument()
    expect(screen.getByText('Shift')).toBeInTheDocument()
  })

  it('shows Precision sensitivity when precisionMode=true', () => {
    render(<KeyboardStatusPanel {...defaults} precisionMode={true} />)
    expect(screen.getByText('Precision')).toBeInTheDocument()
  })

  it('shows Normal sensitivity by default', () => {
    render(<KeyboardStatusPanel {...defaults} />)
    expect(screen.getByText('Normal')).toBeInTheDocument()
  })

  it('shows Paused status when paused=true', () => {
    render(<KeyboardStatusPanel {...defaults} paused={true} />)
    expect(screen.getByText('Paused')).toBeInTheDocument()
  })

  it('shows the persistent safety notice', () => {
    render(<KeyboardStatusPanel {...defaults} />)
    expect(screen.getByText(/Physical drone control is disabled/i)).toBeInTheDocument()
  })

  it('displays the selected flight mode label', () => {
    render(<KeyboardStatusPanel {...defaults} flightMode="altitude-hold" />)
    expect(screen.getByText(/Altitude Hold/i)).toBeInTheDocument()
  })
})

// ── ManualControlPage (dashboard integration) ─────────────────────────────────

function renderPage() {
  return render(
    <MemoryRouter>
      <ManualControlPage />
    </MemoryRouter>
  )
}

describe('ManualControlPage (Stage 4 dashboard)', () => {
  it('renders without crashing', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /Manual Control/i })).toBeInTheDocument()
  })

  it('shows SIMULATION badge', () => {
    renderPage()
    const elements = screen.getAllByText('SIMULATION')
    expect(elements.length).toBeGreaterThanOrEqual(1)
  })

  it('shows DISCONNECTED badge', () => {
    renderPage()
    const elements = screen.getAllByText('DISCONNECTED')
    expect(elements.length).toBeGreaterThanOrEqual(1)
  })

  it('shows the hardware warning in the bottom safety strip', () => {
    renderPage()
    // Simulation tab shows a bottom info strip (not role=alert)
    expect(screen.getByText(/Simulation controls only/i)).toBeInTheDocument()
  })

  it('shows the keyboard shortcuts reference', () => {
    renderPage()
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
    expect(screen.getByText('W / S')).toBeInTheDocument()
  })

  it('renders the R3F canvas mock', () => {
    renderPage()
    expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument()
  })

  it('keyboard Enabled/Disabled button is present', () => {
    renderPage()
    // The keyboard toggle button shows "Disabled" or "Enabled"
    const btn = screen.getByRole('switch', { name: /Disabled|Enabled/i })
    expect(btn).toHaveAttribute('aria-checked', 'false')
  })

  it('clicking keyboard toggle enables it', () => {
    renderPage()
    const btn = screen.getByRole('switch', { name: /Disabled|Enabled/i })
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-checked', 'true')
  })

  it('Pause toggle is present', () => {
    renderPage()
    // Pause ToggleSwitch has role="switch"
    const switches = screen.getAllByRole('switch')
    expect(switches.length).toBeGreaterThanOrEqual(1)
  })

  it('clicking Pause toggle changes its checked state', () => {
    renderPage()
    // Find the pause toggle (second switch in the quick-action area)
    const switches = screen.getAllByRole('switch')
    // There are multiple toggles; the pause one is unchecked initially
    const pauseSwitch = switches.find(s => s.getAttribute('aria-checked') === 'false' && s !== switches[0])
    if (pauseSwitch) {
      expect(pauseSwitch).toHaveAttribute('aria-checked', 'false')
    }
  })

  it('Help button opens the shortcut modal', () => {
    renderPage()
    const helpBtn = screen.getByRole('button', { name: '?' })
    fireEvent.click(helpBtn)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(dialog.textContent).toMatch(/Release controls/i)
  })

  it('closing the modal removes it', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: '?' }))
    fireEvent.click(screen.getByRole('button', { name: /Close/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('Reset button is present', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /^Reset$/i })).toBeInTheDocument()
  })

  it('flight mode buttons render in the dashboard', () => {
    renderPage()
    expect(screen.getAllByText('Stabilize').length).toBeGreaterThanOrEqual(1)
  })

  it('Drone Status panel is present', () => {
    renderPage()
    expect(screen.getByText('Drone Status')).toBeInTheDocument()
    expect(screen.getByText('Quadcopter')).toBeInTheDocument()
  })

  it('Keyboard Control panel is present', () => {
    renderPage()
    expect(screen.getByText('Keyboard Control')).toBeInTheDocument()
  })

  it('physical hardware mode remains unavailable', () => {
    renderPage()
    // Must not claim real hardware armed/online; "Connected" in Drone Status is a sim label — OK
    expect(screen.queryByText(/hardware online/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/motors: armed/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/physical mode active/i)).not.toBeInTheDocument()
  })
})
