import type { FleetOverview } from "@/types/simulation";
import { Plane, Activity, AlertTriangle, CheckCircle } from "lucide-react";

interface StatSummaryBarProps {
  fleet: FleetOverview;
}

export default function StatSummaryBar({ fleet }: StatSummaryBarProps) {
  const { aircraft, missions } = fleet;

  const airborne = aircraft.filter(
    (a) => !["idle", "ready", "fault"].includes(a.status),
  ).length;
  const faulted = aircraft.filter((a) => a.status === "fault").length;
  const activeMissions = missions.filter((m) => m.status === "active").length;
  const completeMissions = missions.filter((m) => m.status === "complete").length;

  const stats = [
    {
      label: "Airborne",
      value: airborne,
      icon: Plane,
      color: "text-artic-accent",
    },
    {
      label: "Active Missions",
      value: activeMissions,
      icon: Activity,
      color: "text-artic-accent",
    },
    {
      label: "Completed",
      value: completeMissions,
      icon: CheckCircle,
      color: "text-artic-success",
    },
    {
      label: "Faults",
      value: faulted,
      icon: AlertTriangle,
      color: faulted > 0 ? "text-artic-danger" : "text-artic-muted",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="card flex items-center gap-3">
          <Icon className={`w-5 h-5 shrink-0 ${color}`} aria-hidden="true" />
          <div>
            <p className="text-2xl font-mono font-semibold text-artic-text leading-none">
              {value}
            </p>
            <p className="text-xs text-artic-muted mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
