/**
 * ManualControl.test.ts
 *
 * Unit tests for the manual control pure logic.
 * No React rendering or DOM interaction — pure function tests.
 */
import { describe, it, expect } from 'vitest'
import type { ManualControlState } from '@/types/manual-control'
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

// ── createInitialState ────────────────────────────────────────────────────────

describe('createInitialState', () => {
  it('returns correct defaults: mode=simulation, connection=disconnected, flightMode=stabilize, all PWM=1000', () => {
    const s = createInitialState()
    expect(s.safety.mode).toBe('simulation')
    expect(s.safety.connection).toBe('disconnected')
    expect(s.flightMode).toBe('stabilize')
    expect(s.motors.M1.commandedPwmUs).toBe(1000)
    expect(s.motors.M2.commandedPwmUs).toBe(1000)
    expect(s.motors.M3.commandedPwmUs).toBe(1000)
    expect(s.motors.M4.commandedPwmUs).toBe(1000)
  })

  it('M1 is Front-Left', () => {
    expect(createInitialState().motors.M1.position).toBe('Front-Left')
  })

  it('M2 is Front-Right', () => {
    expect(createInitialState().motors.M2.position).toBe('Front-Right')
  })

  it('M3 is Rear-Right', () => {
    expect(createInitialState().motors.M3.position).toBe('Rear-Right')
  })

  it('M4 is Rear-Left', () => {
    expect(createInitialState().motors.M4.position).toBe('Rear-Left')
  })

  it('all motors have simActive=false', () => {
    const s = createInitialState()
    expect(s.motors.M1.simActive).toBe(false)
    expect(s.motors.M2.simActive).toBe(false)
    expect(s.motors.M3.simActive).toBe(false)
    expect(s.motors.M4.simActive).toBe(false)
  })

  it('keyboard is disabled initially', () => {
    expect(createInitialState().keyboard.enabled).toBe(false)
  })
})

// ── setMotorPwm ───────────────────────────────────────────────────────────────

describe('setMotorPwm', () => {
  it('updates the specified motor and leaves others unchanged', () => {
    const initial = createInitialState()
    const next = setMotorPwm(initial, 'M2', 1100)
    expect(next.motors.M2.commandedPwmUs).toBe(1100)
    expect(next.motors.M1.commandedPwmUs).toBe(1000)
    expect(next.motors.M3.commandedPwmUs).toBe(1000)
    expect(next.motors.M4.commandedPwmUs).toBe(1000)
  })

  it('rejects pwmUs < MIN_PWM (throws)', () => {
    const s = createInitialState()
    expect(() => setMotorPwm(s, 'M1', MIN_PWM - 1)).toThrow()
  })

  it('rejects pwmUs > MAX_PWM (throws)', () => {
    const s = createInitialState()
    expect(() => setMotorPwm(s, 'M1', MAX_PWM + 1)).toThrow()
  })

  it('sets simActive=true when pwmUs > MIN_PWM', () => {
    const s = setMotorPwm(createInitialState(), 'M1', 1050)
    expect(s.motors.M1.simActive).toBe(true)
  })

  it('sets simActive=false when pwmUs === MIN_PWM', () => {
    // First activate, then reset
    const activated = setMotorPwm(createInitialState(), 'M1', 1100)
    const reset = setMotorPwm(activated, 'M1', MIN_PWM)
    expect(reset.motors.M1.simActive).toBe(false)
  })
})

// ── setAllMotorsPwm ───────────────────────────────────────────────────────────

describe('setAllMotorsPwm', () => {
  it('updates all four motors', () => {
    const s = setAllMotorsPwm(createInitialState(), 1100)
    expect(s.motors.M1.commandedPwmUs).toBe(1100)
    expect(s.motors.M2.commandedPwmUs).toBe(1100)
    expect(s.motors.M3.commandedPwmUs).toBe(1100)
    expect(s.motors.M4.commandedPwmUs).toBe(1100)
  })

  it('throws when pwmUs is out of range', () => {
    expect(() => setAllMotorsPwm(createInitialState(), 999)).toThrow()
    expect(() => setAllMotorsPwm(createInitialState(), 1151)).toThrow()
  })
})

// ── stopAll ───────────────────────────────────────────────────────────────────

