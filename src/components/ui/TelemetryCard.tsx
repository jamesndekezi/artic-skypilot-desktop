import clsx from "clsx";
import type { AircraftTelemetry, AircraftStatus } from "@/types/simulation";
import {
  BatteryMedium,
  BatteryWarning,
  BatteryFull,
  Gauge,
  MoveUp,
  Signal,
  Navigation,
  Timer,
} from "lucide-react";

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<AircraftStatus, string> = {
  idle: "bg-artic-muted/20 text-artic-muted",
  ready: "bg-artic-success/10 text-artic-success border border-artic-success/30",
  takeoff: "bg-cyan-500/10 text-artic-accent border border-cyan-500/20",
  "en-route": "bg-cyan-500/10 text-artic-accent border border-cyan-500/20",
  hovering: "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20",
  returning: "bg-artic-warning/10 text-artic-warning border border-artic-warning/30",
  landing: "bg-artic-warning/10 text-artic-warning border border-artic-warning/30",
  fault: "bg-artic-danger/10 text-artic-danger border border-artic-danger/30",
};

const STATUS_DOT: Record<AircraftStatus, string> = {
  idle: "bg-artic-muted",
  ready: "bg-artic-success",
  takeoff: "bg-artic-accent animate-pulse",
  "en-route": "bg-artic-accent animate-pulse",
  hovering: "bg-cyan-300 animate-pulse-slow",
  returning: "bg-artic-warning animate-pulse",
  landing: "bg-artic-warning animate-pulse",
  fault: "bg-artic-danger animate-blink",
};

function BatteryIcon({ pct }: { pct: number }) {
  if (pct > 60) return <BatteryFull className="w-3.5 h-3.5 text-artic-success" />;
  if (pct > 25) return <BatteryMedium className="w-3.5 h-3.5 text-artic-warning" />;
  return <BatteryWarning className="w-3.5 h-3.5 text-artic-danger" />;
}

function batteryColor(pct: number): string {
  if (pct > 60) return "text-artic-success";
  if (pct > 25) return "text-artic-warning";
  return "text-artic-danger";
}

function formatFlightTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface TelemetryCardProps {
  aircraft: AircraftTelemetry;
}

export default function TelemetryCard({ aircraft }: TelemetryCardProps) {
  const {
    name,
    status,
    batteryPct,
    speedMs,
    altitudeM,
    signalPct,
    headingDeg,
    flightTimeSec,
  } = aircraft;

  return (
    <article
      className="card flex flex-col gap-3 hover:border-artic-accent/40 transition-colors"
      aria-label={`Telemetry for ${name}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={clsx("status-dot", STATUS_DOT[status])}
            aria-hidden="true"
          />
          <span className="font-mono font-semibold text-artic-text">{name}</span>
        </div>
        <span className={clsx("badge text-[10px] uppercase tracking-wider", STATUS_STYLES[status])}>
          {status.replace("-", " ")}
        </span>
      </div>

      {/* Metrics grid */}
      <dl className="grid grid-cols-2 gap-2">
        {/* Battery */}
        <div className="flex items-center gap-1.5">
          <BatteryIcon pct={batteryPct} />
          <dt className="sr-only">Battery</dt>
          <dd className={clsx("mono text-sm font-semibold", batteryColor(batteryPct))}>
            {batteryPct.toFixed(0)}%
          </dd>
        </div>

        {/* Speed */}
        <div className="flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5 text-artic-muted" />
          <dt className="sr-only">Speed</dt>
          <dd className="mono text-sm text-artic-text">
            {speedMs.toFixed(1)}<span className="text-artic-muted text-xs"> m/s</span>
          </dd>
        </div>

        {/* Altitude */}
        <div className="flex items-center gap-1.5">
          <MoveUp className="w-3.5 h-3.5 text-artic-muted" />
          <dt className="sr-only">Altitude</dt>
          <dd className="mono text-sm text-artic-text">
            {altitudeM.toFixed(0)}<span className="text-artic-muted text-xs"> m AGL</span>
          </dd>
        </div>

        {/* Signal */}
        <div className="flex items-center gap-1.5">
          <Signal className="w-3.5 h-3.5 text-artic-muted" />
          <dt className="sr-only">Signal</dt>
          <dd className="mono text-sm text-artic-text">
            {signalPct.toFixed(0)}<span className="text-artic-muted text-xs">%</span>
          </dd>
        </div>

        {/* Heading */}
        <div className="flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-artic-muted" />
          <dt className="sr-only">Heading</dt>
          <dd className="mono text-sm text-artic-text">
            {headingDeg.toFixed(0)}<span className="text-artic-muted text-xs">°</span>
          </dd>
        </div>

        {/* Flight time */}
        <div className="flex items-center gap-1.5">
          <Timer className="w-3.5 h-3.5 text-artic-muted" />
          <dt className="sr-only">Flight time</dt>
          <dd className="mono text-sm text-artic-text">
            {formatFlightTime(flightTimeSec)}
          </dd>
        </div>
      </dl>
    </article>
  );
}
