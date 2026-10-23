import { Map, AlertTriangle, Clock } from "lucide-react";

/**
 * MissionPlannerPage
 *
 * STATUS: Not yet implemented.
 * Planned features: interactive map, waypoint editor, mission templates,
 * geofence configuration, and pre-flight checklist.
 */
export default function MissionPlannerPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold text-artic-text">
          Mission Planner
        </h2>
        <p className="text-xs text-artic-muted mt-0.5">
          Plan autonomous flight missions and waypoint routes
        </p>
      </div>

      {/* Not-implemented notice */}
      <div className="card border-artic-warning/30 bg-artic-warning/5 flex items-start gap-3">
        <AlertTriangle
          className="w-4 h-4 text-artic-warning mt-0.5 shrink-0"
          aria-hidden="true"
        />
        <div>
          <p className="text-artic-warning font-semibold text-sm">
            Module not yet implemented
          </p>
          <p className="text-artic-muted text-xs mt-0.5">
            This module is on the roadmap. It is intentionally left as a
            placeholder so you can clearly see it is unfinished.
          </p>
        </div>
      </div>

      {/* Roadmap */}
      <div className="card space-y-4">
        <p className="text-xs font-semibold text-artic-muted uppercase tracking-widest">
          Planned Features
        </p>
        <ul className="space-y-3 text-sm">
          {[
            "Interactive map with waypoint drag-and-drop",
            "Mission templates (survey grid, perimeter patrol, point inspection)",
            "Geofence boundary configuration",
            "Pre-flight safety checklist",
            "Multi-aircraft mission assignment",
            "Export to standard mission formats (MAVLink WPL)",
          ].map((feat) => (
            <li key={feat} className="flex items-center gap-2 text-artic-muted">
              <Clock
                className="w-3.5 h-3.5 text-artic-border shrink-0"
                aria-hidden="true"
              />
              {feat}
            </li>
          ))}
        </ul>
      </div>

      {/* Map placeholder */}
      <div className="card border-dashed border-artic-border flex flex-col items-center justify-center py-24 gap-3">
        <Map className="w-12 h-12 text-artic-border" aria-hidden="true" />
        <p className="text-artic-muted text-sm text-center">
          Interactive Map
          <br />
          <span className="text-xs opacity-60">Not yet implemented</span>
        </p>
      </div>
    </div>
  );
}
