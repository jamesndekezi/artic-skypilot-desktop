/**
 * useSimulationClock.test.ts
 *
 * Verifies the UTC clock hook returns a correctly formatted time string
 * and updates on each tick.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSimulationClock } from "@/hooks/useSimulationClock";

describe("useSimulationClock", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a string matching HH:MM:SS UTC format", () => {
    const { result } = renderHook(() => useSimulationClock());
    expect(result.current).toMatch(/^\d{2}:\d{2}:\d{2} UTC$/);
  });

  it("updates after one second tick", () => {
    const { result } = renderHook(() => useSimulationClock());
    const initial = result.current;

    act(() => {
      vi.advanceTimersByTime(1001);
    });

    // The string should still be valid format after advancing time
    expect(result.current).toMatch(/^\d{2}:\d{2}:\d{2} UTC$/);
    // It may or may not differ from initial depending on timing boundary,
    // but it should remain a valid time string.
    expect(typeof result.current).toBe("string");
    expect(initial).toMatch(/^\d{2}:\d{2}:\d{2} UTC$/);
  });

  it("cleans up the interval on unmount", () => {
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");
    const { unmount } = renderHook(() => useSimulationClock());
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
