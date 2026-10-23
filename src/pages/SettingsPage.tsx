import { Settings, Info, Shield, RefreshCw } from "lucide-react";

interface SettingRowProps {
  label: string;
  description: string;
  children: React.ReactNode;
}

function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-artic-border last:border-0">
      <div className="flex-1">
        <p className="text-sm text-artic-text font-medium">{label}</p>
        <p className="text-xs text-artic-muted mt-0.5">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/**
 * SettingsPage
 *
 * STATUS: Partial — displays application info and a read-only simulation
 * safety section. Editable settings (theme, update channel, connection config)
 * are not yet persisted.
 */
export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-artic-text">Settings</h2>
        <p className="text-xs text-artic-muted mt-0.5">
          Application configuration
        </p>
      </div>

      {/* Simulation safety — always locked */}
      <section aria-labelledby="safety-heading" className="card space-y-0 p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-artic-border bg-artic-warning/5">
          <Shield
            className="w-4 h-4 text-artic-warning shrink-0"
            aria-hidden="true"
          />
          <h3
            id="safety-heading"
            className="text-sm font-semibold text-artic-warning"
          >
            Simulation Safety
          </h3>
        </div>
        <div className="px-4">
          <SettingRow
            label="Simulation Mode"
            description="Hardware commands are permanently disabled. This cannot be turned off in this build."
          >
            <span className="badge bg-artic-success/10 text-artic-success border border-artic-success/30 text-xs">
              Always On
            </span>
          </SettingRow>
          <SettingRow
            label="Live Aircraft Connection"
            description="No real aircraft connection is established or attempted."
          >
            <span className="badge bg-artic-danger/10 text-artic-danger border border-artic-danger/30 text-xs">
              Disabled
            </span>
          </SettingRow>
        </div>
      </section>

      {/* General settings */}
      <section aria-labelledby="general-heading" className="card space-y-0 p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-artic-border bg-navy-900/40">
          <Settings className="w-4 h-4 text-artic-muted shrink-0" aria-hidden="true" />
          <h3 id="general-heading" className="text-sm font-semibold text-artic-muted">
            General
          </h3>
        </div>
        <div className="px-4">
          <SettingRow
            label="Telemetry Refresh Rate"
            description="How often the simulation data ticks (currently fixed at 2 s)."
          >
            <span className="font-mono text-sm text-artic-text">2 s</span>
          </SettingRow>
          <SettingRow
            label="Theme"
            description="UI colour scheme — additional themes planned."
          >
            <span className="badge bg-navy-800 text-artic-muted border border-artic-border text-xs">
              Dark Navy (default)
            </span>
          </SettingRow>
          <SettingRow
            label="Update Channel"
            description="Automatic update checking is not yet configured."
          >
            <span className="flex items-center gap-1 text-artic-muted text-xs font-mono">
              <RefreshCw className="w-3 h-3" aria-hidden="true" />
              Not configured
            </span>
          </SettingRow>
        </div>
      </section>

      {/* About */}
      <section aria-labelledby="about-heading" className="card space-y-0 p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-artic-border bg-navy-900/40">
          <Info className="w-4 h-4 text-artic-muted shrink-0" aria-hidden="true" />
          <h3 id="about-heading" className="text-sm font-semibold text-artic-muted">
            About
          </h3>
        </div>
        <div className="px-4">
          <SettingRow label="Application" description="A.R.T.I.C SkyPilot Desktop">
            <span className="font-mono text-xs text-artic-muted">v0.1.0</span>
          </SettingRow>
          <SettingRow label="Build Type" description="Simulation-only development build">
            <span className="badge bg-artic-accent/10 text-artic-accent border border-artic-accent/20 text-xs">
              sim-dev
            </span>
          </SettingRow>
          <SettingRow
            label="Stack"
            description="Tauri 2 · React 18 · TypeScript · Vite · Tailwind CSS"
          >
            <span className="font-mono text-xs text-artic-muted">—</span>
          </SettingRow>
          <SettingRow
            label="Repository"
            description="github.com/jamesndekezi/artic-skypilot-desktop"
          >
            <span className="font-mono text-xs text-artic-muted">MIT</span>
          </SettingRow>
        </div>
      </section>
    </div>
  );
}
