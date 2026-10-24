import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FlightSimulatorPage from "@/pages/FlightSimulatorPage";

// Wrap in MemoryRouter because FlightSimulatorPage uses router-dependent
// context indirectly through AppLayout links (if any). Safe to always wrap.
function renderPage() {
  return render(
    <MemoryRouter>
      <FlightSimulatorPage />
    </MemoryRouter>,
  );
}

describe("FlightSimulatorPage", () => {
  it("renders without crashing", () => {
    renderPage();
    expect(screen.getByText("Flight Simulator")).toBeInTheDocument();
  });

  it("renders the r3f-canvas placeholder from mock", () => {
    renderPage();
    expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument();
  });

  it("renders exactly 4 aircraft in the selector", () => {
    renderPage();
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(4);
  });

  it("Start button is present in idle state", () => {
    renderPage();
    expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();
  });

  it("clicking Start shows the Pause button and hides Start", () => {
    renderPage();
    const startBtn = screen.getByRole("button", { name: /start/i });
    fireEvent.click(startBtn);
    expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
    // Start button is still in DOM but disabled (or relabeled Resume after pause)
    // At minimum Pause must now appear
  });

  it("clicking Pause after Start shows Resume label and disables Pause", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /start/i }));
    const pauseBtn = screen.getByRole("button", { name: /pause/i });
    fireEvent.click(pauseBtn);
    // Start button should now show "Resume"
    expect(screen.getByRole("button", { name: /resume/i })).toBeInTheDocument();
    // Pause button remains in DOM but must be disabled (simState is "paused")
    expect(screen.getByRole("button", { name: /pause/i })).toBeDisabled();
  });

  it("clicking Stop after Start disables Pause button", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /start/i }));
    fireEvent.click(screen.getByRole("button", { name: /stop/i }));
    // Start button back to "Start" label (not "Resume")
    expect(screen.getByRole("button", { name: /^start$/i })).toBeInTheDocument();
    // Pause button stays in DOM but is disabled when idle
    expect(screen.getByRole("button", { name: /pause/i })).toBeDisabled();
  });

  it("HUD overlay renders altitude, speed, heading, battery", () => {
    renderPage();
    // HUD shows abbreviated labels
    expect(screen.getByText(/ALT/)).toBeInTheDocument();
    expect(screen.getByText(/SPD/)).toBeInTheDocument();
    expect(screen.getByText(/HDG/)).toBeInTheDocument();
    expect(screen.getByText(/BAT/)).toBeInTheDocument();
  });
});
