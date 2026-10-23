import { useState, useEffect, useCallback } from "react";
import type {
  FleetOverview,
  AircraftTelemetry,
  MissionSummary,
} from "@/types/simulation";

// ── Seeded initial state ──────────────────────────────────────────────────────

const INITIAL_AIRCRAFT: AircraftTelemetry[] = [
  {
    id: "sky-01",
    name: "SKY-01",
    status: "en-route",
    batteryPct: 78,
    speedMs: 12.4,
    altitudeM: 85,
    signalPct: 92,
    position: { lat: -1.2921, lng: 36.8219, altitudeM: 85 },
    headingDeg: 47,
    flightTimeSec: 312,
  },
  {
    id: "sky-02",
    name: "SKY-02",
    status: "hovering",
    batteryPct: 54,
    speedMs: 0,
    altitudeM: 40,
    signalPct: 85,
    position: { lat: -1.2945, lng: 36.8234, altitudeM: 40 },
    headingDeg: 180,
    flightTimeSec: 540,
  },
  {
    id: "sky-03",
    name: "SKY-03",
    status: "ready",
    batteryPct: 100,
    speedMs: 0,
    altitudeM: 0,
    signalPct: 99,
    position: { lat: -1.2900, lng: 36.8200, altitudeM: 0 },
    headingDeg: 0,
    flightTimeSec: 0,
  },
  {
    id: "sky-04",
    name: "SKY-04",
    status: "returning",
    batteryPct: 22,
    speedMs: 9.1,
    altitudeM: 60,
    signalPct: 71,
    position: { lat: -1.2980, lng: 36.8260, altitudeM: 60 },
    headingDeg: 215,
    flightTimeSec: 1020,
  },
];

const INITIAL_MISSIONS: MissionSummary[] = [
  {
    id: "m-001",
    name: "Perimeter Survey Alpha",
    status: "active",
    startedAt: new Date(Date.now() - 1000 * 312).toISOString(),
    waypointTotal: 12,
    waypointReached: 5,
    aircraftId: "sky-01",
  },
  {
    id: "m-002",
    name: "Waypoint Inspection B-7",
    status: "active",
    startedAt: new Date(Date.now() - 1000 * 540).toISOString(),
    waypointTotal: 8,
    waypointReached: 8,
    aircraftId: "sky-02",
  },
  {
    id: "m-003",
    name: "Grid Mapping Zone C",
    status: "pending",
    startedAt: new Date().toISOString(),
    waypointTotal: 20,
    waypointReached: 0,
    aircraftId: "sky-03",
  },
  {
    id: "m-004",
    name: "Patrol Route Delta",
    status: "aborted",
    startedAt: new Date(Date.now() - 1000 * 1020).toISOString(),
    waypointTotal: 6,
    waypointReached: 4,
    aircraftId: "sky-04",
  },
];

// ── Simulation tick helpers ───────────────────────────────────────────────────

/** Clamp a number between min and max */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Return value ± delta, clamped. */
function jitter(value: number, delta: number, min: number, max: number): number {
  return clamp(value + (Math.random() - 0.5) * 2 * delta, min, max);
}

function tickAircraft(a: AircraftTelemetry): AircraftTelemetry {
  if (a.status === "ready" || a.status === "idle") return a;

  return {
    ...a,
    batteryPct: clamp(
      a.status === "returning" ? a.batteryPct - 0.05 : a.batteryPct - 0.02,
      0,
      100,
    ),
    speedMs:
      a.status === "hovering" ? 0 : jitter(a.speedMs, 0.5, 0, 25),
    altitudeM: jitter(a.altitudeM, 1, 0, 400),
    signalPct: jitter(a.signalPct, 1, 40, 100),
    headingDeg: (a.headingDeg + (Math.random() - 0.5) * 2 + 360) % 360,
    flightTimeSec: a.flightTimeSec + 2,
    position: {
      ...a.position,
      lat: a.position.lat + (Math.random() - 0.5) * 0.0002,
      lng: a.position.lng + (Math.random() - 0.5) * 0.0002,
      altitudeM: jitter(a.position.altitudeM, 1, 0, 400),
    },
  };
}

// ── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useFleetSimulation
 *
 * Provides live-updating simulated telemetry for the fleet overview.
 * Ticks every 2 seconds. No network calls. No hardware interaction.
 */
export function useFleetSimulation(): FleetOverview {
  const [fleet, setFleet] = useState<FleetOverview>({
    aircraft: INITIAL_AIRCRAFT,
    missions: INITIAL_MISSIONS,
    lastUpdatedAt: Date.now(),
  });

  const tick = useCallback(() => {
    setFleet((prev) => ({
      ...prev,
      aircraft: prev.aircraft.map(tickAircraft),
      lastUpdatedAt: Date.now(),
    }));
  }, []);

  useEffect(() => {
    const id = setInterval(tick, 2000);
    return () => clearInterval(id);
  }, [tick]);

  return fleet;
}
