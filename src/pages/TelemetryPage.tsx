import { BarChart2, Clock } from 'lucide-react'

/**
 * TelemetryPage
 *
 * STATUS: Not yet implemented.
 * Planned features: live telemetry graphs, data export, historical playback.
 */
export default function TelemetryPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold text-artic-text">Telemetry</h2>
        <p className="text-xs text-artic-muted mt-0.5">
          Live data graphs and historical telemetry records
        </p>
      </div>

      <div className="card border-artic-warning/30 bg-artic-warning/5 flex items-start gap-3">
        <BarChart2 className="w-4 h-4 text-artic-warning mt-0.5 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-artic-warning font-semibold text-sm">Module not yet implemented</p>
          <p className="text-artic-muted text-xs mt-0.5">
            Telemetry visualisation is on the roadmap. This is an intentional placeholder.
          </p>
        </div>
      </div>

      <div className="card space-y-4">
        <p className="text-xs font-semibold text-artic-muted uppercase tracking-widest">Planned Features</p>
        <ul className="space-y-3 text-sm">
          {[
            'Real-time altitude, speed, battery, and signal graphs',
            'Configurable time-window (30 s / 5 min / full session)',
            'CSV and JSON export',
            'Playback of recorded simulation sessions',
            'Comparison of multiple flights side by side',
          ].map((feat) => (
            <li key={feat} className="flex items-center gap-2 text-artic-muted">
              <Clock className="w-3.5 h-3.5 text-artic-border shrink-0" aria-hidden="true" />
              {feat}
            </li>
          ))}
        </ul>
      </div>

      <div className="card border-dashed border-artic-border flex flex-col items-center justify-center py-24 gap-3">
        <BarChart2 className="w-12 h-12 text-artic-border" aria-hidden="true" />
        <p className="text-artic-muted text-sm text-center">
          Telemetry graphs<br />
          <span className="text-xs opacity-60">Not yet implemented</span>
        </p>
      </div>
    </div>
  )
}
