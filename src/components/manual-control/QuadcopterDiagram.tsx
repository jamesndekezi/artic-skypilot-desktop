/**
 * QuadcopterDiagram
 *
 * Top-down SVG diagram showing four motor positions.
 * Labels and status indicators are crisp SVG text.
 * Simulation-only — does not command real hardware.
 */
import type { MotorId, MotorState } from '@/types/manual-control'
import { MIN_PWM } from '@/types/manual-control'

interface Props {
  motors: Record<MotorId, MotorState>
}

interface MotorPosition {
  id: MotorId
  cx: number
  cy: number
  labelX: number
  labelY: number
  posLabelX: number
  posLabelY: number
}

const MOTOR_POSITIONS: MotorPosition[] = [
  { id: 'M1', cx: 55,  cy: 55,  labelX: 55,  labelY: 50,  posLabelX: 55,  posLabelY: 62 },
  { id: 'M2', cx: 185, cy: 55,  labelX: 185, labelY: 50,  posLabelX: 185, posLabelY: 62 },
  { id: 'M3', cx: 185, cy: 185, labelX: 185, labelY: 180, posLabelX: 185, posLabelY: 192 },
  { id: 'M4', cx: 55,  cy: 185, labelX: 55,  labelY: 180, posLabelX: 55,  posLabelY: 192 },
]

const CENTER_X = 120
const CENTER_Y = 120

export default function QuadcopterDiagram({ motors }: Props) {
  return (
    <div className="card flex flex-col items-center gap-2 py-4">
      <p className="text-xs text-artic-muted uppercase tracking-widest">
        Vehicle — Top View
      </p>

      <svg
        viewBox="0 0 240 240"
        width={240}
        height={240}
        role="img"
        aria-label="Top-down quadcopter diagram showing four motor positions and their commanded PWM values"
        className="overflow-visible"
      >
        {/* Arms */}
        {MOTOR_POSITIONS.map(({ id, cx, cy }) => (
          <line
            key={`arm-${id}`}
            x1={CENTER_X}
            y1={CENTER_Y}
            x2={cx}
            y2={cy}
            stroke="#152a54"
            strokeWidth={4}
            strokeLinecap="round"
          />
        ))}

        {/* Central body */}
        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r={22}
          fill="#0f2040"
          stroke="#152a54"
          strokeWidth={2}
        />
        {/* A.R.T.I.C mark */}
        <text
          x={CENTER_X}
          y={CENTER_Y - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="7"
          fontFamily="monospace"
          fill="#22d3ee"
          letterSpacing="1"
        >
          ARTIC
        </text>
        <text
          x={CENTER_X}
          y={CENTER_Y + 6}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="6"
          fontFamily="monospace"
          fill="#64748b"
        >
          SIM
        </text>

        {/* Front indicator */}
        <polygon
          points={`${CENTER_X},${CENTER_Y - 28} ${CENTER_X - 5},${CENTER_Y - 22} ${CENTER_X + 5},${CENTER_Y - 22}`}
          fill="#22d3ee"
          opacity="0.7"
        />

        {/* Motor circles */}
        {MOTOR_POSITIONS.map(({ id, cx, cy }) => {
          const motor = motors[id]
          const active = motor.simActive && motor.commandedPwmUs > MIN_PWM
          const strokeColor = active ? '#22d3ee' : '#152a54'
          const glowId = `glow-${id}`

          return (
            <g key={id}>
              {/* Glow filter for active motors */}
              {active && (
                <defs>
                  <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
              )}

              {/* Motor circle */}
              <circle
                cx={cx}
                cy={cy}
                r={18}
                fill="#0a1628"
                stroke={strokeColor}
                strokeWidth={active ? 2.5 : 1.5}
                filter={active ? `url(#${glowId})` : undefined}
              />

              {/* Motor ID label */}
              <text
                x={cx}
                y={cy - 3}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="9"
                fontWeight="bold"
                fontFamily="monospace"
                fill={active ? '#22d3ee' : '#64748b'}
              >
                {id}
              </text>

              {/* PWM value */}
              <text
                x={cx}
                y={cy + 7}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="7"
                fontFamily="monospace"
                fill={active ? '#22d3ee' : '#475569'}
              >
                {motor.commandedPwmUs}µs
              </text>

              {/* Position label below/above the motor circle */}
              <text
                x={cx}
                y={cy > CENTER_Y ? cy + 28 : cy - 26}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="7"
                fontFamily="sans-serif"
                fill="#475569"
              >
                {motor.position}
              </text>
            </g>
          )
        })}
      </svg>

      <p className="text-[10px] text-artic-muted font-mono">
        ▲ Front
      </p>
    </div>
  )
}