describe('stopAll', () => {
  it('resets all motors to MIN_PWM and sets stopAllActive=true', () => {
    const armed = setAllMotorsPwm(createInitialState(), 1100)
    const stopped = stopAll(armed)
    expect(stopped.motors.M1.commandedPwmUs).toBe(MIN_PWM)
    expect(stopped.motors.M2.commandedPwmUs).toBe(MIN_PWM)
    expect(stopped.motors.M3.commandedPwmUs).toBe(MIN_PWM)
    expect(stopped.motors.M4.commandedPwmUs).toBe(MIN_PWM)
    expect(stopped.safety.stopAllActive).toBe(true)
  })

  it('sets all motors simActive=false', () => {
    const armed = setAllMotorsPwm(createInitialState(), 1100)
    const stopped = stopAll(armed)
    expect(stopped.motors.M1.simActive).toBe(false)
    expect(stopped.motors.M2.simActive).toBe(false)
    expect(stopped.motors.M3.simActive).toBe(false)
    expect(stopped.motors.M4.simActive).toBe(false)
  })

  it('sets safety.lastAction to "STOP ALL activated"', () => {
    const stopped = stopAll(createInitialState())
    expect(stopped.safety.lastAction).toBe('STOP ALL activated')
  })

  it('stopAllActive clears after a subsequent setMotorPwm', () => {
    const stopped = stopAll(setAllMotorsPwm(createInitialState(), 1100))
    expect(stopped.safety.stopAllActive).toBe(true)
    const resumed = setMotorPwm(stopped, 'M1', 1050)
    expect(resumed.safety.stopAllActive).toBe(false)
  })

  it('stopAllActive clears after a subsequent setAllMotorsPwm', () => {
    const stopped = stopAll(setAllMotorsPwm(createInitialState(), 1100))
    expect(stopped.safety.stopAllActive).toBe(true)
    const resumed = setAllMotorsPwm(stopped, 1050)
    expect(resumed.safety.stopAllActive).toBe(false)
  })
})

// ── setControlInput ───────────────────────────────────────────────────────────

describe('setControlInput', () => {
  it('clamps throttle to 0..1', () => {
    const s = createInitialState()
    expect(setControlInput(s, 'throttle', -0.5).inputs.throttle).toBe(0)
    expect(setControlInput(s, 'throttle', 1.5).inputs.throttle).toBe(1)
    expect(setControlInput(s, 'throttle', 0.5).inputs.throttle).toBe(0.5)
  })

  it('clamps roll/pitch/yaw to -1..+1', () => {
    const s = createInitialState()
    expect(setControlInput(s, 'roll', -2).inputs.roll).toBe(-1)
    expect(setControlInput(s, 'roll', 2).inputs.roll).toBe(1)
    expect(setControlInput(s, 'pitch', -2).inputs.pitch).toBe(-1)
    expect(setControlInput(s, 'pitch', 2).inputs.pitch).toBe(1)
    expect(setControlInput(s, 'yaw', -2).inputs.yaw).toBe(-1)
    expect(setControlInput(s, 'yaw', 2).inputs.yaw).toBe(1)
  })
})

// ── applyKeyboardInputs ───────────────────────────────────────────────────────

