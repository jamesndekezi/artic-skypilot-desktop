/**
 * SimulatorViewport
 *
 * Full-bleed simulator panel matching the reference GCS design.
 * - Scenic gradient background (mimics sky/landscape)
 * - Telemetry HUD top-left, compass ruler top-centre, compass rose top-right
 * - FlightScene R3F canvas fills the panel
 * - Flight Mode and Control Indicators overlaid as glass cards on the lower portion
 * - PAUSED overlay when paused
 * - All values are simulated — no real sensor data
 */
import { Suspense } from 'react'
import { BatteryMedium, BatteryFull, BatteryWarning, Signal, Info } from 'lucide-react'
import clsx from 'clsx'
import type { AircraftTelemetry } from '@/types/simulation'
import type { ControlInputs, FlightMode } from '@/types/manual-control'
import FlightScene from '@/components/simulator/FlightScene'
import SceneErrorBoundary from '@/components/simulator/SceneErrorBoundary'

interface SimulatorViewportProps {
  telemetry: AircraftTelemetry
  simState: 'idle' | 'running' | 'paused'
  paused?: boolean
  // Control overlays
  inputs: ControlInputs
  flightMode: FlightMode
  onSelectFlightMode: (mode: FlightMode) => void
}

// ── Battery icon ──────────────────────────────────────────────────────────────
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
  return (
    <div className="flex-1 mx-4 relative h-9" aria-label={`Compass, heading ${heading}°`}>
      <div className="absolute inset-x-0 top-4 h-px bg-white/20" />
      {[0, 25, 50, 75, 100].map(p => (
        <div key={p} className="absolute top-3 w-px h-2 bg-white/30" style={{ left: `${p}%` }} />
      ))}
      <div className="absolute inset-0 flex justify-between items-start px-1 pt-1">
        {['W', 'N', 'N', 'E', 'S'].map((c, i) => (
          <span key={i} className={clsx('text-[10px] font-mono',
            c === 'N' && i === 2 ? 'text-artic-accent font-bold' : 'text-white/60'
          )}>{c}</span>
        ))}
      </div>
      {/* Centre tick */}
      <div className="absolute left-1/2 -translate-x-1/2 top-2 w-0.5 h-3 bg-artic-accent" />
      {/* Heading badge */}
      <div className="absolute left-1/2 -translate-x-1/2 top-6 bg-navy-950/80 border border-artic-accent/50 rounded px-2 py-0.5 text-[10px] font-mono text-artic-accent whitespace-nowrap">
        Heading: {heading.toFixed(0)}°
      </div>
    </div>
  )
}

// ── Compass rose ──────────────────────────────────────────────────────────────
function CompassRose({ headingDeg }: { headingDeg: number }) {
  const angle = ((headingDeg % 360) + 360) % 360
  return (
    <div className="w-24 h-24 shrink-0 bg-navy-950/60 border border-white/10 rounded-lg" aria-label={`Compass rose, heading ${headingDeg}°`}>
      <svg viewBox="0 0 88 88" className="w-full h-full">
        <circle cx="44" cy="44" r="38" fill="rgba(5,13,26,0.4)" stroke="rgba(21,42,84,0.9)" strokeWidth="1.5" />
        <text x="44" y="10"  textAnchor="middle" fill="#22d3ee" fontSize="9" fontFamily="monospace" fontWeight="bold">N</text>
        <text x="80" y="47"  textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">E</text>
        <text x="44" y="83"  textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">S</text>
        <text x="8"  y="47"  textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">W</text>
        <g transform={`rotate(${angle}, 44, 44)`}>
          <polygon points="44,14 40,44 48,44" fill="#22d3ee" opacity="0.95" />
          <polygon points="44,74 40,44 48,44" fill="#152a54" />
        </g>
        <circle cx="44" cy="44" r="3.5" fill="#22d3ee" />
        <circle cx="44" cy="44" r="1.5" fill="#050d1a" />
      </svg>
    </div>
  )
}

// ── Flight Mode overlay card ──────────────────────────────────────────────────
const FLIGHT_MODES: { id: FlightMode; label: string; key: string }[] = [
  { id: 'stabilize',     label: 'Stabilize',    key: '1' },
  { id: 'altitude-hold', label: 'Altitude Hold', key: '2' },
  { id: 'position-hold', label: 'Position Hold', key: '3' },
]
const MODE_LABEL: Record<FlightMode, string> = {
  'stabilize':     'Stabilize (simulation)',
  'altitude-hold': 'Altitude Hold (simulation)',
  'position-hold': 'Position Hold (simulation)',
}

