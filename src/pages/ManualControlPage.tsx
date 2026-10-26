/**
 * ManualControlPage
 *
 * Two-tab layout:
 *   • Manual  — motor cards, all-motors control, quadcopter diagram, safety panel
 *   • Simulation — 3-D viewport, keyboard controls, attitude indicator, flight modes
 *
 * ALL commands are SIMULATION-ONLY. Physical hardware control is not implemented.
 */
import { useReducer, useEffect, useRef, useState } from 'react'
import {
  HelpCircle, Pause, RotateCcw, Zap,
  Gamepad2, FlaskConical,
} from 'lucide-react'
import clsx from 'clsx'
import type { ManualControlState, MotorId, FlightMode } from '@/types/manual-control'
import { MIN_PWM, MAX_PWM } from '@/types/manual-control'
import {
  createInitialState,
  setMotorPwm,
  setAllMotorsPwm,
  stopAll,
  setControlInput,
  applyKeyboardInputs,
  selectFlightMode,
  resetInterface,
} from '@/lib/control/manual-control'
import { useKeyboardControl } from '@/hooks/useKeyboardControl'
import { useFleetSimulation }  from '@/hooks/useFleetSimulation'

// Simulation tab components
import SimulatorViewport   from '@/components/manual-control/SimulatorViewport'
import ControlIndicators   from '@/components/manual-control/ControlIndicators'
import FlightModeCard      from '@/components/manual-control/FlightModeCard'
import TranslucentKeyboard from '@/components/manual-control/TranslucentKeyboard'
import KeyboardStatusPanel from '@/components/manual-control/KeyboardStatusPanel'
import AttitudeIndicator   from '@/components/manual-control/AttitudeIndicator'
import ThrottleGauge       from '@/components/manual-control/ThrottleGauge'

// Manual tab components
import QuadcopterDiagram from '@/components/manual-control/QuadcopterDiagram'
import MotorCard         from '@/components/manual-control/MotorCard'
import SafetyPanel       from '@/components/manual-control/SafetyPanel'

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = 'manual' | 'simulation'

type ManualControlAction =
  | { type: 'SET_MOTOR_PWM'; id: MotorId; pwmUs: number }
  | { type: 'SET_ALL_MOTORS_PWM'; pwmUs: number }
  | { type: 'STOP_ALL' }
  | { type: 'SET_CONTROL_INPUT'; axis: 'throttle' | 'roll' | 'pitch' | 'yaw'; value: number }
  | { type: 'APPLY_KEYBOARD_INPUTS'; pressedKeys: Set<string>; precisionMode: boolean; deltaMs: number }
  | { type: 'SELECT_FLIGHT_MODE'; mode: FlightMode }
  | { type: 'TOGGLE_KEYBOARD'; enabled: boolean }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'RESET_INTERFACE' }

// ── Reducer ───────────────────────────────────────────────────────────────────

function reducer(state: ManualControlState, action: ManualControlAction): ManualControlState {
  switch (action.type) {
    case 'SET_MOTOR_PWM': {
      try { return setMotorPwm(state, action.id, action.pwmUs) } catch { return state }
    }
    case 'SET_ALL_MOTORS_PWM': {
      try { return setAllMotorsPwm(state, action.pwmUs) } catch { return state }
    }
    case 'STOP_ALL':          return stopAll(state)
    case 'SET_CONTROL_INPUT': return setControlInput(state, action.axis, action.value)
    case 'APPLY_KEYBOARD_INPUTS':
      return applyKeyboardInputs(state, action.pressedKeys, action.precisionMode, action.deltaMs)
    case 'SELECT_FLIGHT_MODE': return selectFlightMode(state, action.mode)
    case 'TOGGLE_KEYBOARD':
      return { ...state, keyboard: { ...state.keyboard, enabled: action.enabled } }
    case 'TOGGLE_PAUSE':
      return { ...state, keyboard: { ...state.keyboard, paused: !state.keyboard.paused } }
    case 'RESET_INTERFACE': return resetInterface(state)
    default: return state
  }
}

// ── Keyboard shortcut reference ───────────────────────────────────────────────

