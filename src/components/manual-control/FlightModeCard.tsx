import clsx from 'clsx'
import { Info } from 'lucide-react'
import type { FlightMode } from '@/types/manual-control'

interface FlightModeCardProps {
  flightMode: FlightMode
  onSelect: (mode: FlightMode) => void
}

const MODES: { id: FlightMode; label: string; key: string }[] = [
  { id: 'stabilize',      label: 'Stabilize',      key: '1' },
  { id: 'altitude-hold',  label: 'Altitude Hold',   key: '2' },
  { id: 'position-hold',  label: 'Position Hold',   key: '3' },
]

const MODE_LABELS: Record<FlightMode, string> = {
  'stabilize':     'Stabilize (simulation)',
  'altitude-hold': 'Altitude Hold (simulation)',
  'position-hold': 'Position Hold (simulation)',
}

/**
 * FlightModeCard — select a simulated flight mode.
 * These are simulation labels only; no real autopilot behaviour is implemented.
 * Keyboard shortcuts 1/2/3 are handled in ManualControlPage; this component
 * only handles mouse clicks.
 */
export default function FlightModeCard({ flightMode, onSelect }: FlightModeCardProps) {
  return (
    <div className="glass-panel p-4 space-y-3">
      <p className="text-xs font-semibold text-artic-muted uppercase tracking-widest">
        Flight Mode <span className="normal-case text-artic-muted/60">(Simulation)</span>
      </p>

      <div className="flex flex-wrap gap-2">
        {MODES.map(({ id, label, key }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            aria-pressed={flightMode === id}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              flightMode === id
                ? 'bg-green-600/20 border-green-500/50 text-green-400'
                : 'bg-navy-800/40 border-artic-border/60 text-artic-muted hover:text-artic-text hover:bg-navy-800',
            )}
          >
            <span className={clsx(
              'w-4 h-4 rounded text-[10px] flex items-center justify-center border font-mono',
              flightMode === id
                ? 'bg-green-600/40 border-green-500/60 text-green-300'
                : 'bg-navy-700 border-artic-border text-artic-muted',
            )}>
              {key}
            </span>
            {label}
          </button>
        ))}
      </div>

      <p className="text-xs text-artic-muted">
        Mode: <span className="text-artic-text">{MODE_LABELS[flightMode]}</span>
      </p>

      <div className="flex items-start gap-2 text-[10px] text-artic-muted/70">
        <Info className="w-3 h-3 mt-0.5 shrink-0 text-blue-400/60" aria-hidden="true" />
        <span>These are simulation labels only. No real autopilot behaviour is implemented.</span>
      </div>
    </div>
  )
}
