/**
 * SafetyPanel
 *
 * Compact safety status panel — fits inside a fixed container without scrolling.
 * STOP ALL resets simulation state only. No real hardware commands.
 */
import type { SafetyStatus } from '@/types/manual-control'
import clsx from 'clsx'

interface Props {
  safety: SafetyStatus
  onStopAll: () => void
}

export default function SafetyPanel({ safety, onStopAll }: Props) {
  const connColor =
    safety.connection === 'connected'  ? 'text-artic-success' :
    safety.connection === 'connecting' ? 'text-artic-warning' :
    safety.connection === 'error'      ? 'text-artic-danger'  : 'text-artic-muted'

  return (
    <div className="h-full flex flex-col gap-2 p-0">

      {/* Physical mode unavailable */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-artic-warning/10 border border-artic-warning/30 shrink-0">
        <span className="text-artic-warning text-xs shrink-0">⚠</span>
        <p className="text-[10px] text-artic-warning font-mono uppercase tracking-wide leading-tight">
          Physical Mode Unavailable —<br />Simulation Only
        </p>
      </div>

      {/* STOP ALL */}
      <button
        onClick={onStopAll}
        className="w-full py-3 rounded-lg font-bold text-base tracking-widest uppercase shrink-0
          bg-artic-danger/20 border-2 border-artic-danger text-artic-danger
          hover:bg-artic-danger/30 active:bg-artic-danger/40
          transition-colors focus:outline-none focus:ring-2 focus:ring-artic-danger/50"
        aria-label="Stop all motors — simulation only"
      >
        ⬛ STOP ALL
      </button>

      <p className="text-[9px] text-artic-muted text-center shrink-0">
        Resets all simulated motor commands to minimum (1000 µs).
        Does not command real hardware.
      </p>

      {/* Status grid */}
      <div className="grid grid-cols-2 gap-2 shrink-0">
        <StatusCell label="Operating Mode" value={safety.mode.toUpperCase()}
          valueClass={safety.mode === 'simulation' ? 'text-artic-accent' : 'text-artic-danger'} />
        <StatusCell label="Hardware Connection" value={safety.connection.toUpperCase()}
          valueClass={connColor} />
        <StatusCell label="Motors Armed"
          value={safety.motorsArmed ? 'YES' : 'NO'}
          valueClass={safety.motorsArmed ? 'text-artic-danger' : 'text-artic-muted'} />
        <StatusCell label="Stop All"
          value={safety.stopAllActive ? 'ACTIVE' : 'CLEAR'}
          valueClass={safety.stopAllActive ? 'text-artic-danger' : 'text-artic-muted'} />
      </div>

      {/* Last action */}
      <div className="pt-1 border-t border-artic-border shrink-0">
        <p className="text-[9px] text-artic-muted uppercase tracking-wide mb-0.5">Last Action</p>
        <p className="text-xs font-mono text-artic-text truncate">{safety.lastAction}</p>
      </div>

      {/* Active limitations */}
      {safety.limitations.length > 0 && (
        <div className="pt-1 border-t border-artic-border shrink-0">
          <p className="text-[9px] text-artic-muted uppercase tracking-wide mb-0.5">Active Limitations</p>
          <ul className="space-y-0.5">
            {safety.limitations.map(limit => (
              <li key={limit} className="text-[10px] text-artic-warning flex items-start gap-1">
                <span className="text-artic-warning/60 mt-0.5 shrink-0">•</span>
                {limit}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function StatusCell({ label, value, valueClass }: {
  label: string; value: string; valueClass: string
}) {
  return (
    <div className="bg-navy-800 rounded p-2 border border-artic-border">
      <p className="text-[9px] text-artic-muted uppercase tracking-wide mb-1">{label}</p>
      <span className={clsx('text-xs font-mono font-semibold', valueClass)}>{value}</span>
    </div>
  )
}
