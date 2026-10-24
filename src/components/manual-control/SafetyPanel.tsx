/**
 * SafetyPanel
 *
 * Displays current safety status and provides the STOP ALL control.
 * All status values are read from props — no fake data is displayed.
 *
 * Important: STOP ALL resets simulation state only.
 * It does not represent a verified hardware emergency stop.
 */
import type { SafetyStatus } from '@/types/manual-control'
import clsx from 'clsx'

interface Props {
  safety: SafetyStatus
  onStopAll: () => void
}

export default function SafetyPanel({ safety, onStopAll }: Props) {
  return (
    <div className="card p-4 space-y-4 border-artic-danger/20">
      {/* Physical mode unavailable notice */}
      <div className="flex items-center gap-2 px-3 py-2 rounded bg-artic-warning/10 border border-artic-warning/30">
        <span className="text-artic-warning text-sm">⚠</span>
        <p className="text-[11px] text-artic-warning font-mono uppercase tracking-wide">
          PHYSICAL MODE UNAVAILABLE — simulation only
        </p>
      </div>

      {/* STOP ALL button */}
      <button
        onClick={onStopAll}
        className="w-full py-4 rounded-lg font-bold text-lg tracking-widest uppercase
          bg-artic-danger/20 border-2 border-artic-danger text-artic-danger
          hover:bg-artic-danger/30 active:bg-artic-danger/40
          transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-artic-danger/50"
        aria-label="Stop all motors — simulation only"
      >
        ⬛ STOP ALL
      </button>

      <p className="text-[10px] text-artic-muted text-center">
        Resets all simulated motor commands to minimum (1000 µs).
        Does not command real hardware.
      </p>

      {/* Status grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatusRow
          label="Operating Mode"
          value={safety.mode.toUpperCase()}
          valueClass={
            safety.mode === 'simulation'
              ? 'text-artic-accent'
              : 'text-artic-danger'
          }
        />

        <StatusRow
          label="Hardware Connection"
          value={safety.connection.toUpperCase()}
          valueClass="text-artic-danger"
          dot="danger"
        />

        <StatusRow
          label="Motors Armed"
          value={safety.motorsArmed ? 'YES' : 'NO'}
          valueClass={safety.motorsArmed ? 'text-artic-danger' : 'text-artic-muted'}
        />

        <StatusRow
          label="Stop All"
          value={safety.stopAllActive ? 'ACTIVE' : 'CLEAR'}
          valueClass={
            safety.stopAllActive ? 'text-artic-danger' : 'text-artic-muted'
          }
        />
      </div>

      {/* Last action */}
      <div className="pt-1 border-t border-artic-border">
        <p className="text-[10px] text-artic-muted uppercase tracking-wide mb-1">
          Last action
        </p>
        <p className="text-xs font-mono text-artic-text">{safety.lastAction}</p>
      </div>

      {/* Active limitations */}
      {safety.limitations.length > 0 && (
        <div className="pt-1 border-t border-artic-border">
          <p className="text-[10px] text-artic-muted uppercase tracking-wide mb-1">
            Active limitations
          </p>
          <ul className="space-y-0.5">
            {safety.limitations.map((limit) => (
              <li
                key={limit}
                className="text-[11px] text-artic-warning flex items-start gap-1.5"
              >
                <span className="text-artic-warning/60 mt-0.5">•</span>
                {limit}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ── Internal sub-component ────────────────────────────────────────────────────

interface StatusRowProps {
  label: string
  value: string
  valueClass: string
  dot?: 'danger' | 'success' | 'warning'
}

function StatusRow({ label, value, valueClass, dot }: StatusRowProps) {
  return (
    <div className="bg-navy-800 rounded p-2 border border-artic-border">
      <p className="text-[10px] text-artic-muted uppercase tracking-wide mb-1">
        {label}
      </p>
      <div className="flex items-center gap-1.5">
        {dot && (
          <span
            className={clsx(
              'w-1.5 h-1.5 rounded-full',
              dot === 'danger' && 'bg-artic-danger',
              dot === 'success' && 'bg-artic-success',
              dot === 'warning' && 'bg-artic-warning',
            )}
          />
        )}
        <span className={clsx('text-xs font-mono font-semibold', valueClass)}>
          {value}
        </span>
      </div>
    </div>
  )
}
