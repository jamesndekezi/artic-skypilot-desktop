/**
 * KeyboardControlPanel
 *
 * Toggle panel for keyboard flight control with live input visualization
 * and collapsible keyboard shortcut reference.
 * Simulation-only — keyboard inputs do not command real hardware.
 */
import { useState } from 'react'
import type { KeyboardState, ControlInputs } from '@/types/manual-control'
import clsx from 'clsx'

interface Props {
  keyboard: KeyboardState
  inputs: ControlInputs
  /** Live pressed keys from the keyboard hook (not from keyboard.pressedKeys which is always empty in state) */
  pressedKeys: Set<string>
  /** Precision mode flag from the keyboard hook */
  precisionMode: boolean
  onToggle: (enabled: boolean) => void
  onReset: () => void
}

interface ShortcutRow {
  keys: string
  action: string
}

const SHORTCUTS: ShortcutRow[] = [
  { keys: 'W / S',         action: 'Pitch + / −' },
  { keys: 'A / D',         action: 'Roll − / +' },
  { keys: '↑ / ↓',        action: 'Throttle + / −' },
  { keys: '← / →',        action: 'Yaw − / +' },
  { keys: 'Shift',         action: 'Precision mode (0.4× rate)' },
  { keys: 'Space',         action: 'Neutralise roll / pitch / yaw' },
  { keys: 'Esc',           action: 'All inputs → zero' },
  { keys: '1 / 2 / 3',    action: 'Flight mode select' },
]

function InputBar({
  label,
  value,
  min,
  max,
}: {
  label: string
  value: number
  min: number
  max: number
}) {
  const range = max - min
  const isPolar = min < 0

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-artic-muted w-14 uppercase tracking-wide">
        {label}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-navy-800 overflow-hidden relative">
        {isPolar ? (
          <>
            <div className="absolute inset-y-0 left-1/2 w-px bg-artic-border" />
            {value !== 0 && (
              <div
                className="absolute inset-y-0 bg-artic-accent/70 rounded-sm transition-all duration-75"
                style={{
                  left:   `${value < 0 ? 50 + (value / max) * 50 : 50}%`,
                  width:  `${Math.abs(value) * 50}%`,
                }}
              />
            )}
          </>
        ) : (
          <div
            className="h-full bg-artic-accent/70 rounded-full transition-all duration-75"
            style={{ width: `${((value - min) / range) * 100}%` }}
          />
        )}
      </div>
      <span className="text-[10px] font-mono text-artic-text w-10 text-right">
        {value.toFixed(2)}
      </span>
    </div>
  )
}

export default function KeyboardControlPanel({
  keyboard,
  inputs,
  pressedKeys,
  precisionMode,
  onToggle,
  onReset,
}: Props) {
  const [showShortcuts, setShowShortcuts] = useState(false)

  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-artic-text">
          Keyboard Control
        </h3>
        <span className="text-[10px] text-artic-muted">sim only</span>
      </div>

      {/* Toggle */}
      <button
        onClick={() => onToggle(!keyboard.enabled)}
        className={clsx(
          'w-full py-2.5 rounded-lg border text-sm font-semibold transition-colors duration-150',
          keyboard.enabled
            ? 'bg-artic-success/10 border-artic-success/40 text-artic-success hover:bg-artic-success/20'
            : 'bg-navy-800 border-artic-border text-artic-muted hover:text-artic-text hover:bg-navy-700',
        )}
        aria-pressed={keyboard.enabled}
      >
        {keyboard.enabled ? '⌨ Keyboard Control ENABLED' : '⌨ Enable Keyboard Control'}
      </button>

      {/* Status row */}
      <div className="flex items-center gap-2 flex-wrap">
        {precisionMode && keyboard.enabled && (
          <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border text-artic-accent border-artic-accent/30 bg-artic-accent/10">
            PRECISION MODE
          </span>
        )}

        {pressedKeys.size > 0 && (
          <div className="flex flex-wrap gap-1">
            {Array.from(pressedKeys).map((key) => (
              <kbd
                key={key}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-artic-surface border border-artic-accent/40 text-artic-accent"
              >
                {key === ' ' ? 'Space' : key}
              </kbd>
            ))}
          </div>
        )}

        {keyboard.enabled && pressedKeys.size === 0 && (
          <span className="text-[10px] text-artic-muted font-mono">
            No keys pressed
          </span>
        )}
      </div>

      {/* Live input bars */}
      {keyboard.enabled && (
        <div className="space-y-1.5 p-3 rounded bg-navy-800 border border-artic-border">
          <p className="text-[10px] text-artic-muted uppercase tracking-wide mb-2">
            Live Inputs
          </p>
          <InputBar label="Throttle" value={inputs.throttle} min={0}  max={1} />
          <InputBar label="Roll"     value={inputs.roll}     min={-1} max={1} />
          <InputBar label="Pitch"    value={inputs.pitch}    min={-1} max={1} />
          <InputBar label="Yaw"      value={inputs.yaw}      min={-1} max={1} />
        </div>
      )}

      {/* Collapsible shortcut reference */}
      <div>
        <button
          onClick={() => setShowShortcuts((v) => !v)}
          className="text-[11px] text-artic-muted hover:text-artic-text transition-colors flex items-center gap-1"
          aria-expanded={showShortcuts}
        >
          <span>{showShortcuts ? '▾' : '▸'}</span>
          {showShortcuts ? 'Hide shortcuts' : 'Show shortcuts'}
        </button>

        {showShortcuts && (
          <table className="mt-2 w-full text-[10px] border-collapse">
            <thead>
              <tr>
                <th className="text-left font-mono text-artic-muted pb-1 pr-3">
                  Key(s)
                </th>
                <th className="text-left font-mono text-artic-muted pb-1">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {SHORTCUTS.map(({ keys, action }) => (
                <tr key={keys} className="border-t border-artic-border/30">
                  <td className="py-1 pr-3">
                    <kbd className="font-mono text-artic-accent bg-navy-800 px-1 rounded border border-artic-border">
                      {keys}
                    </kbd>
                  </td>
                  <td className="py-1 text-artic-muted">{action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Reset button */}
      <button
        onClick={onReset}
        className="w-full py-2 rounded border border-artic-border text-xs text-artic-muted hover:text-artic-text hover:bg-navy-800 transition-colors"
      >
        Reset Controls
      </button>
    </div>
  )
}
