import { Info, Keyboard } from 'lucide-react'
import clsx from 'clsx'
import type { FlightMode } from '@/types/manual-control'

interface KeyboardStatusPanelProps {
  enabled: boolean
  pressedKeys: Set<string>
  precisionMode: boolean
  flightMode: FlightMode
  paused: boolean
}

const FLIGHT_MODE_LABELS: Record<FlightMode, string> = {
  'stabilize':     'Stabilize (simulation)',
  'altitude-hold': 'Altitude Hold (simulation)',
  'position-hold': 'Position Hold (simulation)',
}

function StatusRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-artic-border/40 last:border-0">
      <span className="text-xs text-artic-muted">{label}</span>
      <span className="text-xs text-artic-text font-medium">{children}</span>
    </div>
  )
}

function Dot({ color }: { color: 'green' | 'blue' | 'grey' }) {
  return (
    <span
      className={clsx('status-dot mr-1.5', {
        'bg-artic-success': color === 'green',
        'bg-blue-400':      color === 'blue',
        'bg-artic-muted':   color === 'grey',
      })}
      aria-hidden="true"
    />
  )
}

/**
 * KeyboardStatusPanel — right-column status card.
 * Shows enabled state, focus, pressed keys, sensitivity, and selected mode.
 * Contains the persistent safety notice (non-dismissable).
 */
export default function KeyboardStatusPanel({
  enabled,
  pressedKeys,
  precisionMode,
  flightMode,
  paused,
}: KeyboardStatusPanelProps) {
  const pressedList = Array.from(pressedKeys)
  const displayKeys = pressedList.map((k) => {
    if (k === ' ') return 'Space'
    if (k === 'ArrowUp') return '↑'
    if (k === 'ArrowDown') return '↓'
    if (k === 'ArrowLeft') return '←'
    if (k === 'ArrowRight') return '→'
    return k
  })

  return (
    <div className="glass-panel p-4 space-y-1">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Keyboard className="w-4 h-4 text-artic-accent" aria-hidden="true" />
        <p className="text-xs font-semibold text-artic-text uppercase tracking-widest">
          Keyboard Status
        </p>
      </div>

      <StatusRow label="Enabled">
        {enabled ? (
          <span><Dot color="green" />Yes</span>
        ) : (
          <span><Dot color="grey" />No</span>
        )}
      </StatusRow>

      <StatusRow label="Focus">
        {enabled ? (
          <span><Dot color="blue" />UI Active</span>
        ) : (
          <span><Dot color="grey" />Inactive</span>
        )}
      </StatusRow>

      <StatusRow label="Pressed Keys">
        {displayKeys.length > 0 ? (
          <span className="flex flex-wrap gap-1 justify-end">
            {displayKeys.map((k) => (
              <span
                key={k}
                className="inline-block px-1.5 py-0.5 rounded border text-[10px] font-mono bg-blue-600/30 border-blue-400/50 text-blue-300"
              >
                {k}
              </span>
            ))}
          </span>
        ) : (
          <span className="text-artic-muted">None</span>
        )}
      </StatusRow>

      <StatusRow label="Sensitivity">
        {precisionMode ? (
          <span className="text-artic-warning">Precision</span>
        ) : (
          'Normal'
        )}
      </StatusRow>

      <StatusRow label="Mode">
        <span className="text-right">{FLIGHT_MODE_LABELS[flightMode]}</span>
      </StatusRow>

      <StatusRow label="Status">
        {paused ? (
          <span className="text-artic-warning">Paused</span>
        ) : enabled ? (
          <span className="text-artic-success">Active</span>
        ) : (
          <span className="text-artic-muted">Disabled</span>
        )}
      </StatusRow>

      {/* Safety notice — non-dismissable */}
      <div className="mt-3 pt-3 border-t border-artic-border/40 flex items-start gap-2 bg-blue-900/20 border border-blue-800/30 rounded-lg p-3">
        <Info className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-[10px] text-blue-300/80 leading-relaxed">
          These controls are for the simulator only. Physical drone control is
          disabled until a real flight controller and safety system are
          configured.
        </p>
      </div>
    </div>
  )
}
