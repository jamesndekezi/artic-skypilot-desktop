/**
 * A.R.T.I.C SkyPilot — Simulation type definitions
 *
 * ALL values here are synthetic / simulated.
 * No real aircraft hardware is addressed or commanded.
 */

export type AircraftStatus =
  | "idle"
  | "ready"
  | "takeoff"
  | "en-route"
  | "hovering"
  | "returning"
  | "landing"
  | "fault";

export type MissionStatus = "pending" | "active" | "complete" | "aborted";

export interface GpsCoordinate {
  lat: number;
  lng: number;
  altitudeM: number;
}

export interface AircraftTelemetry {
  /** Unique identifier within the simulation */
  id: string;
  /** Human-readable name e.g. "SKY-01" */
  name: string;
  status: AircraftStatus;
  /** Battery state of charge 0–100 */
  batteryPct: number;
  /** Airspeed in m/s */
  speedMs: number;
  /** Altitude in metres AGL */
  altitudeM: number;
  /** Signal strength 0–100 */
  signalPct: number;
  /** Simulated GPS position */
  position: GpsCoordinate;
  /** Current heading 0–359 degrees */
  headingDeg: number;
  /** Simulated flight time in seconds */
  flightTimeSec: number;
}

export interface MissionSummary {
  id: string;
  name: string;
  status: MissionStatus;
  /** ISO timestamp string */
  startedAt: string;
  /** Waypoints total */
  waypointTotal: number;
  /** Waypoints reached */
  waypointReached: number;
  /** Assigned aircraft id */
  aircraftId: string;
}

export interface FleetOverview {
  aircraft: AircraftTelemetry[];
  missions: MissionSummary[];
  /** Unix timestamp (ms) of last simulated data refresh */
  lastUpdatedAt: number;
}
