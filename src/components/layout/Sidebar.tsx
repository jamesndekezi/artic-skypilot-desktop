import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Plane,
  Map,
  FileText,
  Settings,
  Radio,
  Gamepad2,
} from "lucide-react";
import clsx from "clsx";

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
  /** Module is not yet implemented; renders a "Coming Soon" badge */
  comingSoon?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", to: "/overview", icon: LayoutDashboard },
  { label: "Flight Simulator", to: "/simulator", icon: Plane },
  { label: "Manual Control", to: "/manual-control", icon: Gamepad2 },
  {
    label: "Mission Planner",
    to: "/mission-planner",
    icon: Map,
    comingSoon: true,
  },
  {
    label: "Flight Logs",
    to: "/flight-logs",
    icon: FileText,
    comingSoon: true,
  },
  { label: "Settings", to: "/settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside
      className="
        flex flex-col w-56 shrink-0
        bg-artic-surface border-r border-artic-border
        select-none
      "
      aria-label="Main navigation"
    >
      {/* Brand header */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-artic-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 glow-cyan">
          <Radio className="w-5 h-5 text-artic-accent" aria-hidden="true" />
        </div>
        <div className="leading-tight">
          <p className="text-artic-accent font-mono font-semibold text-sm tracking-wide">
            SkyPilot
          </p>
          <p className="text-artic-muted text-[10px] tracking-widest uppercase">
            A.R.T.I.C
          </p>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ label, to, icon: Icon, comingSoon }) => (
          <NavLink
            key={to}
            to={to}
            aria-disabled={comingSoon}
            tabIndex={comingSoon ? -1 : undefined}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150",
                isActive
                  ? "bg-cyan-500/10 text-artic-accent border border-cyan-500/20"
                  : "text-artic-muted hover:text-artic-text hover:bg-navy-800",
                comingSoon && "pointer-events-none opacity-50",
              )
            }
          >
            <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="flex-1">{label}</span>
            {comingSoon && (
              <span className="badge bg-navy-700 text-artic-muted text-[9px] tracking-wide">
                Soon
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer version */}
      <div className="px-5 py-3 border-t border-artic-border">
        <p className="text-artic-muted text-[10px] font-mono">
          v0.1.0 · sim build
        </p>
      </div>
    </aside>
  );
}
