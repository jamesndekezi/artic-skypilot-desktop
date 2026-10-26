import { useLocation } from "react-router-dom";
import { Clock, Radio, Gamepad2, Settings, Minus, Square, X, ChevronDown } from "lucide-react";
import { useSimulationClock } from "@/hooks/useSimulationClock";

const PAGE_TITLES: Record<string, string> = {
  "/overview":        "Dashboard",
  "/simulator":       "Flight Simulator",
  "/mission-planner": "Mission Planner",
  "/flight-logs":     "Flight Logs",
  "/settings":        "Settings",
  "/manual-control":  "Manual Control",
  "/telemetry":       "Telemetry",
};

export default function TopBar() {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] ?? "A.R.T.I.C SkyPilot";
  const simTime = useSimulationClock();
  const isManualControl = pathname === "/manual-control";

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-artic-border bg-artic-surface shrink-0 gap-3">
      {/* Left: branding */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
          <Radio className="w-4 h-4 text-artic-accent" aria-hidden="true" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-artic-text">A.R.T.I.C SkyPilot</p>
          <p className="text-[9px] text-artic-muted tracking-widest">Desktop</p>
        </div>
      </div>

      {/* Centre: status indicators */}
      <div className="flex items-center gap-3 flex-1 justify-center">
        {/* Simulation Mode badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-artic-success/10 border-artic-success/30">
          <span className="w-2 h-2 rounded-full bg-artic-success animate-pulse-slow" aria-hidden="true" />
          <span className="text-[11px] font-semibold text-artic-success">Simulation Mode</span>
        </div>

        {/* Connected indicator */}
        <div className="flex items-center gap-1.5 text-[11px] text-artic-success">
          <span className="w-1.5 h-1.5 rounded-full bg-artic-success" aria-hidden="true" />
          <span>Connected (Simulator)</span>
        </div>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Page selector — shows current page name */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-artic-border bg-navy-800/60 text-artic-text text-xs font-medium">
          {isManualControl
            ? <Gamepad2 className="w-3.5 h-3.5 text-artic-accent" aria-hidden="true" />
            : <Radio className="w-3.5 h-3.5 text-artic-muted" aria-hidden="true" />
          }
          <span>{title}</span>
          <ChevronDown className="w-3 h-3 text-artic-muted" aria-hidden="true" />
        </div>

        {/* Clock */}
        <div className="flex items-center gap-1 text-artic-muted text-xs font-mono">
          <Clock className="w-3 h-3" aria-hidden="true" />
          <span aria-label="Simulation time">{simTime}</span>
        </div>

        {/* Settings */}
        <button
          className="p-1.5 rounded hover:bg-navy-800 text-artic-muted hover:text-artic-text transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Window controls (decorative — Tauri handles real ones) */}
        <div className="flex items-center gap-0.5 ml-1">
          {[Minus, Square, X].map((Icon, i) => (
            <button
              key={i}
              className="w-7 h-6 flex items-center justify-center rounded text-artic-muted hover:text-artic-text hover:bg-navy-800 transition-colors"
              aria-hidden="true"
              tabIndex={-1}
            >
              <Icon className="w-3 h-3" />
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
