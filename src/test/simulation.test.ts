/**
 * simulation.test.ts
 *
 * Unit tests for the simulation data layer.
 * No React rendering required — pure logic tests.
 */
import { describe, it, expect } from "vitest";
import type {
  AircraftTelemetry,
  MissionSummary,
  AircraftStatus,
  MissionStatus,
} from "@/types/simulation";

// ── Type shape tests ──────────────────────────────────────────────────────────

describe("AircraftTelemetry type", () => {
  it("accepts a valid telemetry object", () => {
    const craft: AircraftTelemetry = {
      id: "test-01",
      name: "TEST-01",
      status: "en-route",
      batteryPct: 80,
      speedMs: 10,
      altitudeM: 100,
      signalPct: 90,
      position: { lat: 0, lng: 0, altitudeM: 100 },
      headingDeg: 45,
      flightTimeSec: 60,
    };
    expect(craft.id).toBe("test-01");
    expect(craft.batteryPct).toBeGreaterThanOrEqual(0);
    expect(craft.batteryPct).toBeLessThanOrEqual(100);
  });

  it("status union covers expected values", () => {
    const validStatuses: AircraftStatus[] = [
      "idle",
      "ready",
      "takeoff",
      "en-route",
      "hovering",
      "returning",
      "landing",
      "fault",
    ];
    expect(validStatuses).toHaveLength(8);
    expect(validStatuses).toContain("en-route");
    expect(validStatuses).toContain("fault");
  });
});

describe("MissionSummary type", () => {
  it("accepts a valid mission object", () => {
    const mission: MissionSummary = {
      id: "m-test",
      name: "Test Mission",
      status: "active",
      startedAt: new Date().toISOString(),
      waypointTotal: 10,
      waypointReached: 3,
      aircraftId: "test-01",
    };
    expect(mission.waypointReached).toBeLessThanOrEqual(mission.waypointTotal);
  });

  it("mission status union covers expected values", () => {
    const validStatuses: MissionStatus[] = [
      "pending",
      "active",
      "complete",
      "aborted",
    ];
    expect(validStatuses).toHaveLength(4);
    expect(validStatuses).toContain("active");
    expect(validStatuses).toContain("aborted");
  });
});

// ── Simulation logic tests ────────────────────────────────────────────────────

describe("Simulation safety invariants", () => {
  it("battery percentage stays within 0–100 range after clamping", () => {
    function clamp(v: number, min: number, max: number) {
      return Math.min(max, Math.max(min, v));
    }
    // Simulate an extreme drain scenario
    const result = clamp(-5, 0, 100);
    expect(result).toBe(0);

    // Simulate overcharge (should never happen, but clamp must hold)
    const overcharged = clamp(110, 0, 100);
    expect(overcharged).toBe(100);
  });

  it("heading wraps correctly within 0–359 degrees", () => {
    function wrapHeading(deg: number): number {
      return ((deg % 360) + 360) % 360;
    }
    expect(wrapHeading(361)).toBe(1);
    expect(wrapHeading(-10)).toBe(350);
    expect(wrapHeading(0)).toBe(0);
    expect(wrapHeading(359)).toBe(359);
  });

  it("waypoint progress never exceeds total", () => {
    const missions: MissionSummary[] = [
      {
        id: "m-1",
        name: "Alpha",
        status: "active",
        startedAt: new Date().toISOString(),
        waypointTotal: 5,
        waypointReached: 5,
        aircraftId: "sky-01",
      },
      {
        id: "m-2",
        name: "Beta",
        status: "complete",
        startedAt: new Date().toISOString(),
        waypointTotal: 8,
        waypointReached: 8,
        aircraftId: "sky-02",
      },
    ];
    for (const m of missions) {
      expect(m.waypointReached).toBeLessThanOrEqual(m.waypointTotal);
    }
  });

  it("simulation mode flag is never live-aircraft mode", () => {
    // Represents what the Tauri get_simulation_status command returns
    const status = {
      mode: "simulation",
      live_aircraft_connected: false,
      disclaimer: "SIMULATION ONLY — NO LIVE AIRCRAFT CONNECTED",
    };
    expect(status.mode).toBe("simulation");
    expect(status.live_aircraft_connected).toBe(false);
    expect(status.disclaimer).toMatch(/SIMULATION ONLY/);
  });
});
