/**
 * AttitudeIndicator
 *
 * Pure SVG artificial horizon / attitude indicator.
 * Displays simulated pitch and roll values — SIMULATION ONLY.
 * No real sensor data is read or displayed.
 */
import clsx from 'clsx'

interface AttitudeIndicatorProps {
  pitch: number     // -1..+1 (matches ControlInputs.pitch)
  roll: number      // -1..+1 (matches ControlInputs.roll)
  className?: string
}

// Bank angle tick marks at ±10°, ±20°, ±30° on the outer ring (r=72)
const BANK_ANGLES = [-30, -20, -10, 10, 20, 30]

function polarToCart(angleDeg: number, r: number, cx = 80, cy = 80) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

export default function AttitudeIndicator({ pitch, roll, className }: AttitudeIndicatorProps) {
  const pitchPx = -pitch * 30   // negative: nose-up moves horizon down in viewport
  const rollDeg = roll * 45

  // Decorative yaw arc: partial arc from ~200° to ~340° at r=68
  // Arc computed via SVG arc path
  const arcR = 68
  const arcStart = polarToCart(200, arcR)
  const arcEnd = polarToCart(340, arcR)
  const yawArcPath = `M ${arcStart.x.toFixed(2)} ${arcStart.y.toFixed(2)} A ${arcR} ${arcR} 0 1 1 ${arcEnd.x.toFixed(2)} ${arcEnd.y.toFixed(2)}`

  return (
    <div className={clsx('flex flex-col items-center gap-1', className)}>
      <p className="text-[10px] font-mono text-artic-muted uppercase tracking-widest">Attitude</p>
      <svg
        width="160"
        height="160"
        viewBox="0 0 160 160"
        role="img"
        aria-label={`Attitude indicator: pitch ${(pitch * 30).toFixed(0)}° roll ${(roll * 45).toFixed(0)}°`}
      >
        <defs>
          <clipPath id="ai-clip">
            <circle cx="80" cy="80" r="72" />
          </clipPath>
        </defs>

        {/* ── Sky + ground + horizon (rotating + translating with pitch/roll) ── */}
        <g
          transform={`translate(0, ${pitchPx}) rotate(${rollDeg}, 80, 80)`}
          clipPath="url(#ai-clip)"
        >
          {/* Sky */}
          <rect x="0" y="0" width="160" height="160" fill="#1e3a5f" />
          {/* Ground */}
          <rect x="0" y="80" width="160" height="80" fill="#5c3a1e" />
          {/* Horizon line */}
          <line x1="8" y1="80" x2="152" y2="80" stroke="#22d3ee" strokeWidth="2" />
        </g>

        {/* ── Decorative yaw arc (not data-driven, opacity 0.4) ── */}
        <path
          d={yawArcPath}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="1"
          opacity="0.4"
        />

        {/* ── Outer ring ── */}
        <circle cx="80" cy="80" r="72" fill="none" stroke="#152a54" strokeWidth="4" />

        {/* ── Bank angle tick marks at ±10/±20/±30° ── */}
        {BANK_ANGLES.map((angleDeg) => {
          const inner = polarToCart(angleDeg, 66)
          const outer = polarToCart(angleDeg, 72)
          return (
            <line
              key={angleDeg}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="#64748b"
              strokeWidth="1.5"
            />
          )
        })}

        {/* ── Fixed pitch reference lines (not inside the rotating group) ── */}
        <line x1="70" y1="60" x2="90" y2="60" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
        <line x1="70" y1="100" x2="90" y2="100" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />

        {/* ── Centre dot ── */}
        <circle cx="80" cy="80" r="3" fill="#22d3ee" />

        {/* ── SIMULATED label (always visible, outside clip) ── */}
        <text
          x="80"
          y="148"
          textAnchor="middle"
          fill="#64748b"
          fontSize="9"
          fontFamily="monospace"
          fontWeight="bold"
        >
          SIMULATED
        </text>
      </svg>
    </div>
  )
}