const SHORTCUTS = [
  { keys: 'W / S',  action: 'Pitch forward / backward' },
  { keys: 'A / D',  action: 'Roll left / right' },
  { keys: '↑ / ↓',  action: 'Throttle up / down' },
  { keys: '← / →',  action: 'Yaw left / right' },
  { keys: 'Shift',  action: 'Precision mode' },
  { keys: '1',      action: 'Stabilize mode' },
  { keys: '2',      action: 'Altitude Hold mode' },
  { keys: '3',      action: 'Position Hold mode' },
  { keys: 'Space',  action: 'Pause movement' },
  { keys: 'Esc',    action: 'Release controls' },
  { keys: 'H',      action: 'Home view (reset camera)' },
  { keys: '?',      action: 'Show this help' },
]

const MOTOR_IDS: MotorId[] = ['M1', 'M2', 'M3', 'M4']

// ── Component ─────────────────────────────────────────────────────────────────

export default function ManualControlPage() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)
  const [activeTab, setActiveTab] = useState<Tab>('simulation')

  // Live keyboard state — NOT in reducer
  const { pressedKeys, precisionMode } = useKeyboardControl(state.keyboard.enabled)
  const pressedKeysRef  = useRef(pressedKeys)
  const precisionModeRef = useRef(precisionMode)
  useEffect(() => { pressedKeysRef.current  = pressedKeys   }, [pressedKeys])
  useEffect(() => { precisionModeRef.current = precisionMode }, [precisionMode])

  // All-motors staging (local — not in reducer)
  const [allMotorsStagingPwm, setAllMotorsStagingPwm] = useState(MIN_PWM)

  const [showHelp, setShowHelp] = useState(false)

  const fleet    = useFleetSimulation()
  const telemetry = fleet.aircraft[0]

  // Keyboard tick at 100 ms
  useEffect(() => {
    if (!state.keyboard.enabled || state.keyboard.paused) return
    const id = setInterval(() => {
      dispatch({
        type: 'APPLY_KEYBOARD_INPUTS',
        pressedKeys:   pressedKeysRef.current,
        precisionMode: precisionModeRef.current,
        deltaMs: 100,
      })
    }, 100)
    return () => clearInterval(id)
  }, [state.keyboard.enabled, state.keyboard.paused])

  // Scroll prevention
  useEffect(() => {
    const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '])
    const prevent = (e: KeyboardEvent) => {
      if (!SCROLL_KEYS.has(e.key)) return
      const t = e.target as HTMLElement | null
      if (t?.tagName === 'INPUT' || t?.tagName === 'TEXTAREA' ||
          t?.tagName === 'SELECT' || t?.isContentEditable) return
      if (state.keyboard.enabled) e.preventDefault()
    }
    document.addEventListener('keydown', prevent)
    return () => document.removeEventListener('keydown', prevent)
  }, [state.keyboard.enabled])

  // Flight-mode keys 1/2/3 + ? (always registered)
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t?.tagName === 'INPUT' || t?.tagName === 'TEXTAREA' ||
          t?.tagName === 'SELECT' || t?.isContentEditable) return
      if (e.key === '1') dispatch({ type: 'SELECT_FLIGHT_MODE', mode: 'stabilize' })
      if (e.key === '2') dispatch({ type: 'SELECT_FLIGHT_MODE', mode: 'altitude-hold' })
      if (e.key === '3') dispatch({ type: 'SELECT_FLIGHT_MODE', mode: 'position-hold' })
      if (e.key === '?') setShowHelp(v => !v)
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [])

  const simState = state.keyboard.paused ? 'paused'
    : state.keyboard.enabled ? 'running' : 'idle'

  const motorValues = MOTOR_IDS.map(id => state.motors[id].commandedPwmUs)
  const allSamePwm  = motorValues.every(v => v === motorValues[0])

  if (!telemetry) return null

  // ── Shared header (shown on both tabs) ──────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 max-w-[1400px] pb-6">

      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1">
          <p className="text-[10px] text-artic-muted font-mono tracking-widest uppercase">
            A.R.T.I.C SkyPilot · Test Drone 01
          </p>
          <h2 className="text-xl font-bold text-artic-text">Manual Control</h2>
        </div>
        <span className="badge bg-artic-accent/10 border border-artic-accent/30 text-artic-accent font-mono text-[10px] tracking-widest uppercase">
          SIMULATION
        </span>
        <span className="badge bg-artic-danger/10 border border-artic-danger/30 text-artic-danger font-mono text-[10px] tracking-widest uppercase">
          DISCONNECTED
        </span>
      </div>

      {/* Safety banner */}
      <div
        role="alert"
        aria-live="polite"
        className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-artic-warning/10 border border-artic-warning/30 text-xs"
      >
        <span className="text-artic-warning shrink-0">⚠</span>
        <p className="text-artic-warning/80">
          <span className="font-semibold text-artic-warning">PHYSICAL HARDWARE NOT CONNECTED — </span>
          Simulation controls only. Physical drone control is disabled until a compatible flight
          controller, communication protocol, and safety system are implemented and verified.
        </p>
      </div>

      {/* ── Tab switcher ─────────────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 rounded-xl bg-navy-900/60 border border-artic-border/60 w-fit">
        {([
          { id: 'manual',     label: 'Manual Control', icon: Gamepad2 },
          { id: 'simulation', label: 'Simulation',     icon: FlaskConical },
        ] as { id: Tab; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setActiveTab(id)}
            className={clsx(
              'flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150',
              activeTab === id
                ? 'bg-artic-surface border border-artic-accent/30 text-artic-accent shadow-sm'
                : 'text-artic-muted hover:text-artic-text',
            )}
          >
            <Icon className="w-4 h-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1 — MANUAL CONTROL
          Motor cards, quadcopter diagram, all-motors slider, safety panel
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'manual' && (
        <div className="flex gap-4 items-start">

          {/* Left: diagram + motor cards + all-motors */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            <QuadcopterDiagram motors={state.motors} />

            <div className="grid grid-cols-2 gap-3">
              {MOTOR_IDS.map(id => (
                <MotorCard
                  key={id}
                  motor={state.motors[id]}
                  onCommandChange={(motorId, pwmUs) =>
                    dispatch({ type: 'SET_MOTOR_PWM', id: motorId, pwmUs })
                  }
                />
              ))}
            </div>

            {/* All-motors control */}
            <div className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-artic-text">All Motors</h3>
                {!allSamePwm && (
                  <span className="text-[10px] text-artic-warning font-mono">⚠ Motors differ</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-artic-muted w-20 shrink-0">
                  {allMotorsStagingPwm} µs
                </span>
                <input
                  type="range"
                  min={MIN_PWM}
                  max={MAX_PWM}
                  step={1}
                  value={allMotorsStagingPwm}
                  onChange={e => setAllMotorsStagingPwm(Number(e.target.value))}
                  className="flex-1 accent-cyan-400 cursor-pointer"
                  aria-label="All motors PWM staging value"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => dispatch({ type: 'SET_ALL_MOTORS_PWM', pwmUs: allMotorsStagingPwm })}
                  className="flex-1 py-2 text-xs font-semibold rounded border border-artic-accent/40 text-artic-accent bg-artic-accent/10 hover:bg-artic-accent/20 transition-colors"
                >
                  Apply to All
                </button>
                <button
                  onClick={() => {
                    setAllMotorsStagingPwm(MIN_PWM)
                    dispatch({ type: 'SET_ALL_MOTORS_PWM', pwmUs: MIN_PWM })
                  }}
                  className="flex-1 py-2 text-xs font-semibold rounded border border-artic-border text-artic-muted hover:text-artic-text hover:bg-navy-800 transition-colors"
                >
                  Reset to Minimum
                </button>
              </div>
              <p className="text-[10px] text-artic-muted">
                Staging value: {allMotorsStagingPwm} µs · click Apply to command all motors
              </p>
            </div>
          </div>

          {/* Right: safety panel */}
          <div className="w-80 shrink-0">
            <SafetyPanel
              safety={state.safety}
              onStopAll={() => dispatch({ type: 'STOP_ALL' })}
            />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2 — SIMULATION
          3-D viewport, keyboard, attitude/throttle instruments, flight modes
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'simulation' && (
        <div className="flex gap-4 items-start">

          {/* Left column */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            <SimulatorViewport
              telemetry={telemetry}
              simState={simState}
              paused={simState === 'paused'}
            />

            {/* Flight mode + control indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FlightModeCard
                flightMode={state.flightMode}
                onSelect={mode => dispatch({ type: 'SELECT_FLIGHT_MODE', mode })}
              />
              <ControlIndicators inputs={state.inputs} />
            </div>

            {/* Attitude indicator + throttle gauge */}
            <div className="flex items-center gap-4 px-2">
              <AttitudeIndicator
                pitch={state.inputs.pitch}
                roll={state.inputs.roll}
                className="shrink-0"
              />
              <div className="flex-1" />
              <ThrottleGauge throttle={state.inputs.throttle} className="shrink-0" />
            </div>

            {/* Translucent keyboard */}
            <div className="flex gap-3 items-start">
              <div className="flex-1 min-w-0">
                <TranslucentKeyboard
                  pressedKeys={pressedKeys}
                  enabled={state.keyboard.enabled}
                />
                <p className="mt-2 text-[10px] text-artic-muted/70 text-center font-mono">
                  Press Esc to neutralize all inputs · Space to pause
                </p>
              </div>

              {/* Keyboard Control card */}
              <div className="w-48 shrink-0 glass-panel p-4 space-y-4">
                <div className="border-b border-white/5 pb-3">
                  <span className="text-xs font-semibold text-artic-text uppercase tracking-wide">
                    Keyboard Control
                  </span>
                </div>
                <button
                  role="switch"
                  aria-checked={state.keyboard.enabled}
                  onClick={() => dispatch({ type: 'TOGGLE_KEYBOARD', enabled: !state.keyboard.enabled })}
                  className={clsx(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-xs font-mono font-semibold transition-all',
                    state.keyboard.enabled
                      ? 'bg-green-600/20 border-green-500/50 text-green-400 shadow-[0_0_8px_rgba(34,197,94,0.2)]'
                      : 'bg-navy-800/60 border-artic-border/60 text-artic-muted',
                  )}
                >
                  <span>Keyboard</span>
                  <span className={clsx(
                    'px-2 py-0.5 rounded text-[10px] border font-bold',
                    state.keyboard.enabled
                      ? 'bg-green-600/40 border-green-500/60 text-green-300'
                      : 'bg-navy-700 border-artic-border text-artic-muted',
                  )}>
                    {state.keyboard.enabled ? 'ON' : 'OFF'}
                  </span>
                </button>

                <div>
                  <p className="text-[10px] text-artic-muted uppercase tracking-widest mb-2">Pressed Keys</p>
                  <div className="flex flex-wrap gap-1 min-h-[28px]">
                    {Array.from(pressedKeys).map(k => (
                      <span
                        key={k}
                        className="px-2 py-1 rounded border text-[10px] font-mono bg-blue-600/30 border-blue-400/60 text-blue-200 font-bold"
                      >
                        {k === ' ' ? 'Spc' : k === 'ArrowUp' ? '↑' : k === 'ArrowDown' ? '↓'
                          : k === 'ArrowLeft' ? '←' : k === 'ArrowRight' ? '→' : k}
                      </span>
                    ))}
                    {pressedKeys.size === 0 && (
                      <span className="text-[10px] text-artic-muted/50 italic">none</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick-action cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="glass-panel p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-artic-accent" aria-hidden="true" />
                  <p className="text-xs font-semibold text-artic-text">Precision Mode</p>
                </div>
                <p className="text-[10px] text-artic-muted">Reduced sensitivity</p>
                <button
                  role="switch"
                  aria-checked={precisionMode}
                  disabled={!state.keyboard.enabled}
                  className={clsx(
                    'w-full flex items-center justify-between px-2 py-1.5 rounded border text-[10px] font-mono transition-colors',
                    precisionMode
                      ? 'bg-artic-accent/20 border-artic-accent/40 text-artic-accent'
                      : 'bg-navy-800/60 border-artic-border/60 text-artic-muted',
                    !state.keyboard.enabled && 'opacity-40 cursor-not-allowed',
                  )}
                >
                  <span>SHIFT key</span>
                  <span>{precisionMode ? 'ON' : 'OFF'}</span>
                </button>
              </div>

              <div className="glass-panel p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Pause className="w-4 h-4 text-artic-warning" aria-hidden="true" />
                  <p className="text-xs font-semibold text-artic-text">Pause</p>
                </div>
                <p className="text-[10px] text-artic-muted">Stop simulated movement</p>
                <button
                  role="switch"
                  aria-checked={state.keyboard.paused}
                  onClick={() => dispatch({ type: 'TOGGLE_PAUSE' })}
                  className={clsx(
                    'w-full flex items-center justify-between px-2 py-1.5 rounded border text-[10px] font-mono transition-colors',
                    state.keyboard.paused
                      ? 'bg-artic-warning/20 border-artic-warning/40 text-artic-warning'
                      : 'bg-navy-800/60 border-artic-border/60 text-artic-muted',
                  )}
                >
                  <span>Space key</span>
                  <span>{state.keyboard.paused ? 'ON' : 'OFF'}</span>
                </button>
              </div>

              <div className="glass-panel p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-artic-muted" aria-hidden="true" />
                  <p className="text-xs font-semibold text-artic-text">Reset Controls</p>
                </div>
                <p className="text-[10px] text-artic-muted">Clear all inputs</p>
                <button
                  onClick={() => {
                    dispatch({ type: 'RESET_INTERFACE' })
                    setAllMotorsStagingPwm(MIN_PWM)
                  }}
                  className="w-full px-2 py-1.5 rounded border text-[10px] font-semibold bg-navy-800/60 border-artic-border/60 text-artic-muted hover:text-artic-text hover:bg-navy-700 transition-colors"
                >
                  Reset
                </button>
              </div>

              <div className="glass-panel p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-artic-muted" aria-hidden="true" />
                  <p className="text-xs font-semibold text-artic-text">Help</p>
                </div>
                <p className="text-[10px] text-artic-muted">Show shortcuts</p>
                <button
                  onClick={() => setShowHelp(true)}
                  className="w-full px-2 py-1.5 rounded border text-[10px] font-semibold bg-navy-800/60 border-artic-border/60 text-artic-muted hover:text-artic-text hover:bg-navy-700 transition-colors"
                >
                  ?
                </button>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="w-72 shrink-0 flex flex-col gap-4">
            <div className="glass-panel p-4">
              <p className="text-xs font-semibold text-artic-text uppercase tracking-widest mb-3">
                Keyboard Shortcuts
              </p>
              <div className="space-y-1.5">
                {SHORTCUTS.map(({ keys, action }) => (
                  <div key={keys} className="flex items-center gap-2">
                    <span className="font-mono text-[10px] bg-navy-800 border border-artic-border/60 rounded px-1.5 py-0.5 text-artic-accent min-w-[52px] text-center shrink-0">
                      {keys}
                    </span>
                    <span className="text-[11px] text-artic-muted">{action}</span>
                  </div>
                ))}
              </div>
            </div>

            <KeyboardStatusPanel
              enabled={state.keyboard.enabled}
              pressedKeys={pressedKeys}
              precisionMode={precisionMode}
              flightMode={state.flightMode}
              paused={state.keyboard.paused}
            />
          </div>
        </div>
      )}

      {/* Safety panel — always visible on both tabs */}
      {activeTab === 'manual' ? null : (
        <SafetyPanel
          safety={state.safety}
          onStopAll={() => dispatch({ type: 'STOP_ALL' })}
        />
      )}

      {/* Help modal */}
      {showHelp && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard shortcuts reference"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="glass-panel p-6 w-[480px] max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-artic-text">Keyboard Shortcuts</p>
              <button
                onClick={() => setShowHelp(false)}
                className="text-artic-muted hover:text-artic-text text-xs px-2 py-1 rounded border border-artic-border hover:bg-navy-800 transition-colors"
              >
                Close
              </button>
            </div>
            <div className="space-y-2">
              {SHORTCUTS.map(({ keys, action }) => (
                <div key={keys} className="flex items-center gap-3 py-1 border-b border-artic-border/30 last:border-0">
                  <span className="font-mono text-[11px] bg-navy-800 border border-artic-border/60 rounded px-2 py-1 text-artic-accent min-w-[64px] text-center shrink-0">
                    {keys}
                  </span>
                  <span className="text-xs text-artic-muted">{action}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[10px] text-artic-muted border-t border-artic-border/30 pt-3">
              These controls operate the simulator only. Physical drone control remains disabled.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
