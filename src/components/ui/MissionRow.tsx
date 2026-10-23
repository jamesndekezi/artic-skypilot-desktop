import clsx from "clsx";
import type { MissionSummary, MissionStatus } from "@/types/simulation";

const STATUS_STYLES: Record<MissionStatus, string> = {
  pending: "bg-artic-muted/20 text-artic-muted",
  active: "bg-cyan-500/10 text-artic-accent border border-cyan-500/20",
  complete: "bg-artic-success/10 text-artic-success border border-artic-success/30",
  aborted: "bg-artic-danger/10 text-artic-danger border border-artic-danger/30",
};

interface MissionRowProps {
  mission: MissionSummary;
}

export default function MissionRow({ mission }: MissionRowProps) {
  const { name, status, waypointReached, waypointTotal, aircraftId } = mission;
  const progress =
    waypointTotal > 0 ? (waypointReached / waypointTotal) * 100 : 0;

  return (
    <li className="flex items-center gap-4 py-2.5 border-b border-artic-border last:border-0">
      {/* Mission name + aircraft */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-artic-text truncate">{name}</p>
        <p className="text-xs text-artic-muted font-mono">{aircraftId.toUpperCase()}</p>
      </div>

      {/* Progress bar */}
      <div className="flex-1 min-w-0 hidden sm:block" aria-label={`${waypointReached} of ${waypointTotal} waypoints`}>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-navy-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-artic-accent rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-artic-muted w-12 text-right">
            {waypointReached}/{waypointTotal}
          </span>
        </div>
      </div>

      {/* Status badge */}
      <span className={clsx("badge text-[10px] uppercase tracking-wide shrink-0", STATUS_STYLES[status])}>
        {status}
      </span>
    </li>
  );
}
