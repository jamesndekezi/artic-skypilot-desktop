/**
 * QuadcopterDiagram
 *
 * Top-down SVG diagram — fills its container using viewBox + width/height 100%.
 * Motor circles show ID, position label, and commanded PWM value.
 * Simulation-only — does not command real hardware.
 */
import type { MotorId, MotorState } from '@/types/manual-control'
import { MIN_PWM } from '@/types/manual-control'

interface Props {
  motors: Record<MotorId, MotorState>
}

const MOTOR_POSITIONS = [
  { id: 'M1' as MotorId, cx: 55,  cy: 55,  posLabel: 'Front-Left'  },
  { id: 'M2' as MotorId, cx: 185, cy: 55,  posLabel: 'Front-Right' },
  { id: 'M3' as MotorId, cx: 185, cy: 185, posLabel: 'Rear-Right'  },
  { id: 'M4' as MotorId, cx: 55,  cy: 185, posLabel: 'Rear-Left'   },
]

const CX = 120
const CY = 120

export default function QuadcopterDiagram({ motors }: Props) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center py-1">
      <p className="text-[10px] text-artic-muted uppercase tracking-widest mb-1 shrink-0">
        Vehicle — Top View
      </p>

      {/* SVG fills available space */}
      <svg
        viewBox="0 0 240 240"
        className="w-full h-full"
        style={{ maxHeight: '100%', maxWidth: '100%' }}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Top-down quadcopter diagram showing four motor positions"
      >
        {/* Arms */}
        {MOTOR_POSITIONS.map(({ id, cx, cy }) => (
          <line key={`arm-${id}`} x1={CX} y1={CY} x2={cx} y2={cy}
            stroke="#152a54" strokeWidth={4} strokeLinecap="round" />
        ))}

        {/* Central body */}
        <circle cx={CX} cy={CY} r={22} fill="#0f2040" stroke="#152a54" strokeWidth={2} />
        <text x={CX} y={CY - 4} textAnchor="middle" dominantBaseline="middle"
          fontSize="7" fontFamily="monospace" fill="#22d3ee" letterSpacing="1">
          ARTIC
        </text>
        <text x={CX} y={CY + 6} textAnchor="middle" dominantBaseline="middle"
          fontSize="6" fontFamily="monospace" fill="#64748b">
          SIM
        </text>

        {/* Front arrow */}
        <polygon
          points={`${CX},${CY-28} ${CX-5},${CY-22} ${CX+5},${CY-22}`}
          fill="#22d3ee" opacity="0.7"
        />

        {/* Motor circles */}
        {MOTOR_POSITIONS.map(({ id, cx, cy, posLabel }) => {
          const motor = motors[id]
          const active = motor.simActive && motor.commandedPwmUs > MIN_PWM
          const stroke = active ? '#22d3ee' : '#152a54'
          const textFill = active ? '#22d3ee' : '#64748b'
          const dimFill  = active ? '#22d3ee' : '#475569'

          return (
            <g key={id}>
              {/* Outer position label */}
              <text
                x={cx}
                y={cy > CY ? cy + 28 : cy - 28}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="7"
                fontFamily="sans-serif"
                fill="#475569"
              >
                {posLabel}
              </text>

              {/* Motor circle */}
              <circle cx={cx} cy={cy} r={18}
                fill="#0a1628" stroke={stroke}
                strokeWidth={active ? 2.5 : 1.5}
              />

              {/* Motor ID */}
              <text x={cx} y={cy - 3} textAnchor="middle" dominantBaseline="middle"
                fontSize="9" fontWeight="bold" fontFamily="monospace" fill={textFill}>
                {id}
              </text>

              {/* PWM value */}
              <text x={cx} y={cy + 7} textAnchor="middle" dominantBaseline="middle"
                fontSize="7" fontFamily="monospace" fill={dimFill}>
                {motor.commandedPwmUs}µs
              </text>
            </g>
          )
        })}
      </svg>

      <p className="text-[10px] text-artic-muted font-mono shrink-0 mt-1">▲ Front</p>
    </div>
  )
}
