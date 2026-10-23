import { useFleetSimulation } from "@/hooks/useFleetSimulation";
import StatSummaryBar from "@/components/ui/StatSummaryBar";
import TelemetryCard from "@/components/ui/TelemetryCard";
import MissionRow from "@/components/ui/MissionRow";
import { RefreshCw } from "lucide-react";

export default function OverviewPage() {
  const fleet = useFleetSimulation();

  const lastUpdated = new Date(fleet.lastUpdatedAt).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-artic-text">Fleet Overview</h2>
          <p className="text-xs text-artic-muted mt-0.5">
            Simulated telemetry · refreshes every 2 s
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-artic-muted text-xs font-mono">
          <RefreshCw className="w-3 h-3 animate-spin-slow" aria-hidden="true" />
          <span>Updated {lastUpdated}</span>
        </div>
      </div>

      {/* Summary stats */}
      <StatSummaryBar fleet={fleet} />

      {/* Aircraft telemetry cards */}
      <section aria-labelledby="telemetry-heading">
        <h3
          id="telemetry-heading"
          className="text-sm font-semibold text-artic-muted uppercase tracking-widest mb-3"
        >
          Aircraft Telemetry
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {fleet.aircraft.map((aircraft) => (
            <TelemetryCard key={aircraft.id} aircraft={aircraft} />
          ))}
        </div>
      </section>

      {/* Mission summary */}
      <section aria-labelledby="missions-heading">
        <h3
          id="missions-heading"
          className="text-sm font-semibold text-artic-muted uppercase tracking-widest mb-3"
        >
          Mission Summary
        </h3>
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-artic-border bg-navy-900/40">
            <p className="text-xs text-artic-muted font-mono">
              {fleet.missions.length} missions · {fleet.missions.filter(m => m.status === "active").length} active
            </p>
          </div>
          <ul className="px-4 divide-y divide-artic-border" role="list" aria-label="Mission list">
            {fleet.missions.map((mission) => (
              <MissionRow key={mission.id} mission={mission} />
            ))}
          </ul>
        </div>
      </section>

      {/* Simulation disclaimer footer */}
      <p className="text-[11px] text-artic-muted text-center font-mono pb-2">
        ⚠ All data is synthetic. No real aircraft are being monitored or commanded.
      </p>
    </div>
  );
}
