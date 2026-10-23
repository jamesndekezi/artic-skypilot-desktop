/**
 * SimulationBanner
 * Persistent top-of-screen notice. Always visible. Cannot be dismissed.
 * Requirement: clearly state no live aircraft is connected.
 */
export default function SimulationBanner() {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="
        flex items-center justify-center gap-2
        bg-artic-warning/10 border-b border-artic-warning/30
        px-4 py-1.5 text-xs font-mono font-semibold tracking-widest
        text-artic-warning uppercase select-none shrink-0
      "
    >
      {/* Blinking indicator dot */}
      <span
        className="status-dot bg-artic-warning animate-blink"
        aria-hidden="true"
      />
      SIMULATION ONLY — NO LIVE AIRCRAFT CONNECTED
      <span
        className="status-dot bg-artic-warning animate-blink"
        aria-hidden="true"
      />
    </div>
  );
}
