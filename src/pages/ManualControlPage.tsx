/**
 * ManualControlPage
 *
 * Full-screen, no-scroll layout matching the reference GCS image.
 * Both tabs use -m-6 to cancel AppLayout padding and fill the window.
 *
 * • Manual Control tab  — quadcopter diagram + compact motor cards + safety panel
 * • Simulation tab      — scenic 3-D viewport + keyboard + right-column status
 *
 * ALL commands are SIMULATION-ONLY. Physical hardware is not connected.
 */
import { useReducer, useEffect, useRef, useState } from 'react'
import {
  HelpCircle, Pause, RotateCcw, Zap,
  Gamepad2, FlaskConical,
  Activity, Wifi, BatteryMedium, MapPin,
} from 'lucide-react'
import clsx from 'clsx'
import type { ManualControlState, MotorId, FlightMode, MotorState } from '@/types/manual-control'
import { MIN_PWM, MAX_PWM } from '@/types/manual-control'
import {
  createInitialState, setMotorPwm, setAllMotorsPwm, stopAll,
  setControlInput, applyKeyboardInputs, selectFlightMode, resetInterface,
} from '@/lib/control/manual-control'
import { useKeyboardControl }  from '@/hooks/useKeyboardControl'
import { useFleetSimulation }  from '@/hooks/useFleetSimulation'

import SimulatorViewport   from '@/components/manual-control/SimulatorViewport'
import TranslucentKeyboard from '@/components/manual-control/TranslucentKeyboard'
import QuadcopterDiagram   from '@/components/manual-control/QuadcopterDiagram'
import SafetyPanel         from '@/components/manual-control/SafetyPanel'

// ── Types ─────────────────────────────────────────────────────────────────────
type Tab = 'manual' | 'simulation'

type ManualControlAction =
  | { type: 'SET_MOTOR_PWM';        id: MotorId; pwmUs: number }
  | { type: 'SET_ALL_MOTORS_PWM';   pwmUs: number }
  | { type: 'STOP_ALL' }
  | { type: 'SET_CONTROL_INPUT';    axis: 'throttle'|'roll'|'pitch'|'yaw'; value: number }
  | { type: 'APPLY_KEYBOARD_INPUTS'; pressedKeys: Set<string>; precisionMode: boolean; deltaMs: number }
  | { type: 'SELECT_FLIGHT_MODE';   mode: FlightMode }
  | { type: 'TOGGLE_KEYBOARD';      enabled: boolean }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'RESET_INTERFACE' }

function reducer(s: ManualControlState, a: ManualControlAction): ManualControlState {
  switch (a.type) {
    case 'SET_MOTOR_PWM':          { try { return setMotorPwm(s, a.id, a.pwmUs) } catch { return s } }
    case 'SET_ALL_MOTORS_PWM':     { try { return setAllMotorsPwm(s, a.pwmUs) } catch { return s } }
    case 'STOP_ALL':                return stopAll(s)
    case 'SET_CONTROL_INPUT':       return setControlInput(s, a.axis, a.value)
    case 'APPLY_KEYBOARD_INPUTS':   return applyKeyboardInputs(s, a.pressedKeys, a.precisionMode, a.deltaMs)
    case 'SELECT_FLIGHT_MODE':      return selectFlightMode(s, a.mode)
    case 'TOGGLE_KEYBOARD':         return { ...s, keyboard: { ...s.keyboard, enabled: a.enabled } }
    case 'TOGGLE_PAUSE':            return { ...s, keyboard: { ...s.keyboard, paused: !s.keyboard.paused } }
    case 'RESET_INTERFACE':         return resetInterface(s)
    default: return s
  }
}

// ── Keyboard shortcut table ───────────────────────────────────────────────────
const SHORTCUTS = [
  { keys: 'W / S',  action: 'Pitch (forward / backward)' },
  { keys: 'A / D',  action: 'Roll (left / right)'        },
  { keys: '↑ / ↓',  action: 'Throttle (up / down)'       },
  { keys: '← / →',  action: 'Yaw (left / right)'         },
  { keys: 'Shift',  action: 'Precision mode'              },
  { keys: '1',      action: 'Stabilize mode'              },
  { keys: '2',      action: 'Altitude Hold mode'          },
  { keys: '3',      action: 'Position Hold mode'          },
  { keys: 'Space',  action: 'Pause movement'              },
  { keys: 'Esc',    action: 'Release controls'            },
  { keys: 'H',      action: 'Home view (reset camera)'   },
  { keys: '?',      action: 'Show this help'              },
]

