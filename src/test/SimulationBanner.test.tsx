/**
 * SimulationBanner.test.tsx
 *
 * Verifies the persistent safety notice is always rendered and
 * carries the correct accessible text.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SimulationBanner from "@/components/layout/SimulationBanner";

describe("SimulationBanner", () => {
  it("renders the simulation warning text", () => {
    render(<SimulationBanner />);
    expect(
      screen.getByText(/SIMULATION ONLY — NO LIVE AIRCRAFT CONNECTED/i),
    ).toBeInTheDocument();
  });

  it("has role=alert so screen readers announce it", () => {
    render(<SimulationBanner />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("does not render a dismiss button", () => {
    render(<SimulationBanner />);
    expect(
      screen.queryByRole("button", { name: /dismiss|close|hide/i }),
    ).not.toBeInTheDocument();
  });
});
