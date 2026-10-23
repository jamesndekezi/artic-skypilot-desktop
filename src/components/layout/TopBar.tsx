import { useLocation } from "react-router-dom";
import { Clock } from "lucide-react";
import { useSimulationClock } from "@/hooks/useSimulationClock";

const PAGE_TITLES: Record<string, string> = {
  "/overview": "Overview",
  "/simulator": "Flight Simulator",
  "/mission-planner": "Mission Planner",
  "/flight-logs": "Flight Logs",
  "/settings": "Settings",
};

export default function TopBar() {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] ?? "A.R.T.I.C SkyPilot";
  const simTime = useSimulationClock();

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-artic-border bg-artic-surface shrink-0">
      {/* Page title */}
      <h1 className="text-base font-semibold text-artic-text">{title}</h1>

      {/* Right cluster */}
      <div className="flex items-center gap-4">
        {/* Simulation clock */}
        <div className="flex items-center gap-1.5 text-artic-muted text-xs font-mono">
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          <span aria-label="Simulation time">{simTime}</span>
        </div>

        {/* Sim mode badge */}
        <span className="badge bg-artic-warning/10 text-artic-warning border border-artic-warning/30 text-[10px] tracking-widest uppercase">
          Sim Mode
        </span>
      </div>
    </header>
  );
}
