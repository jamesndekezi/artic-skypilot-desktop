/**
 * ManualControlPage
 *
 * Manual flight control interface for the A.R.T.I.C SkyPilot GCS.
 * All motor commands and flight inputs are simulation-only.
 * Physical hardware control is not implemented at this stage.
 */
import { useReducer, useEffect, useRef, useState } from 'react'
import type {
  ManualControlState,
  MotorId,
  FlightMode,
} from '@/types/manual-control'
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

import QuadcopterDiagram from '@/components/manual-control/QuadcopterDiagram'
import MotorCard from '@/components/manual-control/MotorCard'
import ControlInputPanel from '@/components/manual-control/ControlInputPanel'
import SafetyPanel from '@/components/manual-control/SafetyPanel'
import FlightModeSelector from '@/components/manual-control/FlightModeSelector'
import KeyboardControlPanel from '@/components/manual-control/KeyboardControlPanel'

// ── Reducer ───────────────────────────────────────────────────────────────────

type ManualControlAction =
  | { type: 'SET_MOTOR_PWM'; id: MotorId; pwmUs: number }
  | { type: 'SET_ALL_MOTORS_PWM'; pwmUs: number }
  | { type: 'STOP_ALL' }
  | { type: 'SET_CONTROL_INPUT'; axis: 'throttle' | 'roll' | 'pitch' | 'yaw'; value: number }
  | { type: 'APPLY_KEYBOARD_INPUTS'; pressedKeys: Set<string>; precisionMode: boolean; deltaMs: number }
  | { type: 'SELECT_FLIGHT_MODE'; mode: FlightMode }
  | { type: 'TOGGLE_KEYBOARD'; enabled: boolean }
  | { type: 'RESET_INTERFACE' }

function reducer(
  state: ManualControlState,
  action: ManualControlAction,
): ManualControlState {
  switch (action.type) {
    case 'SET_MOTOR_PWM': {
      try {
        return setMotorPwm(state, action.id, action.pwmUs)
      } catch {
        return state
      }
    }
    case 'SET_ALL_MOTORS_PWM': {
      try {
        return setAllMotorsPwm(state, action.pwmUs)
      } catch {
        return state
      }
    }
    case 'STOP_ALL':
      return stopAll(state)
    case 'SET_CONTROL_INPUT':
      return setControlInput(state, action.axis, action.value)
    case 'APPLY_KEYBOARD_INPUTS':
      return applyKeyboardInputs(state, action.pressedKeys, action.precisionMode, action.deltaMs)
    case 'SELECT_FLIGHT_MODE':
      return selectFlightMode(state, action.mode)
    case 'TOGGLE_KEYBOARD':
      return {
        ...state,
        keyboard: { ...state.keyboard, enabled: action.enabled },
      }
    case 'RESET_INTERFACE':
      return resetInterface(state)
    default:
      return state
  }
}

// ── Constants ─────────────────────────────────────────────────────────────────

const MOTOR_IDS: MotorId[] = ['M1', 'M2', 'M3', 'M4']

// ── Component ─────────────────────────────────────────────────────────────────

