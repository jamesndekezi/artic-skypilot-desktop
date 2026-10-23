import { useState, useEffect } from "react";

/**
 * Returns a formatted HH:MM:SS UTC string that ticks every second.
 * Used to display the running simulation clock in the TopBar.
 * Purely presentational — no hardware interaction.
 */
export function useSimulationClock(): string {
  const [time, setTime] = useState(() => formatUtc(new Date()));

  useEffect(() => {
    const id = setInterval(() => {
      setTime(formatUtc(new Date()));
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return time;
}

function formatUtc(date: Date): string {
  const h = date.getUTCHours().toString().padStart(2, "0");
  const m = date.getUTCMinutes().toString().padStart(2, "0");
  const s = date.getUTCSeconds().toString().padStart(2, "0");
  return `${h}:${m}:${s} UTC`;
}