const MOTOR_IDS: MotorId[] = ['M1', 'M2', 'M3', 'M4']

// ── Inline axis bar ───────────────────────────────────────────────────────────
function AxisBar({ label, value, bipolar, color }: {
  label: string; value: number; bipolar: boolean; color: string
}) {
  const barStyle = bipolar
    ? value >= 0
      ? { left: '50%',                        width: `${Math.abs(value)*50}%` }
      : { left: `${50 + value*50}%`,           width: `${Math.abs(value)*50}%` }
    : { left: '0%', width: `${value*100}%` }
  return (
    <div className="flex items-center gap-1.5 text-[11px]">
      <span className="text-artic-muted w-12 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-navy-800 rounded-full relative overflow-hidden">
        {bipolar && <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20" />}
        <div className={`absolute top-0 bottom-0 rounded-full ${color} transition-all duration-100`} style={barStyle} />
      </div>
      <span className="font-mono text-artic-text w-9 text-right shrink-0">{value.toFixed(2)}</span>
    </div>
  )
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
function ToggleSwitch({ checked, onChange, disabled }: {
  checked: boolean; onChange: () => void; disabled?: boolean
}) {
  return (
    <button
      role="switch" aria-checked={checked} onClick={onChange} disabled={disabled}
      className={clsx(
        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0',
        checked ? 'bg-green-500' : 'bg-navy-700',
        disabled && 'opacity-40 cursor-not-allowed',
      )}
    >
      <span className={clsx(
        'inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform',
        checked ? 'translate-x-4' : 'translate-x-0.5',
      )} />
    </button>
  )
}

// ── Compact motor card — matches reference exactly ────────────────────────────
function CompactMotorCard({ motor, onCommandChange }: {
  motor: MotorState
  onCommandChange: (id: MotorId, pwmUs: number) => void
}) {
  const rangePercent = ((motor.commandedPwmUs - MIN_PWM) / (MAX_PWM - MIN_PWM)) * 100

  return (
    <div className="rounded-xl border border-artic-border bg-artic-surface px-3 py-2 flex flex-col gap-1 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-artic-accent text-sm">{motor.id}</span>
          <span className="text-[10px] text-artic-muted bg-navy-800 px-1.5 py-0.5 rounded border border-artic-border">
            {motor.position}
          </span>
        </div>
        <button
          onClick={() => onCommandChange(motor.id, MIN_PWM)}
          className="flex items-center gap-1 text-[10px] text-artic-muted hover:text-artic-danger transition-colors font-mono"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-artic-muted" />
          STOP
        </button>
      </div>

      {/* PWM value — large */}
      <div className="text-center leading-none shrink-0">
        <span className="font-mono font-bold text-artic-text text-3xl">{motor.commandedPwmUs}</span>
        <span className="text-artic-muted text-sm ml-1">µs</span>
      </div>

      <p className="text-[9px] text-artic-muted text-center leading-tight shrink-0">
        Commanded ESC pulse (µs) — simulation only
      </p>

      {/* Progress + slider combined */}
      <div className="flex flex-col gap-0.5 mt-auto shrink-0">
        <div className="h-1 rounded-full bg-navy-800 overflow-hidden">
          <div
            className={clsx('h-full rounded-full transition-all duration-100',
              motor.simActive ? 'bg-artic-accent' : 'bg-artic-muted/40'
            )}
            style={{ width: `${rangePercent}%` }}
          />
        </div>
        <input
          type="range" min={MIN_PWM} max={MAX_PWM} step={1}
          value={motor.commandedPwmUs}
          onChange={e => {
            onCommandChange(motor.id, Number(e.target.value))
          }}
          className="w-full accent-cyan-400 cursor-pointer h-1"
          aria-label={`${motor.id} PWM slider`}
        />
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ManualControlPage() {
  const [state, dispatch]          = useReducer(reducer, undefined, createInitialState)
  const [activeTab, setActiveTab]  = useState<Tab>('simulation')
  const [showHelp, setShowHelp]    = useState(false)

  const { pressedKeys, precisionMode } = useKeyboardControl(state.keyboard.enabled)
  const pressedKeysRef   = useRef(pressedKeys)
  const precisionModeRef = useRef(precisionMode)
  useEffect(() => { pressedKeysRef.current   = pressedKeys   }, [pressedKeys])
  useEffect(() => { precisionModeRef.current = precisionMode }, [precisionMode])

  const [allMotorsStagingPwm, setAllMotorsStagingPwm] = useState(MIN_PWM)

  const fleet    = useFleetSimulation()
  const telemetry = fleet.aircraft[0]

  // Keyboard tick
  useEffect(() => {
    if (!state.keyboard.enabled || state.keyboard.paused) return
    const id = setInterval(() => dispatch({
      type: 'APPLY_KEYBOARD_INPUTS',
      pressedKeys:   pressedKeysRef.current,
      precisionMode: precisionModeRef.current,
      deltaMs: 100,
    }), 100)
    return () => clearInterval(id)
  }, [state.keyboard.enabled, state.keyboard.paused])

  // Scroll prevention
  useEffect(() => {
    const SCROLL_KEYS = new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '])
    const prevent = (e: KeyboardEvent) => {
      if (!SCROLL_KEYS.has(e.key)) return
      const t = e.target as HTMLElement | null
      if (t?.tagName==='INPUT'||t?.tagName==='TEXTAREA'||t?.tagName==='SELECT'||t?.isContentEditable) return
      if (state.keyboard.enabled) e.preventDefault()
    }
    document.addEventListener('keydown', prevent)
    return () => document.removeEventListener('keydown', prevent)
  }, [state.keyboard.enabled])

  // Flight mode keys + ?
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t?.tagName==='INPUT'||t?.tagName==='TEXTAREA'||t?.tagName==='SELECT'||t?.isContentEditable) return
      if (e.key==='1') dispatch({type:'SELECT_FLIGHT_MODE', mode:'stabilize'})
      if (e.key==='2') dispatch({type:'SELECT_FLIGHT_MODE', mode:'altitude-hold'})
      if (e.key==='3') dispatch({type:'SELECT_FLIGHT_MODE', mode:'position-hold'})
      if (e.key==='?') setShowHelp(v => !v)
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [])

  const simState    = state.keyboard.paused ? 'paused' : state.keyboard.enabled ? 'running' : 'idle'
  const motorValues = MOTOR_IDS.map(id => state.motors[id].commandedPwmUs)
  const allSamePwm  = motorValues.every(v => v === motorValues[0])
  const { inputs, flightMode } = state

  const displayKeys = Array.from(pressedKeys).map(k =>
    k===' ' ? 'Space' : k==='ArrowUp' ? '↑' : k==='ArrowDown' ? '↓'
    : k==='ArrowLeft' ? '←' : k==='ArrowRight' ? '→' : k
  )

  if (!telemetry) return null

  // ── Shared chrome: full-screen wrapper + top strip + tab bar ──────────────
  // -m-6 cancels AppLayout's p-6 so we own the full available space.
  // Height = 100vh minus the SimulationBanner (32px) and TopBar (48px) = 80px total.
  const PAGE_HEIGHT = 'calc(100vh - 80px)'

  // Tab bar (shared)
  const TabBar = (
    <div className="flex gap-0.5 p-0.5 rounded-lg bg-navy-900/70 border border-artic-border/50 w-fit shrink-0">
      {([
        { id: 'manual'     as Tab, label: 'Manual Control', Icon: Gamepad2     },
        { id: 'simulation' as Tab, label: 'Simulation',     Icon: FlaskConical },
      ]).map(({ id, label, Icon }) => (
        <button
          key={id}
          role="tab"
          aria-selected={activeTab === id}
          onClick={() => setActiveTab(id)}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
            activeTab === id
              ? 'bg-artic-surface border border-artic-accent/40 text-artic-accent'
              : 'text-artic-muted hover:text-artic-text',
          )}
        >
          <Icon className="w-3.5 h-3.5 shrink-0" />
          {label}
        </button>
      ))}
    </div>
  )

  // ── Top strip (same for both tabs) ────────────────────────────────────────
  const TopStrip = (
    <div className="flex items-center gap-2 px-3 pt-2 pb-1.5 shrink-0 border-b border-artic-border/30">
      <div className="flex-1 min-w-0">
        <p className="text-[9px] text-artic-muted font-mono tracking-widest uppercase leading-none">
          A.R.T.I.C SkyPilot · Test Drone 01
        </p>
        <h2 className="text-sm font-bold text-artic-text leading-tight">Manual Control</h2>
      </div>
      <span className="badge bg-artic-accent/10 border border-artic-accent/30 text-artic-accent font-mono text-[9px] tracking-widest uppercase">
        SIMULATION
      </span>
      <span className="badge bg-artic-danger/10 border border-artic-danger/30 text-artic-danger font-mono text-[9px] tracking-widest uppercase">
        DISCONNECTED
      </span>
      {TabBar}
    </div>
  )

  // ══════════════════════════════════════════════════════════════════════
  // MANUAL CONTROL TAB — matches reference exactly, no scroll
  // Layout: left (quadcopter diagram + 2×2 motor grid) | right (safety panel)
  // ══════════════════════════════════════════════════════════════════════
  if (activeTab === 'manual') return (
    <div
      className="-m-6 flex flex-col bg-artic-bg overflow-hidden"
      style={{ height: PAGE_HEIGHT }}
    >
      {TopStrip}

      {/* Hardware warning — slim */}
      <div
        role="alert"
        className="mx-3 mt-1.5 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-artic-warning/10 border border-artic-warning/30 text-[10px] shrink-0"
      >
        <span className="text-artic-warning shrink-0">⚠</span>
        <p className="text-artic-warning/80">
          <span className="font-semibold text-artic-warning">PHYSICAL HARDWARE NOT CONNECTED — </span>
          Simulation controls only. Physical drone control is disabled.
        </p>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 min-h-0 gap-3 px-3 pt-2 pb-2">

        {/* LEFT: quadcopter diagram + motor cards + all-motors */}
        <div className="flex-1 min-w-0 flex flex-col gap-2 overflow-hidden">

          {/* Quadcopter diagram — takes ~45% of height */}
          <div className="flex-[45] min-h-0 rounded-xl border border-artic-border bg-artic-surface flex flex-col items-center justify-center overflow-hidden">
            <QuadcopterDiagram motors={state.motors} />
          </div>

          {/* 2×2 motor card grid — takes ~40% */}
          <div className="flex-[40] min-h-0 grid grid-cols-2 gap-2">
            {MOTOR_IDS.map(id => (
              <CompactMotorCard
                key={id}
                motor={state.motors[id]}
                onCommandChange={(motorId, pwmUs) =>
                  dispatch({ type: 'SET_MOTOR_PWM', id: motorId, pwmUs })
                }
              />
            ))}
          </div>

          {/* All-motors control — takes ~15% */}
          <div className="flex-[15] min-h-0 rounded-xl border border-artic-border bg-artic-surface p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-artic-text">All Motors</h3>
              {!allSamePwm && (
                <span className="text-[10px] text-artic-warning font-mono">⚠ Motors differ</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-artic-muted w-20 shrink-0">
                {allMotorsStagingPwm} µs
              </span>
              <input
                type="range" min={MIN_PWM} max={MAX_PWM} step={1}
                value={allMotorsStagingPwm}
                onChange={e => setAllMotorsStagingPwm(Number(e.target.value))}
                className="flex-1 accent-cyan-400 cursor-pointer h-1"
                aria-label="All motors PWM staging value"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => dispatch({ type: 'SET_ALL_MOTORS_PWM', pwmUs: allMotorsStagingPwm })}
                className="flex-1 py-1 text-[10px] font-semibold rounded border border-artic-accent/40 text-artic-accent bg-artic-accent/10 hover:bg-artic-accent/20 transition-colors"
              >
                Apply to All
              </button>
              <button
                onClick={() => {
                  setAllMotorsStagingPwm(MIN_PWM)
                  dispatch({ type: 'SET_ALL_MOTORS_PWM', pwmUs: MIN_PWM })
                }}
                className="flex-1 py-1 text-[10px] font-semibold rounded border border-artic-border text-artic-muted hover:text-artic-text hover:bg-navy-800 transition-colors"
              >
                Reset to Min
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: safety panel — fixed width, full height, no inner scroll */}
        <div className="w-72 shrink-0 min-h-0 overflow-hidden">
          <SafetyPanel
            safety={state.safety}
            onStopAll={() => dispatch({ type: 'STOP_ALL' })}
          />
        </div>
      </div>

      {/* Bottom info strip */}
      <div className="shrink-0 flex items-center gap-2 px-4 py-1.5 border-t border-artic-border/30 bg-blue-950/20">
        <span className="w-3.5 h-3.5 rounded-full border border-blue-400/40 flex items-center justify-center shrink-0 text-[9px] text-blue-400 font-bold">i</span>
        <p className="text-[10px] text-artic-muted">
          Simulation controls only. Physical drone control is disabled until a compatible flight controller,
          communication protocol, and safety system are implemented and verified.
        </p>
      </div>
    </div>
  )

  // ══════════════════════════════════════════════════════════════════════
  // SIMULATION TAB — full-screen fit, no scroll
  // ══════════════════════════════════════════════════════════════════════
  return (
    <div
      className="-m-6 flex flex-col bg-artic-bg overflow-hidden"
      style={{ height: PAGE_HEIGHT }}
    >
      {TopStrip}

      {/* 3-column main area */}
      <div className="flex flex-1 min-h-0 gap-2 px-3 pt-1.5 pb-1.5">

        {/* COL 1+2: simulator + keyboard */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">

          {/* Simulator viewport ~56% */}
          <div className="flex-[56] min-h-0">
            <SimulatorViewport
              telemetry={telemetry}
              simState={simState}
              paused={simState === 'paused'}
              inputs={inputs}
              flightMode={flightMode}
              onSelectFlightMode={mode => dispatch({ type: 'SELECT_FLIGHT_MODE', mode })}
            />
          </div>

          {/* Keyboard + Current Input ~30% */}
          <div className="flex-[30] min-h-0 flex gap-2">
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <TranslucentKeyboard pressedKeys={pressedKeys} enabled={state.keyboard.enabled} />
              <p className="text-[9px] text-artic-muted/60 text-center font-mono">
                Press Esc to neutralize all inputs · Space to pause
              </p>
            </div>

            {/* Current Input card */}
            <div className="w-48 shrink-0 glass-panel p-3 flex flex-col gap-2">
              <p className="text-[10px] font-semibold text-artic-text uppercase tracking-widest shrink-0">
                Current Input
              </p>
              <div className="flex flex-wrap gap-1 min-h-[26px]">
                {displayKeys.slice(0, 6).map(k => (
                  <span key={k} className="px-1.5 py-0.5 rounded border text-[10px] font-mono font-bold bg-blue-600/40 border-blue-400/60 text-blue-100">
                    {k}
                  </span>
                ))}
                {displayKeys.length === 0 && (
                  <span className="text-[10px] text-artic-muted/50 italic">none</span>
                )}
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <AxisBar label="Pitch"    value={inputs.pitch}    bipolar color="bg-blue-500"   />
                <AxisBar label="Roll"     value={inputs.roll}     bipolar color="bg-green-500"  />
                <AxisBar label="Yaw"      value={inputs.yaw}      bipolar color="bg-purple-500" />
                <AxisBar label="Throttle" value={inputs.throttle} bipolar={false} color="bg-amber-500" />
              </div>
            </div>
          </div>

          {/* Quick-action cards ~14% */}
          <div className="flex-[14] min-h-0 grid grid-cols-4 gap-2">
            <div className="glass-panel p-2 flex flex-col gap-1">
              <div className="flex items-center gap-1"><Zap className="w-3 h-3 text-artic-accent" /><p className="text-[10px] font-semibold text-artic-text">Precision Mode</p></div>
              <p className="text-[9px] text-artic-muted">Reduced sensitivity</p>
              <div className="flex items-center gap-1.5 mt-auto">
                <ToggleSwitch checked={precisionMode} onChange={() => {}} disabled={!state.keyboard.enabled} />
                <span className="text-[9px] text-artic-muted">{precisionMode ? 'ON' : 'OFF'}</span>
              </div>
            </div>
            <div className="glass-panel p-2 flex flex-col gap-1">
              <div className="flex items-center gap-1"><Pause className="w-3 h-3 text-artic-warning" /><p className="text-[10px] font-semibold text-artic-text">Pause</p></div>
              <p className="text-[9px] text-artic-muted">Stop simulated movement</p>
              <div className="flex items-center gap-1.5 mt-auto">
                <ToggleSwitch checked={state.keyboard.paused} onChange={() => dispatch({ type: 'TOGGLE_PAUSE' })} />
                <span className="text-[9px] text-artic-muted">{state.keyboard.paused ? 'ON' : 'OFF'}</span>
              </div>
            </div>
            <div className="glass-panel p-2 flex flex-col gap-1">
              <div className="flex items-center gap-1"><RotateCcw className="w-3 h-3 text-artic-muted" /><p className="text-[10px] font-semibold text-artic-text">Reset Controls</p></div>
              <p className="text-[9px] text-artic-muted">Clear all inputs</p>
              <button
                onClick={() => { dispatch({ type: 'RESET_INTERFACE' }); setAllMotorsStagingPwm(MIN_PWM) }}
                className="mt-auto w-full py-0.5 rounded border text-[9px] font-semibold bg-navy-800/60 border-artic-border/60 text-artic-muted hover:text-artic-text hover:bg-navy-700 transition-colors"
              >Reset</button>
            </div>
            <div className="glass-panel p-2 flex flex-col gap-1">
              <div className="flex items-center gap-1"><HelpCircle className="w-3 h-3 text-artic-muted" /><p className="text-[10px] font-semibold text-artic-text">Help</p></div>
              <p className="text-[9px] text-artic-muted">Show shortcuts</p>
              <button
                onClick={() => setShowHelp(true)}
                className="mt-auto w-full py-0.5 rounded border text-[9px] font-semibold bg-navy-800/60 border-artic-border/60 text-artic-muted hover:text-artic-text hover:bg-navy-700 transition-colors"
              >?</button>
            </div>
          </div>
        </div>

        {/* COL 3: right panel */}
        <div className="w-60 shrink-0 flex flex-col gap-2 overflow-hidden">

          {/* Drone Status */}
          <div className="glass-panel p-3 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-artic-accent" />
                <p className="text-[11px] font-semibold text-artic-text uppercase tracking-wide">Drone Status</p>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-artic-success">
                <span className="w-1.5 h-1.5 rounded-full bg-artic-success" />
                Connected
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
              <span className="text-artic-muted">Vehicle</span>
              <span className="text-artic-text font-medium">Quadcopter</span>
              <span className="text-artic-muted">Flight Mode</span>
              <span className="text-artic-accent font-medium text-[9px]">
                {flightMode === 'stabilize' ? 'Stabilize' : flightMode === 'altitude-hold' ? 'Alt Hold' : 'Pos Hold'} (Sim)
              </span>
              <span className="flex items-center gap-1 text-artic-muted"><BatteryMedium className="w-3 h-3" />Battery</span>
              <span className={clsx('font-medium', telemetry.batteryPct > 60 ? 'text-artic-success' : telemetry.batteryPct > 25 ? 'text-artic-warning' : 'text-artic-danger')}>
                {telemetry.batteryPct.toFixed(0)}%
              </span>
              <span className="flex items-center gap-1 text-artic-muted"><MapPin className="w-3 h-3" />Altitude</span>
              <span className="text-artic-text font-medium">{telemetry.altitudeM.toFixed(1)} m</span>
              <span className="flex items-center gap-1 text-artic-muted"><Zap className="w-3 h-3" />Speed</span>
              <span className="text-artic-text font-medium">{telemetry.speedMs.toFixed(1)} m/s</span>
              <span className="flex items-center gap-1 text-artic-muted"><Wifi className="w-3 h-3" />GPS</span>
              <span className="text-artic-success font-medium">{Math.round((telemetry.signalPct / 100) * 16)} sats</span>
            </div>
          </div>

          {/* Keyboard Control */}
          <div className="glass-panel p-3 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold text-artic-text uppercase tracking-wide">Keyboard Control</p>
              <button
                role="switch" aria-checked={state.keyboard.enabled}
                onClick={() => dispatch({ type: 'TOGGLE_KEYBOARD', enabled: !state.keyboard.enabled })}
                className={clsx(
                  'flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all',
                  state.keyboard.enabled
                    ? 'bg-green-600/30 border-green-500/60 text-green-300'
                    : 'bg-navy-700 border-artic-border text-artic-muted',
                )}
              >
                {state.keyboard.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
            <div className="space-y-1.5 text-[10px]">
              <div className="flex items-center justify-between">
                <span className="text-artic-muted">Focus</span>
                <span className={clsx('flex items-center gap-1', state.keyboard.enabled ? 'text-artic-success' : 'text-artic-muted')}>
                  <span className={clsx('w-1.5 h-1.5 rounded-full', state.keyboard.enabled ? 'bg-artic-success' : 'bg-artic-muted')} />
                  {state.keyboard.enabled ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-artic-muted shrink-0">Pressed Keys</span>
                <div className="flex flex-wrap gap-0.5 justify-end">
                  {displayKeys.length > 0
                    ? displayKeys.slice(0, 4).map(k => (
                        <span key={k} className="px-1 py-0.5 rounded text-[9px] font-mono bg-blue-600/30 border border-blue-400/40 text-blue-200">{k}</span>
                      ))
                    : <span className="text-artic-muted/60">None</span>
                  }
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-artic-muted">Sensitivity</span>
                <span className="text-artic-text">{precisionMode ? 'Precision' : 'Normal'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-artic-muted">Mode</span>
                <span className="text-artic-text text-[9px]">
                  {flightMode === 'stabilize' ? 'Stabilize' : flightMode === 'altitude-hold' ? 'Altitude Hold' : 'Position Hold'} (sim)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-artic-muted flex items-center gap-1"><Pause className="w-3 h-3" />Pause</span>
                <span className={state.keyboard.paused ? 'text-artic-warning' : 'text-artic-muted'}>
                  {state.keyboard.paused ? 'On' : 'Off'}
                </span>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="glass-panel p-3 flex-1 min-h-0 flex flex-col overflow-hidden">
            <p className="text-[11px] font-semibold text-artic-text uppercase tracking-wide mb-2 shrink-0">
              Keyboard Shortcuts
            </p>
            <div className="space-y-0.5 overflow-hidden">
              {SHORTCUTS.map(({ keys, action }) => (
                <div key={keys} className="flex items-center gap-1.5">
                  <span className="font-mono text-[9px] bg-navy-800/80 border border-artic-border/60 rounded px-1.5 py-0.5 text-artic-accent min-w-[40px] text-center shrink-0">
                    {keys}
                  </span>
                  <span className="text-[9px] text-artic-muted truncate">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom safety strip */}
      <div className="shrink-0 flex items-center gap-2 px-4 py-1.5 border-t border-artic-border/30 bg-blue-950/20">
        <span className="w-3.5 h-3.5 rounded-full border border-blue-400/40 flex items-center justify-center shrink-0 text-[9px] text-blue-400 font-bold">i</span>
        <p className="text-[10px] text-artic-muted">
          Simulation controls only. Physical drone control is disabled until a compatible flight controller,
          communication protocol, and safety system are implemented and verified.
        </p>
      </div>

      {/* Help modal */}
      {showHelp && (
        <div
          role="dialog" aria-modal="true"
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
              >Close</button>
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