export default function ManualControlPage() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)

  // Live keyboard state from the hook — NOT stored in reducer state
  const { pressedKeys, precisionMode } = useKeyboardControl(state.keyboard.enabled)

  // Stable refs so the keyboard tick interval never needs to restart for key events
  const pressedKeysRef = useRef(pressedKeys)
  const precisionModeRef = useRef(precisionMode)
  useEffect(() => { pressedKeysRef.current = pressedKeys }, [pressedKeys])
  useEffect(() => { precisionModeRef.current = precisionMode }, [precisionMode])

  // All-motors staging slider (local UI state)
  const [allMotorsStagingPwm, setAllMotorsStagingPwm] = useState(MIN_PWM)

  // Keyboard tick at 100 ms — only restarts when keyboard enabled state changes
  useEffect(() => {
    if (!state.keyboard.enabled) return
    const interval = setInterval(() => {
      dispatch({
        type: 'APPLY_KEYBOARD_INPUTS',
        pressedKeys: pressedKeysRef.current,
        precisionMode: precisionModeRef.current,
        deltaMs: 100,
      })
    }, 100)
    return () => clearInterval(interval)
  }, [state.keyboard.enabled])

  // Flight mode keys 1/2/3 — registered regardless of keyboard control toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target) {
        const tag = target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) {
          return
        }
      }
      if (e.key === '1') dispatch({ type: 'SELECT_FLIGHT_MODE', mode: 'stabilize' })
      if (e.key === '2') dispatch({ type: 'SELECT_FLIGHT_MODE', mode: 'altitude-hold' })
      if (e.key === '3') dispatch({ type: 'SELECT_FLIGHT_MODE', mode: 'position-hold' })
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Derived: do all motors have the same commanded value?
  const motorValues = MOTOR_IDS.map((id) => state.motors[id].commandedPwmUs)
  const allSamePwm = motorValues.every((v) => v === motorValues[0])

  return (
    <div className="space-y-6 max-w-7xl">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div>
          <p className="text-[10px] text-artic-muted font-mono tracking-widest uppercase">
            A.R.T.I.C SkyPilot · Test Drone 01
          </p>
          <h2 className="text-xl font-bold text-artic-text">Manual Control</h2>
        </div>

        <span className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-1 rounded border text-artic-accent border-artic-accent/30 bg-artic-accent/10">
          SIMULATION
        </span>

        <span className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-1 rounded border text-artic-danger border-artic-danger/30 bg-artic-danger/10">
          DISCONNECTED
        </span>
      </div>

      {/* ── Hardware banner ─────────────────────────────────────────────── */}
      <div
        role="alert"
        className="flex items-center gap-3 px-4 py-3 rounded-lg bg-artic-warning/10 border border-artic-warning/30"
      >
        <span className="text-artic-warning text-lg">⚠</span>
        <div>
          <p className="text-sm font-semibold text-artic-warning">
            PHYSICAL HARDWARE NOT CONNECTED
          </p>
          <p className="text-[11px] text-artic-warning/70 mt-0.5">
            All motor commands and flight inputs are simulation-only. No ESC
            signals, PWM pulses, or network commands are sent to any hardware.
          </p>
        </div>
      </div>

      {/* ── Main grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left column ──────────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Quadcopter diagram */}
          <QuadcopterDiagram motors={state.motors} />

          {/* Motor cards */}
          <div className="grid grid-cols-2 gap-3">
            {MOTOR_IDS.map((id) => (
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
              <h3 className="text-sm font-semibold text-artic-text">
                All Motors
              </h3>
              {!allSamePwm && (
                <span className="text-[10px] text-artic-warning font-mono">
                  ⚠ Motors differ
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-artic-muted w-16">
                {allMotorsStagingPwm} µs
              </span>
              <input
                type="range"
                min={MIN_PWM}
                max={MAX_PWM}
                step={1}
                value={allMotorsStagingPwm}
                onChange={(e) => setAllMotorsStagingPwm(Number(e.target.value))}
                className="flex-1 accent-cyan-400 cursor-pointer"
                aria-label="All motors PWM staging value"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  dispatch({ type: 'SET_ALL_MOTORS_PWM', pwmUs: allMotorsStagingPwm })
                }
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
              Staging value: {allMotorsStagingPwm} µs — click Apply to send to all
              motors
            </p>
          </div>
        </div>

        {/* ── Right column ─────────────────────────────────────────────── */}
        <div className="space-y-4">
          <ControlInputPanel
            inputs={state.inputs}
            keyboard={state.keyboard}
            pressedKeys={pressedKeys}
            precisionMode={precisionMode}
            onInputChange={(axis, value) =>
              dispatch({ type: 'SET_CONTROL_INPUT', axis, value })
            }
          />

          <FlightModeSelector
            currentMode={state.flightMode}
            onModeChange={(mode) =>
              dispatch({ type: 'SELECT_FLIGHT_MODE', mode })
            }
          />

          <KeyboardControlPanel
            keyboard={state.keyboard}
            inputs={state.inputs}
            pressedKeys={pressedKeys}
            precisionMode={precisionMode}
            onToggle={(enabled) =>
              dispatch({ type: 'TOGGLE_KEYBOARD', enabled })
            }
            onReset={() => {
              dispatch({ type: 'RESET_INTERFACE' })
              // Also reset local staging slider — not covered by the reducer
              setAllMotorsStagingPwm(MIN_PWM)
            }}
          />
        </div>
      </div>

      {/* ── Safety panel ─────────────────────────────────────────────────── */}
      <SafetyPanel
        safety={state.safety}
        onStopAll={() => dispatch({ type: 'STOP_ALL' })}
      />
    </div>
  )
}
