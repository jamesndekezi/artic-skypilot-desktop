import type { ControlInputs } from '@/types/manual-control'

interface ControlIndicatorsProps {
  inputs: ControlInputs
}

interface AxisBarProps {
  label: string
  value: number        // -1..+1 for pitch/roll/yaw, 0..1 for throttle
  bipolar: boolean     // true = centred at 0, false = left-anchored
  color: string        // Tailwind bg- class
}

function AxisBar({ label, value, bipolar, color }: AxisBarProps) {
  // For bipolar axes, convert -1..+1 to 0..100 from centre
  const pct = bipolar
    ? 50 + value * 50        // -1→0%, 0→50%, +1→100%
    : value * 100            // 0→0%, 1→100%

  // Bar width/position for bipolar vs unipolar
  const barStyle = bipolar
    ? value >= 0
      ? { left: '50%',        width: `${Math.abs(value) * 50}%` }
      : { left: `${50 + value * 50}%`, width: `${Math.abs(value) * 50}%` }
    : { left: '0%',           width: `${pct}%` }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-artic-muted w-14 shrink-0">{label}</span>
      {/* Track */}
      <div className="flex-1 h-2 bg-navy-800 rounded-full relative overflow-hidden">
        {/* Centre tick for bipolar */}
        {bipolar && (
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-artic-border/60" />
        )}
        {/* Fill bar */}
        <div
          className={`absolute top-0 bottom-0 rounded-full ${color} transition-all duration-100`}
          style={barStyle}
        />
      </div>
      {/* Numeric value */}
      <span className="text-xs font-mono text-artic-text w-10 text-right shrink-0">
        {value.toFixed(2)}
      </span>
    </div>
  )
}

/**
 * ControlIndicators — displays live Pitch, Roll, Yaw, Throttle bars.
 * Values come directly from ManualControlState.inputs — no invented data.
 * Simulation-only; not connected to physical hardware.
 */
export default function ControlIndicators({ inputs }: ControlIndicatorsProps) {
  return (
    <div className="glass-panel p-4 space-y-3">
      <p className="text-xs font-semibold text-artic-muted uppercase tracking-widest mb-1">
        Control Indicators
      </p>
      <AxisBar label="Pitch"    value={inputs.pitch}    bipolar color="bg-blue-500"   />
      <AxisBar label="Roll"     value={inputs.roll}     bipolar color="bg-green-500"  />
      <AxisBar label="Yaw"      value={inputs.yaw}      bipolar color="bg-purple-500" />
      <AxisBar label="Throttle" value={inputs.throttle} bipolar={false} color="bg-amber-500" />
      <p className="text-[10px] text-artic-muted pt-1">
        Sim inputs only — not connected to hardware
      </p>
    </div>
  )
}
