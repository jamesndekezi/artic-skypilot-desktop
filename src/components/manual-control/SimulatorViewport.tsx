import { Suspense } from 'react'
import { BatteryMedium, BatteryFull, BatteryWarning, Signal } from 'lucide-react'
import clsx from 'clsx'
import type { AircraftTelemetry } from '@/types/simulation'
import FlightScene from '@/components/simulator/FlightScene'
import SceneErrorBoundary from '@/components/simulator/SceneErrorBoundary'

interface SimulatorViewportProps {
  telemetry: AircraftTelemetry
  simState: 'idle' | 'running' | 'paused'
}

// ── Mini battery icon ─────────────────────────────────────────────────────────
function BatteryIcon({ pct }: { pct: number }) {
  if (pct > 60) return <BatteryFull  className="w-3 h-3 text-artic-success" />
  if (pct > 25) return <BatteryMedium className="w-3 h-3 text-artic-warning" />
  return <BatteryWarning className="w-3 h-3 text-artic-danger" />
}

// ── Compass ruler (horizontal strip) ─────────────────────────────────────────
function CompassRuler({ headingDeg }: { headingDeg: number }) {
  // Cardinals spaced 90° apart; offset so current heading sits at centre
  const cardinals = ['W', 'N', 'N', 'E', 'S']
  // We show a 180° window centred on the heading
  const offset = ((headingDeg % 360) + 360) % 360

  return (
    <div className="flex-1 mx-4 relative overflow-hidden h-7 flex items-center" aria-label={`Compass heading ${headingDeg} degrees`}>
      {/* Track */}
      <div className="w-full h-px bg-artic-border/60 absolute" />
      {/* Cardinal labels — simple row, no scroll animation for now */}
      <div className="flex justify-around w-full text-[10px] font-mono text-artic-muted relative z-10">
        {cardinals.map((c, i) => (
          <span key={i} className={clsx(c === 'N' && i === 2 ? 'text-artic-accent font-bold' : '')}>{c}</span>
        ))}
      </div>
      {/* Tick mark at centre */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-0.5 h-2 bg-artic-accent" />
      {/* Heading badge */}
      <div
        className="absolute left-1/2 -translate-x-1/2 -bottom-5 text-[10px] font-mono bg-navy-900/80 border border-artic-border/60 px-1.5 py-0.5 rounded text-artic-accent whitespace-nowrap"
        aria-hidden="true"
      >
        {offset.toFixed(0)}°
      </div>
    </div>
  )
}

// ── Compass rose (mini SVG) ───────────────────────────────────────────────────
function CompassRose({ headingDeg }: { headingDeg: number }) {
  const angle = ((headingDeg % 360) + 360) % 360
  return (
    <div className="w-20 h-20 shrink-0" aria-label={`Compass rose, heading ${headingDeg} degrees`}>
      <svg viewBox="0 0 80 80" className="w-full h-full">
        {/* Background circle */}
        <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(21,42,84,0.8)" strokeWidth="1.5" />
        <circle cx="40" cy="40" r="36" fill="rgba(10,22,40,0.6)" />
        {/* Cardinal labels */}
        <text x="40" y="10" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">N</text>
        <text x="73" y="43" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">E</text>
        <text x="40" y="76" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">S</text>
        <text x="7"  y="43" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">W</text>
        {/* Arrow rotated to heading */}
        <g transform={`rotate(${angle}, 40, 40)`}>
          {/* North pointer — blue */}
          <polygon points="40,12 36,40 44,40" fill="#22d3ee" opacity="0.9" />
          {/* South pointer — dimmed */}
          <polygon points="40,68 36,40 44,40" fill="#152a54" />
        </g>
        {/* Centre dot */}
        <circle cx="40" cy="40" r="3" fill="#22d3ee" />
      </svg>
    </div>
  )
}

// ── GPS signal bars ───────────────────────────────────────────────────────────
function GpsBars({ signalPct }: { signalPct: number }) {
  const sats = Math.round((signalPct / 100) * 16) // rough sats estimate
  return (
    <span className="flex items-center gap-1 text-artic-success">
      <Signal className="w-3 h-3" />
      <span className="text-[11px] font-mono">{sats} sats</span>
    </span>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SimulatorViewport({ telemetry, simState }: SimulatorViewportProps) {
  return (
    <div className="glass-panel overflow-hidden" style={{ minHeight: 360 }}>
      {/* ── Top HUD bar ── */}
      <div className="flex items-start gap-2 p-3 bg-navy-950/60 border-b border-white/5">
        {/* Left: telemetry mini-cards */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-mono shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-artic-muted">Altitude</span>
            <span className="text-artic-text font-semibold">{telemetry.altitudeM.toFixed(1)} m</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-artic-muted">Speed</span>
            <span className="text-artic-text font-semibold">{telemetry.speedMs.toFixed(1)} m/s</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-artic-muted">Battery</span>
            <BatteryIcon pct={telemetry.batteryPct} />
            <span className={clsx(
              'font-semibold',
              telemetry.batteryPct > 60 ? 'text-artic-success' :
              telemetry.batteryPct > 25 ? 'text-artic-warning' : 'text-artic-danger'
            )}>
              {telemetry.batteryPct.toFixed(0)}%
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-artic-muted">GPS</span>
            <GpsBars signalPct={telemetry.signalPct} />
          </div>
        </div>

        {/* Centre: compass ruler */}
        <CompassRuler headingDeg={telemetry.headingDeg} />

        {/* Right: compass rose */}
        <CompassRose headingDeg={telemetry.headingDeg} />
      </div>

      {/* ── 3-D canvas ── */}
      <div className="relative" style={{ height: 260 }}>
        <SceneErrorBoundary>
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full text-artic-muted text-xs font-mono">
                Loading 3-D scene…
              </div>
            }
          >
            <FlightScene telemetry={telemetry} simState={simState} />
          </Suspense>
        </SceneErrorBoundary>

        {/* Heading badge overlay */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-navy-900/80 border border-artic-border/60 rounded px-3 py-1 text-[11px] font-mono text-artic-accent pointer-events-none">
          Heading: {((telemetry.headingDeg % 360 + 360) % 360).toFixed(0)}°
        </div>
      </div>
    </div>
  )
}
