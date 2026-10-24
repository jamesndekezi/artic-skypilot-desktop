/**
 * A.R.T.I.C SkyPilot — Manual Control type definitions
 *
 * ALL motor commands and control inputs here are simulation-only.
 * No hardware commands, ESC signals, or real drone connections are made.
 */

export type OperatingMode = 'simulation' | 'physical'
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error'
export type MotorId = 'M1' | 'M2' | 'M3' | 'M4'
export type FlightMode = 'stabilize' | 'altitude-hold' | 'position-hold'

export interface MotorCommand {
  id: MotorId
  pwmUs: number
}

export interface MotorState {
  id: MotorId
  position: string
  commandedPwmUs: number
  simActive: boolean
}

export interface ControlInputs {
  throttle: number
  roll: number
  pitch: number
  yaw: number
}

export interface SafetyStatus {
  mode: OperatingMode
  connection: ConnectionState
  motorsArmed: boolean
  stopAllActive: boolean
  lastAction: string
  limitations: string[]
}

export interface KeyboardState {
  enabled: boolean
  /** Always an empty Set in reducer state — live key set lives in the hook ref */
  pressedKeys: Set<string>
  precisionMode: boolean
  paused: boolean
}

export interface ManualControlState {
  motors: Record<MotorId, MotorState>
  inputs: ControlInputs
  safety: SafetyStatus
  flightMode: FlightMode
  keyboard: KeyboardState
}

export const MIN_PWM = 1000
export const MAX_PWM = 1150
export const DEFAULT_PWM = 1000
