/**
 * A.R.T.I.C SkyPilot — Manual Control pure functions
 *
 * All functions here are pure: they take state and return new state.
 * No React imports, no side effects, no hardware interaction.
 * Physical motor commands are not implemented at this stage.
 */

import type {
  ManualControlState,
  MotorId,
  MotorState,
  FlightMode,
} from '@/types/manual-control'
import { MIN_PWM, MAX_PWM, DEFAULT_PWM } from '@/types/manual-control'

// ── Initial state ─────────────────────────────────────────────────────────────

export function createInitialState(): ManualControlState {
  return {
    motors: {
      M1: { id: 'M1', position: 'Front-Left',  commandedPwmUs: DEFAULT_PWM, simActive: false },
      M2: { id: 'M2', position: 'Front-Right', commandedPwmUs: DEFAULT_PWM, simActive: false },
      M3: { id: 'M3', position: 'Rear-Right',  commandedPwmUs: DEFAULT_PWM, simActive: false },
      M4: { id: 'M4', position: 'Rear-Left',   commandedPwmUs: DEFAULT_PWM, simActive: false },
    },
    inputs: { throttle: 0, roll: 0, pitch: 0, yaw: 0 },
    safety: {
      mode: 'simulation',
      connection: 'disconnected',
      motorsArmed: false,
      stopAllActive: false,
      lastAction: 'Interface initialised',
      limitations: ['Physical mode unavailable', 'No hardware connection'],
    },
    flightMode: 'stabilize',
    keyboard: {
      enabled: false,
      pressedKeys: new Set<string>(),
      precisionMode: false,
      paused: false,
    },
  }
}

// ── Motor commands ────────────────────────────────────────────────────────────

/**
 * Set a single motor's commanded PWM pulse (µs).
 * Throws RangeError if pwmUs is outside [MIN_PWM, MAX_PWM].
 * Simulation-only — no ESC signal is sent.
 */
export function setMotorPwm(
  state: ManualControlState,
  id: MotorId,
  pwmUs: number,
): ManualControlState {
  if (pwmUs < MIN_PWM || pwmUs > MAX_PWM) {
    throw new RangeError(
      `PWM value ${pwmUs} µs is out of range [${MIN_PWM}, ${MAX_PWM}]`,
    )
  }

  const updatedMotor: MotorState = {
    ...state.motors[id],
    commandedPwmUs: pwmUs,
    simActive: pwmUs > MIN_PWM,
  }

  return {
    ...state,
    motors: {
      ...state.motors,
      [id]: updatedMotor,
    },
    safety: {
      ...state.safety,
      stopAllActive: false,
      lastAction: `Motor ${id} set to ${pwmUs} µs`,
    },
  }
}

/**
 * Set all four motors to the same commanded PWM pulse (µs).
 * Throws RangeError if pwmUs is outside [MIN_PWM, MAX_PWM].
 */
export function setAllMotorsPwm(
  state: ManualControlState,
  pwmUs: number,
): ManualControlState {
  if (pwmUs < MIN_PWM || pwmUs > MAX_PWM) {
    throw new RangeError(
      `PWM value ${pwmUs} µs is out of range [${MIN_PWM}, ${MAX_PWM}]`,
    )
  }

  const motorIds: MotorId[] = ['M1', 'M2', 'M3', 'M4']
  const updatedMotors = { ...state.motors }

  for (const id of motorIds) {
    updatedMotors[id] = {
      ...state.motors[id],
      commandedPwmUs: pwmUs,
      simActive: pwmUs > MIN_PWM,
    }
  }

  return {
    ...state,
    motors: updatedMotors,
    safety: {
      ...state.safety,
      stopAllActive: false,
      lastAction: `All motors set to ${pwmUs} µs`,
    },
  }
}

/**
 * Stop all motors: reset all commanded PWM to MIN_PWM and mark simActive=false.
 * In simulation mode only — no real hardware stop is performed.
 */
export function stopAll(state: ManualControlState): ManualControlState {
  const motorIds: MotorId[] = ['M1', 'M2', 'M3', 'M4']
  const stoppedMotors = { ...state.motors }

  for (const id of motorIds) {
    stoppedMotors[id] = {
      ...state.motors[id],
      commandedPwmUs: MIN_PWM,
      simActive: false,
    }
  }

  return {
    ...state,
    motors: stoppedMotors,
    safety: {
      ...state.safety,
      stopAllActive: true,
      lastAction: 'STOP ALL activated',
    },
  }
}

// ── Control inputs ────────────────────────────────────────────────────────────

/**
 * Set a single control axis value, clamped to its valid range.
 * throttle: [0, 1]; roll/pitch/yaw: [-1, 1]
 * Simulation-only — not connected to a flight controller.
 */
