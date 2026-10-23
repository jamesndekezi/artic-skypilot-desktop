import { useState } from "react";
import { Plane, Play, Square, RotateCcw, AlertTriangle } from "lucide-react";
import { useFleetSimulation } from "@/hooks/useFleetSimulation";
import clsx from "clsx";

type SimState = "idle" | "running" | "paused";

/**
 * FlightSimulatorPage
 *
 * STATUS: Partial — basic simulated takeoff/land controls wired to
 * the fleet simulation hook. 3-D visualisation, waypoint path editing,
 * and physics engine are NOT YET IMPLEMENTED.
 */
export default function FlightSimulatorPage() {
  const fleet = useFleetSimulation();
  const [simState, setSimState] = useState<SimState>("idle");
  const [selectedId, setSelectedId] = useState<string>(
    fleet.aircraft[0]?.id ?? "",
  );

  const selected = fleet.aircraft.find((a) => a.id === selectedId);

  function handleStart() {
    setSimState("running");
  }
  function handleStop() {
    setSimState("idle");
  }
  function handleReset() {
    setSimState("idle");
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-artic-text">
          Flight Simulator
        </h2>
        <p className="text-xs text-artic-muted mt-0.5">
          Simulated flight controls · no hardware commands are issued
        </p>
      </div>

      {/* Module status banner */}
      <div className="flex items-start gap-3 card border-artic-warning/30 bg-artic-warning/5">
        <AlertTriangle
          className="w-4 h-4 text-artic-warning mt-0.5 shrink-0"
          aria-hidden="true"
        />
        <div className="text-sm">
          <p className="text-artic-warning font-semibold">
            Module partially implemented
          </p>
          <p className="text-artic-muted text-xs mt-0.5">
            Telemetry display and basic sim controls are functional. The
            following features are{" "}
            <strong className="text-artic-text">not yet built</strong>: 3-D
            viewport, physics engine, waypoint path editor, replay, and
            export.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Aircraft selector */}
        <div className="card space-y-3">
          <p className="text-xs font-semibold text-artic-muted uppercase tracking-widest">
            Select Aircraft
          </p>
          <ul className="space-y-1" role="listbox" aria-label="Aircraft list">
            {fleet.aircraft.map((a) => (
              <li key={a.id}>
                <button
                  role="option"
                  aria-selected={a.id === selectedId}
                  onClick={() => setSelectedId(a.id)}
                  className={clsx(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-mono transition-colors",
                    a.id === selectedId
                      ? "bg-cyan-500/10 text-artic-accent border border-cyan-500/20"
                      : "text-artic-muted hover:text-artic-text hover:bg-navy-800",
                  )}
                >
                  <Plane className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  {a.name}
                  <span className="ml-auto text-[10px] uppercase opacity-60">
                    {a.status}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Sim controls + readout */}
        <div className="lg:col-span-2 space-y-4">
          {/* Controls */}
          <div className="card">
            <p className="text-xs font-semibold text-artic-muted uppercase tracking-widest mb-3">
              Simulation Controls
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleStart}
                disabled={simState === "running"}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-artic-accent/10 text-artic-accent border border-artic-accent/30 text-sm font-medium hover:bg-artic-accent/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                Start
              </button>
              <button
                onClick={handleStop}
                disabled={simState === "idle"}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-artic-danger/10 text-artic-danger border border-artic-danger/30 text-sm font-medium hover:bg-artic-danger/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Square className="w-3.5 h-3.5" />
                Stop
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-navy-800 text-artic-muted border border-artic-border text-sm font-medium hover:text-artic-text transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
            <p className="text-xs font-mono text-artic-muted mt-3">
              State:{" "}
              <span
                className={clsx(
                  "font-semibold",
                  simState === "running"
                    ? "text-artic-success"
                    : "text-artic-muted",
                )}
              >
                {simState.toUpperCase()}
              </span>
            </p>
          </div>

          {/* Selected aircraft readout */}
          {selected && (
            <div className="card">
              <p className="text-xs font-semibold text-artic-muted uppercase tracking-widest mb-3">
                Live Readout — {selected.name}
              </p>
              <dl className="grid grid-cols-3 gap-y-3 gap-x-4 font-mono text-sm">
                {[
                  ["Altitude", `${selected.altitudeM.toFixed(1)} m`],
                  ["Speed", `${selected.speedMs.toFixed(1)} m/s`],
                  ["Heading", `${selected.headingDeg.toFixed(0)}°`],
                  ["Battery", `${selected.batteryPct.toFixed(0)}%`],
                  ["Signal", `${selected.signalPct.toFixed(0)}%`],
                  ["Status", selected.status],
                ].map(([label, val]) => (
                  <div key={label}>
                    <dt className="text-[10px] text-artic-muted uppercase tracking-wide">
                      {label}
                    </dt>
                    <dd className="text-artic-text font-semibold">{val}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* 3-D viewport placeholder */}
          <div className="card border-dashed border-artic-border flex flex-col items-center justify-center py-16 gap-3">
            <Plane
              className="w-10 h-10 text-artic-border"
              aria-hidden="true"
            />
            <p className="text-artic-muted text-sm text-center">
              3-D Viewport
              <br />
              <span className="text-xs opacity-60">Not yet implemented</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