function FlightModeOverlay({ flightMode, onSelect }: { flightMode: FlightMode; onSelect: (m: FlightMode) => void }) {
  return (
    <div className="bg-navy-950/80 backdrop-blur-md border border-white/10 rounded-xl p-4 w-72">
      <p className="text-xs font-semibold text-artic-text mb-3">
        Flight Mode <span className="text-artic-muted font-normal">(Simulation)</span>
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        {FLIGHT_MODES.map(({ id, label, key }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            aria-pressed={flightMode === id}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              flightMode === id
                ? 'bg-green-600/30 border-green-500/60 text-green-300'
                : 'bg-navy-800/60 border-white/10 text-artic-muted hover:text-artic-text',
            )}
          >
            <span className={clsx(
              'w-4 h-4 rounded text-[10px] flex items-center justify-center font-mono border',
              flightMode === id ? 'bg-green-600/40 border-green-500/50 text-green-300' : 'bg-navy-700 border-white/10 text-artic-muted',
            )}>{key}</span>
            {label}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-artic-muted">Mode: {MODE_LABEL[flightMode]}</p>
      <div className="flex items-center gap-1.5 mt-2">
        <Info className="w-3 h-3 text-blue-400/60 shrink-0" />
        <p className="text-[10px] text-artic-muted/70">These are simulation labels only.</p>
      </div>
    </div>
  )
}

// ── Control Indicators overlay card ──────────────────────────────────────────
interface AxisBarProps { label: string; value: number; bipolar: boolean; color: string }
function AxisBar({ label, value, bipolar, color }: AxisBarProps) {
  const pct = bipolar ? 50 + value * 50 : value * 100
  const barStyle = bipolar
    ? value >= 0
      ? { left: '50%', width: `${Math.abs(value) * 50}%` }
      : { left: `${50 + value * 50}%`, width: `${Math.abs(value) * 50}%` }
    : { left: '0%', width: `${pct}%` }
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-artic-muted w-14 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-navy-800/80 rounded-full relative overflow-hidden">
        {bipolar && <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20" />}
        <div className={`absolute top-0 bottom-0 rounded-full ${color} transition-all duration-100`} style={barStyle} />
      </div>
      <span className="text-xs font-mono text-artic-text w-10 text-right shrink-0">{value.toFixed(2)}</span>
    </div>
  )
}

function ControlIndicatorsOverlay({ inputs }: { inputs: ControlInputs }) {
  return (
    <div className="bg-navy-950/80 backdrop-blur-md border border-white/10 rounded-xl p-4 w-72">
      <p className="text-xs font-semibold text-artic-text mb-3 uppercase tracking-widest">Control Indicators</p>
      <div className="space-y-2.5">
        <AxisBar label="Pitch"    value={inputs.pitch}    bipolar color="bg-blue-500"   />
        <AxisBar label="Roll"     value={inputs.roll}     bipolar color="bg-green-500"  />
        <AxisBar label="Yaw"      value={inputs.yaw}      bipolar color="bg-purple-500" />
        <AxisBar label="Throttle" value={inputs.throttle} bipolar={false} color="bg-amber-500" />
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SimulatorViewport({
  telemetry, simState, paused = false,
  inputs, flightMode, onSelectFlightMode,
}: SimulatorViewportProps) {
  return (
    <div className="relative rounded-xl overflow-hidden border border-white/10" style={{ height: 460 }}>

      {/* Scenic gradient background (sky → landscape feel) */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #1a3a5c 0%, #2d6a9f 25%, #4a90c4 40%, #5ba3d0 50%, #3d7a6e 65%, #2d5e3a 80%, #1e4028 100%)',
        }}
      />

      {/* R3F canvas overlaid */}
      <div className="absolute inset-0 mix-blend-screen opacity-70">
        <SceneErrorBoundary>
          <Suspense fallback={null}>
            <FlightScene telemetry={telemetry} simState={simState} />
          </Suspense>
        </SceneErrorBoundary>
      </div>

      {/* Top gradient fade */}
      <div className="absolute top-0 inset-x-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(5,13,26,0.80) 0%, transparent 100%)' }}
      />

      {/* ── Top HUD ── */}
      <div className="absolute top-0 inset-x-0 flex items-start gap-3 p-3 pointer-events-none">
        {/* Telemetry card */}
        <div className="shrink-0 bg-navy-950/75 backdrop-blur-sm border border-white/10 rounded-lg p-2.5 grid grid-cols-2 gap-x-5 gap-y-1 pointer-events-auto">
          {[
            ['Altitude', `${telemetry.altitudeM.toFixed(1)} m`],
            ['Speed',    `${telemetry.speedMs.toFixed(1)} m/s`],
          ].map(([k, v]) => (
            <div key={k} className="text-[11px] font-mono">
              <span className="text-artic-muted">{k} </span>
              <span className="text-artic-text font-bold">{v}</span>
            </div>
          ))}
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

        <CompassRuler headingDeg={telemetry.headingDeg} />
        <CompassRose  headingDeg={telemetry.headingDeg} />
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 inset-x-0 h-40 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(5,13,26,0.85) 0%, transparent 100%)' }}
      />

      {/* ── Lower overlaid cards: Flight Mode (left) + Control Indicators (right) ── */}
      <div className="absolute bottom-4 inset-x-4 flex items-end justify-between gap-4 pointer-events-auto">
        <FlightModeOverlay flightMode={flightMode} onSelect={onSelectFlightMode} />
        <ControlIndicatorsOverlay inputs={inputs} />
      </div>

      {/* PAUSED overlay */}
      {paused && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
          <span className="text-white text-2xl font-bold font-mono tracking-widest select-none drop-shadow-lg">
            ⏸ PAUSED
          </span>
        </div>
      )}
    </div>
  )
}
