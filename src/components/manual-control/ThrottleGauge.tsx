/**
 * ThrottleGauge
 *
 * Vertical bar gauge for simulated throttle (0–1).
 * SIMULATION ONLY — no real motor or ESC commands are issued.
 */
import clsx from 'clsx'

interface ThrottleGaugeProps {
  throttle: number    // 0..1 (matches ControlInputs.throttle)
  className?: string
}

const TICK_PCTS = [0, 25, 50, 75, 100]

function fillColor(throttle: number): string {
  if (throttle < 0.25) return '#f59e0b'   // amber — artic-warning
  if (throttle < 0.75) return '#22d3ee'   // cyan  — artic-accent
  return '#10b981'                         // green — artic-success
}

export default function ThrottleGauge({ throttle, className }: ThrottleGaugeProps) {
  const barHeight = throttle * 130
  const yPos = 10 + (130 - barHeight)
  const pct = Math.round(throttle * 100)

  return (
    <div className={clsx('flex flex-col items-center gap-1', className)}>
      <p className="text-[10px] font-mono text-artic-muted uppercase tracking-widest text-center leading-tight">
        VIRTUAL THROTTLE
        <br />
        SIMULATION ONLY
      </p>
      <svg
        width="60"
        height="160"
        viewBox="0 0 60 160"
        role="img"
        aria-label={`Virtual throttle: ${pct}%`}
      >
        {/* Track */}
        <rect
          x="20"
          y="10"
          width="20"
          height="130"
          rx="3"
          fill="#0f2040"
          stroke="#152a54"
          strokeWidth="1"
        />

        {/* Fill bar — grows from bottom */}
        <rect
          x="21"
          y={yPos}
          width="18"
          height={barHeight}
          rx="2"
          fill={fillColor(throttle)}
        />

        {/* Tick marks and labels */}
        {TICK_PCTS.map((tickPct) => {
          const y = 140 - (tickPct / 100) * 130
          return (
            <g key={tickPct}>
              <line x1="40" y1={y} x2="46" y2={y} stroke="#64748b" strokeWidth="1" />
              <text x="48" y={y + 3} fontSize="7" fill="#64748b" fontFamily="monospace">
                {tickPct}%
              </text>
            </g>
          )
        })}

        {/* Percentage value below track */}
        <text
          x="30"
          y="155"
          textAnchor="middle"
          fontSize="9"
          fill="#e2e8f0"
          fontFamily="monospace"
          fontWeight="bold"
        >
          {pct}%
        </text>
      </svg>
    </div>
  )
}
