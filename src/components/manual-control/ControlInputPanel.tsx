/**
 * ControlInputPanel
 *
 * Displays flight control inputs (throttle, roll, pitch, yaw) with sliders
 * and visual fill bars. Shows keyboard state when keyboard control is active.
 * Simulation-only — not connected to a flight controller or hardware.
 */
import type { ControlInputs, KeyboardState } from '@/types/manual-control'
import clsx from 'clsx'

interface Props {
  inputs: ControlInputs
  keyboard: KeyboardState
  pressedKeys: Set<string>
  precisionMode: boolean
  onInputChange: (axis: 'throttle' | 'roll' | 'pitch' | 'yaw', value: number) => void
}

interface AxisConfig {
  key: 'throttle' | 'roll' | 'pitch' | 'yaw'
  label: string
  min: number
  max: number
  step: number
}

const AXES: AxisConfig[] = [
  { key: 'throttle', label: 'Throttle', min: 0,  max: 1, step: 0.01 },
  { key: 'roll',     label: 'Roll',     min: -1, max: 1, step: 0.01 },
  { key: 'pitch',    label: 'Pitch',    min: -1, max: 1, step: 0.01 },
  { key: 'yaw',      label: 'Yaw',      min: -1, max: 1, step: 0.01 },
]

function AxisBar({
  value,
  min,
  max,
  active,
}: {
  value: number
  min: number
  max: number
  active: boolean
}) {
  const range = max - min

  if (min === 0) {
    // Unipolar bar (throttle)
    const pct = ((value - min) / range) * 100
    return (
      <div className="h-1.5 rounded-full bg-navy-800 overflow-hidden flex-1">
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-75',
            active ? 'bg-artic-accent' : 'bg-artic-muted/50',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    )
  }

  // Bipolar bar (roll/pitch/yaw) — center at 50%
  const center = 50
  const offset = (value / max) * 50
  const left  = offset < 0 ? center + offset : center
  const width = Math.abs(offset)

  return (
    <div className="h-1.5 rounded-full bg-navy-800 overflow-hidden flex-1 relative">
      {/* Center mark */}
      <div className="absolute inset-y-0 left-1/2 w-px bg-artic-border" />
      {width > 0 && (
        <div
          className={clsx(
            'absolute inset-y-0 rounded-sm transition-all duration-75',
            active ? 'bg-artic-accent' : 'bg-artic-muted/50',
          )}
          style={{ left: `${left}%`, width: `${width}%` }}
        />
      )}
    </div>
  )
}

export default function ControlInputPanel({
  inputs,
  keyboard,
  pressedKeys,
  precisionMode,
  onInputChange,
}: Props) {
  const isKeyboardActive = keyboard.enabled

  return (
    <div className="card space-y-4 p-4">
      <div>
        <h3 className="text-sm font-semibold text-artic-text">
          Flight Control Inputs
        </h3>
        <p className="text-[10px] text-artic-muted mt-0.5">
          Sim inputs — not connected to hardware
        </p>
      </div>

      {/* Axes */}
      <div className="space-y-3">
        {AXES.map(({ key, label, min, max, step }) => {
          const value = inputs[key]
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-artic-muted uppercase tracking-wide">
                  {label}
                </span>
                <span className="text-xs font-mono text-artic-text w-12 text-right">
                  {value.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <AxisBar
                  value={value}
                  min={min}
                  max={max}
                  active={isKeyboardActive}
                />
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={value}
                  onChange={(e) => onInputChange(key, Number(e.target.value))}
                  className="w-24 accent-cyan-400 cursor-pointer"
                  aria-label={`${label} control input`}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Keyboard status strip */}
      <div className="pt-2 border-t border-artic-border space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={clsx(
              'text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border',
              keyboard.enabled
                ? 'text-artic-success border-artic-success/30 bg-artic-success/10'
                : 'text-artic-muted border-artic-border',
            )}
          >
            KEYBOARD: {keyboard.enabled ? 'ACTIVE' : 'OFF'}
          </span>

          {precisionMode && (
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border text-artic-accent border-artic-accent/30 bg-artic-accent/10">
              PRECISION
            </span>
          )}
        </div>

        {/* Pressed key badges */}
        {pressedKeys.size > 0 && (
          <div className="flex flex-wrap gap-1">
            {Array.from(pressedKeys).map((key) => (
              <kbd
                key={key}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-artic-surface border border-artic-border text-artic-text"
              >
                {key === ' ' ? 'Space' : key}
              </kbd>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
