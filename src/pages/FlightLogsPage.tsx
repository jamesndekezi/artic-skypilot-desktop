import { FileText, AlertTriangle, Clock, Download, Filter } from "lucide-react";

/**
 * FlightLogsPage
 *
 * STATUS: Not yet implemented.
 * Planned features: filterable log table, telemetry replay, CSV/JSON export.
 */
export default function FlightLogsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-artic-text">
            Flight Logs
          </h2>
          <p className="text-xs text-artic-muted mt-0.5">
            Historical telemetry and mission records
          </p>
        </div>
        {/* Disabled action buttons — shown to communicate intended UX */}
        <div className="flex gap-2">
          <button
            disabled
            aria-disabled="true"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 text-artic-border border border-artic-border text-xs font-medium cursor-not-allowed opacity-40"
          >
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
          <button
            disabled
            aria-disabled="true"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 text-artic-border border border-artic-border text-xs font-medium cursor-not-allowed opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
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
            Log persistence, filtering, and export are on the roadmap. The
            log table below is a visual placeholder only.
          </p>
        </div>
      </div>

      {/* Planned features */}
      <div className="card space-y-4">
        <p className="text-xs font-semibold text-artic-muted uppercase tracking-widest">
          Planned Features
        </p>
        <ul className="space-y-3 text-sm">
          {[
            "Persistent flight log storage (local SQLite via Tauri)",
            "Filterable and sortable log table (date, aircraft, status)",
            "Per-flight telemetry replay with timeline scrubber",
            "Anomaly / event highlighting",
            "CSV and JSON export",
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

      {/* Table placeholder */}
      <div className="card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-artic-border bg-navy-900/40 flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-artic-muted" aria-hidden="true" />
          <span className="text-xs font-mono text-artic-muted">
            flight_logs — 0 records
          </span>
        </div>
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <FileText
            className="w-10 h-10 text-artic-border"
            aria-hidden="true"
          />
          <p className="text-artic-muted text-sm text-center">
            No logs available
            <br />
            <span className="text-xs opacity-60">
              Log persistence not yet implemented
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
