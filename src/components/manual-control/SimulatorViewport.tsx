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

function BatteryIcon({ pct }: { pct: number }) {
  if (pct > 60) return <BatteryFull  className="w-3 h-3 text-artic-success" />
  if (pct > 25) return <BatteryMedium className="w-3 h-3 text-artic-warning" />
  return <BatteryWarning className="w-3 h-3 text-artic-danger" />
}

function batteryColor(pct: number) {
  if (pct > 60) return 'text-artic-success'
  if (pct > 25) return 'text-artic-warning'
  return 'text-artic-danger'
}

// ── Compass ruler ─────────────────────────────────────────────────────────────
function CompassRuler({ headingDeg }: { headingDeg: number }) {
  const heading = ((headingDeg % 360) + 360) % 360
  // Cardinals at 0°, 90°, 180°, 270° — render as a fixed strip
  const cardinals = [
    { label: 'W', deg: 270 },
    { label: 'N', deg: 0   },
    { label: 'N', deg: 360 },
    { label: 'E', deg: 90  },
    { label: 'S', deg: 180 },
  ]
  return (
    <div
      className="flex-1 mx-6 relative h-7"
      aria-label={`Compass, heading ${heading} degrees`}
    >
      {/* Track line */}
      <div className="absolute inset-x-0 top-1/2 h-px bg-artic-border/50" />
      {/* Tick marks at quarters */}
      {[0, 25, 50, 75, 100].map((pct) => (
        <div
          key={pct}
          className="absolute top-1/2 -translate-y-1/2 w-px h-2 bg-artic-border/60"
          style={{ left: `${pct}%` }}
        />
      ))}
      {/* Cardinal labels */}
      <div className="absolute inset-0 flex justify-between items-center px-2">
        {['W', 'N', 'N', 'E', 'S'].map((c, i) => (
          <span
            key={i}
            className={clsx(
              'text-[10px] font-mono',
              c === 'N' && i === 2 ? 'text-artic-accent font-bold' : 'text-artic-muted',
            )}
          >
            {c}
          </span>
        ))}
      </div>
      {/* Centre arrow indicator */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 flex flex-col items-center">
        <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-artic-accent" />
      </div>
      {/* Heading pill */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 bg-navy-950/90 border border-artic-accent/40 rounded px-2 py-0.5 text-[10px] font-mono text-artic-accent whitespace-nowrap">
        Heading: {heading.toFixed(0)}°
      </div>
    </div>
  )
}

// ── Compass rose ──────────────────────────────────────────────────────────────
function CompassRose({ headingDeg }: { headingDeg: number }) {
  const angle = ((headingDeg % 360) + 360) % 360
  return (
    <div
      className="w-[88px] h-[88px] shrink-0"
      aria-label={`Compass rose, heading ${headingDeg} degrees`}
    >
      <svg viewBox="0 0 88 88" className="w-full h-full">
        {/* Outer ring */}
        <circle cx="44" cy="44" r="40" fill="rgba(5,13,26,0.55)" stroke="rgba(21,42,84,0.9)" strokeWidth="1.5" />
        {/* Inner tick ring */}
        <circle cx="44" cy="44" r="32" fill="none" stroke="rgba(21,42,84,0.4)" strokeWidth="0.5" />
        {/* Cardinal labels */}
        <text x="44" y="10"  textAnchor="middle" fill="#22d3ee" fontSize="9" fontFamily="monospace" fontWeight="bold">N</text>
        <text x="80" y="47"  textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">E</text>
        <text x="44" y="83"  textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">S</text>
        <text x="8"  y="47"  textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">W</text>
        {/* Rotating arrow */}
        <g transform={`rotate(${angle}, 44, 44)`}>
          {/* North — cyan */}
          <polygon points="44,14 40,44 48,44" fill="#22d3ee" opacity="0.95" />
          {/* South — dim blue */}
          <polygon points="44,74 40,44 48,44" fill="#152a54" />
        </g>
        {/* Centre */}
        <circle cx="44" cy="44" r="3.5" fill="#22d3ee" />
        <circle cx="44" cy="44" r="1.5" fill="#050d1a" />
      </svg>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
/**
 * SimulatorViewport
 *
 * Full-height glass panel. The 3-D canvas fills the entire panel.
 * HUD elements (telemetry cards, compass, compass rose) are overlaid
 * on top of the canvas — matching the reference GCS image.
 */
export default function SimulatorViewport({ telemetry, simState }: SimulatorViewportProps) {
  return (
    <div
      className="relative rounded-xl overflow-hidden border border-white/10"
      style={{ height: 420 }}
    >
      {/* ── 3-D canvas fills the full panel ── */}
      <div className="absolute inset-0">
        <SceneErrorBoundary>
          <Suspense
            fallback={
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: 'radial-gradient(ellipse at 50% 70%, #0a1628 0%, #050d1a 100%)' }}
              >
                <span className="text-artic-muted text-xs font-mono">Loading 3-D scene…</span>
              </div>
            }
          >
            <FlightScene telemetry={telemetry} simState={simState} />
          </Suspense>
        </SceneErrorBoundary>
      </div>

      {/* ── Top HUD overlay ── */}
      <div className="absolute top-0 inset-x-0 flex items-start gap-3 p-3 pointer-events-none"
           style={{ background: 'linear-gradient(to bottom, rgba(5,13,26,0.85) 0%, rgba(5,13,26,0) 100%)' }}
      >
        {/* Telemetry mini-card */}
        <div className="shrink-0 bg-navy-950/70 backdrop-blur-sm border border-white/10 rounded-lg p-2.5 grid grid-cols-2 gap-x-5 gap-y-1">
          <div className="text-[11px] font-mono">
            <span className="text-artic-muted">Altitude </span>
            <span className="text-artic-text font-bold">{telemetry.altitudeM.toFixed(1)} m</span>
          </div>
          <div className="text-[11px] font-mono">
            <span className="text-artic-muted">Speed </span>
            <span className="text-artic-text font-bold">{telemetry.speedMs.toFixed(1)} m/s</span>
          </div>
          <div className="text-[11px] font-mono flex items-center gap-1">
            <span className="text-artic-muted">Battery </span>
            <BatteryIcon pct={telemetry.batteryPct} />
            <span className={clsx('font-bold', batteryColor(telemetry.batteryPct))}>
              {telemetry.batteryPct.toFixed(0)}%
            </span>
          </div>
          <div className="text-[11px] font-mono flex items-center gap-1">
            <span className="text-artic-muted">GPS </span>
            <Signal className="w-3 h-3 text-artic-success" />
            <span className="text-artic-success font-bold">
              {Math.round((telemetry.signalPct / 100) * 16)} sats
            </span>
          </div>
        </div>

        {/* Compass ruler — centred */}
        <CompassRuler headingDeg={telemetry.headingDeg} />

        {/* Compass rose */}
        <CompassRose headingDeg={telemetry.headingDeg} />
      </div>

      {/* ── Bottom gradient fade ── */}
      <div
        className="absolute bottom-0 inset-x-0 h-16 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(5,13,26,0.6) 0%, transparent 100%)' }}
      />
    </div>
  )
}
