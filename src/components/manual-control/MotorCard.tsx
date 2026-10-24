/**
 * MotorCard
 *
 * Individual motor control card showing commanded PWM and providing
 * slider, numeric input, and +/- increment controls.
 * Simulation-only — no ESC signal is sent.
 */
import { useState, useEffect } from 'react'
import type { MotorId, MotorState } from '@/types/manual-control'
import { MIN_PWM, MAX_PWM } from '@/types/manual-control'
import clsx from 'clsx'

interface Props {
  motor: MotorState
  onCommandChange: (id: MotorId, pwmUs: number) => void
}

export default function MotorCard({ motor, onCommandChange }: Props) {
  const [inputValue, setInputValue] = useState(String(motor.commandedPwmUs))
  const [inputError, setInputError] = useState(false)

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    setInputValue(String(val))
    setInputError(false)
    onCommandChange(motor.id, val)
  }

  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setInputValue(raw)
    const val = Number(raw)
    if (!isNaN(val) && val >= MIN_PWM && val <= MAX_PWM) {
      setInputError(false)
      onCommandChange(motor.id, val)
    } else {
      setInputError(true)
    }
  }

  const handleDecrement = () => {
    const next = Math.max(MIN_PWM, motor.commandedPwmUs - 5)
    setInputValue(String(next))
    setInputError(false)
    onCommandChange(motor.id, next)
  }

  const handleIncrement = () => {
    const next = Math.min(MAX_PWM, motor.commandedPwmUs + 5)
    setInputValue(String(next))
    setInputError(false)
    onCommandChange(motor.id, next)
  }

  // Sync numeric input display with slider when motor.commandedPwmUs changes externally
  useEffect(() => {
    if (!inputError) setInputValue(String(motor.commandedPwmUs))
  }, [motor.commandedPwmUs, inputError])

  const rangePercent =
    ((motor.commandedPwmUs - MIN_PWM) / (MAX_PWM - MIN_PWM)) * 100

  return (
    <div className="card space-y-3 p-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-artic-accent text-sm">
            {motor.id}
          </span>
          <span className="text-[10px] text-artic-muted bg-navy-800 px-2 py-0.5 rounded border border-artic-border">
            {motor.position}
          </span>
        </div>

        {/* Active indicator dot */}
        <div className="flex items-center gap-1.5">
          <div
            className={clsx(
              'w-2 h-2 rounded-full transition-colors duration-300',
              motor.simActive
                ? 'bg-artic-accent shadow-[0_0_6px_#22d3ee]'
                : 'bg-artic-muted/40',
            )}
            title={motor.simActive ? 'Sim active' : 'Stopped'}
          />
          <span className="text-[9px] text-artic-muted uppercase tracking-wide">
            {motor.simActive ? 'SIM' : 'STOP'}
          </span>
        </div>
      </div>

      {/* PWM display */}
      <div className="text-center">
        <span className="font-mono text-2xl font-bold text-artic-text">
          {motor.commandedPwmUs}
        </span>
        <span className="text-artic-muted text-sm ml-1">µs</span>
      </div>

      <p className="text-[10px] text-artic-muted text-center leading-tight">
        Commanded ESC pulse (µs) — simulation only
      </p>

      {/* Progress bar */}
      <div className="h-1 rounded-full bg-navy-800 overflow-hidden">
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-100',
            motor.simActive ? 'bg-artic-accent' : 'bg-artic-muted/40',
          )}
          style={{ width: `${rangePercent}%` }}
        />
      </div>

      {/* Slider */}
      <input
        type="range"
        min={MIN_PWM}
        max={MAX_PWM}
        step={1}
        value={motor.commandedPwmUs}
        onChange={handleSlider}
        className="w-full accent-cyan-400 cursor-pointer"
        aria-label={`${motor.id} PWM slider`}
      />

      {/* Range labels */}
      <div className="flex justify-between text-[9px] text-artic-muted font-mono -mt-1">
        <span>{MIN_PWM}</span>
        <span>{MAX_PWM}</span>
      </div>

      {/* Increment controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleDecrement}
          disabled={motor.commandedPwmUs <= MIN_PWM}
          className="flex-1 py-1 text-xs font-mono rounded border border-artic-border text-artic-muted hover:text-artic-text hover:bg-navy-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label={`Decrease ${motor.id} by 5`}
        >
          −5
        </button>

        <input
          type="number"
          min={MIN_PWM}
          max={MAX_PWM}
          value={inputValue}
          onChange={handleNumericInput}
          className={clsx(
            'w-20 text-center text-xs font-mono bg-navy-800 rounded border py-1 text-artic-text outline-none transition-colors',
            inputError
              ? 'border-artic-danger focus:border-artic-danger'
              : 'border-artic-border focus:border-artic-accent',
          )}
          aria-label={`${motor.id} PWM value`}
        />

        <button
          onClick={handleIncrement}
          disabled={motor.commandedPwmUs >= MAX_PWM}
          className="flex-1 py-1 text-xs font-mono rounded border border-artic-border text-artic-muted hover:text-artic-text hover:bg-navy-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label={`Increase ${motor.id} by 5`}
        >
          +5
        </button>
      </div>

      {inputError && (
        <p className="text-[10px] text-artic-danger text-center">
          Range: {MIN_PWM}–{MAX_PWM} µs
        </p>
      )}
    </div>
  )
}