export function setControlInput(
  state: ManualControlState,
  axis: 'throttle' | 'roll' | 'pitch' | 'yaw',
  value: number,
): ManualControlState {
  const clamped =
    axis === 'throttle'
      ? Math.min(1, Math.max(0, value))
      : Math.min(1, Math.max(-1, value))

  return {
    ...state,
    inputs: {
      ...state.inputs,
      [axis]: clamped,
    },
  }
}

/**
 * Apply keyboard input deltas to control inputs.
 * pressedKeys: live Set from the keyboard hook ref (not from state.keyboard.pressedKeys).
 * precisionMode: true when Shift is held.
 * deltaMs: milliseconds since last tick.
 *
 * Key bindings:
 *   W/S       → pitch +/-
 *   A/D       → roll -/+
 *   ArrowUp/Down  → throttle +/-
 *   ArrowLeft/Right → yaw -/+
 *   Space     → zero roll/pitch/yaw (throttle unchanged)
 *   Escape    → zero all inputs
 *
 * Opposing keys cancel each other.
 * Simulation-only — not connected to a flight controller.
 */
export function applyKeyboardInputs(
  state: ManualControlState,
  pressedKeys: Set<string>,
  precisionMode: boolean,
  deltaMs: number,
): ManualControlState {
  const dt = deltaMs / 1000

  const throttleRate = 0.3
  const dirRate = 2.0
  const precisionMultiplier = precisionMode ? 0.4 : 1.0

  const effectiveThrottleRate = throttleRate * precisionMultiplier
  const effectiveDirRate = dirRate * precisionMultiplier

  // Special keys: checked first, they override incremental motion
  if (pressedKeys.has('Escape')) {
    return {
      ...state,
      inputs: { throttle: 0, roll: 0, pitch: 0, yaw: 0 },
    }
  }

  if (pressedKeys.has(' ')) {
    return {
      ...state,
      inputs: {
        ...state.inputs,
        roll: 0,
        pitch: 0,
        yaw: 0,
      },
    }
  }

  // Opposing keys cancel
  const wPressed = pressedKeys.has('w') || pressedKeys.has('W')
  const sPressed = pressedKeys.has('s') || pressedKeys.has('S')
  const aPressed = pressedKeys.has('a') || pressedKeys.has('A')
  const dPressed = pressedKeys.has('d') || pressedKeys.has('D')
  const upPressed = pressedKeys.has('ArrowUp')
  const downPressed = pressedKeys.has('ArrowDown')
  const leftPressed = pressedKeys.has('ArrowLeft')
  const rightPressed = pressedKeys.has('ArrowRight')

  let pitchDelta = 0
  if (wPressed && !sPressed) pitchDelta = effectiveDirRate * dt
  if (sPressed && !wPressed) pitchDelta = -effectiveDirRate * dt

  let rollDelta = 0
  if (dPressed && !aPressed) rollDelta = effectiveDirRate * dt
  if (aPressed && !dPressed) rollDelta = -effectiveDirRate * dt

  let throttleDelta = 0
  if (upPressed && !downPressed) throttleDelta = effectiveThrottleRate * dt
  if (downPressed && !upPressed) throttleDelta = -effectiveThrottleRate * dt

  let yawDelta = 0
  if (rightPressed && !leftPressed) yawDelta = effectiveDirRate * dt
  if (leftPressed && !rightPressed) yawDelta = -effectiveDirRate * dt

  const newThrottle = Math.min(1, Math.max(0, state.inputs.throttle + throttleDelta))
  const newRoll     = Math.min(1, Math.max(-1, state.inputs.roll + rollDelta))
  const newPitch    = Math.min(1, Math.max(-1, state.inputs.pitch + pitchDelta))
  const newYaw      = Math.min(1, Math.max(-1, state.inputs.yaw + yawDelta))

  return {
    ...state,
    inputs: {
      throttle: newThrottle,
      roll: newRoll,
      pitch: newPitch,
      yaw: newYaw,
    },
  }
}

// ── Flight mode ───────────────────────────────────────────────────────────────

/**
 * Select a flight mode. Simulation-only — not connected to a flight controller.
 */
export function selectFlightMode(
  state: ManualControlState,
  mode: FlightMode,
): ManualControlState {
  return {
    ...state,
    flightMode: mode,
    safety: {
      ...state.safety,
      lastAction: `Flight mode: ${mode}`,
    },
  }
}

// ── Reset ─────────────────────────────────────────────────────────────────────

/**
 * Reset the entire interface to its initial state.
 */
export function resetInterface(_state: ManualControlState): ManualControlState {
  return createInitialState()
}
