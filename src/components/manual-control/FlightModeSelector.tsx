/**
 * FlightModeSelector
 *
 * Three flight mode buttons with keyboard shortcut badges.
 * Simulation-only — not connected to a flight controller.
 */
import type { FlightMode } from '@/types/manual-control'
import clsx from 'clsx'

interface Props {
  currentMode: FlightMode
  onModeChange: (mode: FlightMode) => void
}

interface ModeConfig {
  mode: FlightMode
  label: string
  shortcut: string
}

const MODES: ModeConfig[] = [
  { mode: 'stabilize',      label: 'Stabilize',     shortcut: '1' },
  { mode: 'altitude-hold',  label: 'Altitude Hold', shortcut: '2' },
  { mode: 'position-hold',  label: 'Position Hold', shortcut: '3' },
]

export default function FlightModeSelector({ currentMode, onModeChange }: Props) {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-artic-text">Flight Mode</h3>
        <span className="text-[10px] text-artic-muted font-mono">
          Keyboard: 1 / 2 / 3
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {MODES.map(({ mode, label, shortcut }) => {
          const isActive = currentMode === mode
          return (
            <button
              key={mode}
              onClick={() => onModeChange(mode)}
              className={clsx(
                'relative flex flex-col items-center gap-1 py-3 px-2 rounded-lg border text-xs font-medium transition-colors duration-150',
                isActive
                  ? 'bg-cyan-500/10 text-artic-accent border-cyan-500/20'
                  : 'text-artic-muted hover:text-artic-text hover:bg-navy-800 border-artic-border',
              )}
              aria-pressed={isActive}
              aria-label={`Select ${label} flight mode (key ${shortcut})`}
            >
              {/* Shortcut badge */}
              <kbd
                className={clsx(
                  'absolute top-1.5 right-1.5 text-[9px] font-mono px-1 rounded border',
                  isActive
                    ? 'text-artic-accent border-artic-accent/40 bg-cyan-500/10'
                    : 'text-artic-muted border-artic-border',
                )}
              >
                {shortcut}
              </kbd>

              <span className="font-semibold leading-tight text-center text-[11px] mt-1">
                {label}
              </span>
              <span
                className={clsx(
                  'text-[9px] font-mono',
                  isActive ? 'text-artic-accent/60' : 'text-artic-muted/60',
                )}
              >
                (simulation)
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