describe('applyKeyboardInputs', () => {
  const dt = 1000 // 1 second
  const base = createInitialState()

  it('W pressed increases pitch', () => {
    const next = applyKeyboardInputs(base, new Set(['W']), false, dt)
    expect(next.inputs.pitch).toBeGreaterThan(0)
  })

  it('S pressed decreases pitch', () => {
    const midState: ManualControlState = {
      ...base,
      inputs: { ...base.inputs, pitch: 0.5 },
    }
    const next = applyKeyboardInputs(midState, new Set(['S']), false, dt)
    expect(next.inputs.pitch).toBeLessThan(0.5)
  })

  it('A pressed decreases roll', () => {
    const midState: ManualControlState = {
      ...base,
      inputs: { ...base.inputs, roll: 0.5 },
    }
    const next = applyKeyboardInputs(midState, new Set(['A']), false, dt)
    expect(next.inputs.roll).toBeLessThan(0.5)
  })

  it('D pressed increases roll', () => {
    const next = applyKeyboardInputs(base, new Set(['D']), false, dt)
    expect(next.inputs.roll).toBeGreaterThan(0)
  })

  it('ArrowUp increases throttle', () => {
    const next = applyKeyboardInputs(base, new Set(['ArrowUp']), false, dt)
    expect(next.inputs.throttle).toBeGreaterThan(0)
  })

  it('ArrowDown decreases throttle', () => {
    const midState: ManualControlState = {
      ...base,
      inputs: { ...base.inputs, throttle: 0.5 },
    }
    const next = applyKeyboardInputs(midState, new Set(['ArrowDown']), false, dt)
    expect(next.inputs.throttle).toBeLessThan(0.5)
  })

  it('A+D both pressed = zero roll change', () => {
    const midState: ManualControlState = {
      ...base,
      inputs: { ...base.inputs, roll: 0.5 },
    }
    const next = applyKeyboardInputs(midState, new Set(['A', 'D']), false, dt)
    expect(next.inputs.roll).toBe(0.5)
  })

  it('precision mode rate is 0.4x normal', () => {
    const normalNext = applyKeyboardInputs(base, new Set(['ArrowUp']), false, dt)
    const precisionNext = applyKeyboardInputs(base, new Set(['ArrowUp']), true, dt)
    const normalDelta = normalNext.inputs.throttle - base.inputs.throttle
    const precisionDelta = precisionNext.inputs.throttle - base.inputs.throttle
    expect(precisionDelta).toBeCloseTo(normalDelta * 0.4, 6)
  })

  it('Space clears roll/pitch/yaw to 0 (throttle unchanged)', () => {
    const midState: ManualControlState = {
      ...base,
      inputs: { throttle: 0.7, roll: 0.5, pitch: -0.3, yaw: 0.8 },
    }
    const next = applyKeyboardInputs(midState, new Set([' ']), false, dt)
    expect(next.inputs.roll).toBe(0)
    expect(next.inputs.pitch).toBe(0)
    expect(next.inputs.yaw).toBe(0)
    expect(next.inputs.throttle).toBe(0.7)
  })

  it('Escape clears all inputs to 0', () => {
    const midState: ManualControlState = {
      ...base,
      inputs: { throttle: 0.7, roll: 0.5, pitch: -0.3, yaw: 0.8 },
    }
    const next = applyKeyboardInputs(midState, new Set(['Escape']), false, dt)
    expect(next.inputs.throttle).toBe(0)
    expect(next.inputs.roll).toBe(0)
    expect(next.inputs.pitch).toBe(0)
    expect(next.inputs.yaw).toBe(0)
  })
})

// ── selectFlightMode ──────────────────────────────────────────────────────────

describe('selectFlightMode', () => {
  it('updates flightMode', () => {
    const s = selectFlightMode(createInitialState(), 'altitude-hold')
    expect(s.flightMode).toBe('altitude-hold')
  })

  it('updates safety.lastAction with flight mode string', () => {
    const s = selectFlightMode(createInitialState(), 'position-hold')
    expect(s.safety.lastAction).toContain('position-hold')
  })
})

// ── resetInterface ────────────────────────────────────────────────────────────

describe('resetInterface', () => {
  it('returns state equal to createInitialState output', () => {
    const modified = setAllMotorsPwm(createInitialState(), 1100)
    const reset = resetInterface(modified)
    const fresh = createInitialState()
    // Compare key properties (Sets aren't deep-equal, check separately)
    expect(reset.motors.M1.commandedPwmUs).toBe(fresh.motors.M1.commandedPwmUs)
    expect(reset.safety.mode).toBe(fresh.safety.mode)
    expect(reset.flightMode).toBe(fresh.flightMode)
    expect(reset.inputs).toEqual(fresh.inputs)
    expect(reset.keyboard.enabled).toBe(fresh.keyboard.enabled)
  })
})

// ── Physical mode invariant ───────────────────────────────────────────────────

describe('Physical mode invariant', () => {
  it('safety.mode stays simulation after all operations', () => {
    let s = createInitialState()
    s = setMotorPwm(s, 'M1', 1050)
    s = setAllMotorsPwm(s, 1100)
    s = stopAll(s)
    s = setControlInput(s, 'throttle', 0.5)
    s = selectFlightMode(s, 'altitude-hold')
    expect(s.safety.mode).toBe('simulation')
  })
})
