# A.R.T.I.C SkyPilot Desktop

> **⚠ SIMULATION ONLY — NO LIVE AIRCRAFT CONNECTED**
> All flight behaviour in this application is synthetic. No hardware commands,
> ESC signals, motor outputs, or real drone connections are made.

A desktop application for drone fleet management and simulation, built with
**Tauri 2 · React 18 · TypeScript · Vite · Tailwind CSS**.

---

## Prerequisites

| Tool | Minimum version | Install |
|------|----------------|---------|
| Node.js | 20 LTS | [nodejs.org](https://nodejs.org) |
| npm | 10 | bundled with Node |
| Rust + Cargo | 1.77.2 | [rustup.rs](https://rustup.rs) ← **required for Tauri build** |
| WebView2 (Windows) | latest | [Microsoft](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) |

> **Note:** Rust is only needed to compile the native Tauri shell.
> The React/Vite frontend runs independently with `npm run dev` without Rust.

---

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Run the frontend only (no Rust required)
npm run dev
# → opens http://localhost:1420

# 3. Run with Tauri native window (requires Rust + Cargo)
npm run tauri dev

# 4. Build a distributable installer (requires Rust + Cargo)
npm run tauri build
```

---

## Running tests

```bash
# Single run (CI-friendly)
npm test

# Watch mode (development)
npm run test:watch

# Coverage report
npx vitest run --coverage
```

---

## Project structure

```
artic-skypilot-desktop/
├── src/
│   ├── components/
│   │   ├── layout/          # AppLayout, Sidebar, TopBar, SimulationBanner
│   │   └── ui/              # TelemetryCard, MissionRow, StatSummaryBar
│   ├── hooks/
│   │   ├── useFleetSimulation.ts   # Simulated telemetry ticker
│   │   └── useSimulationClock.ts   # UTC clock for TopBar
│   ├── pages/
│   │   ├── OverviewPage.tsx         ✅ implemented
│   │   ├── FlightSimulatorPage.tsx  ⚠  partial
│   │   ├── MissionPlannerPage.tsx   🔲 not yet implemented
│   │   ├── FlightLogsPage.tsx       🔲 not yet implemented
│   │   └── SettingsPage.tsx         ✅ implemented (read-only)
│   ├── types/
│   │   └── simulation.ts    # AircraftTelemetry, MissionSummary, etc.
│   ├── test/
│   │   └── setup.ts         # Vitest + Testing Library config
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── src-tauri/               # Rust/Tauri backend
│   ├── src/
│   │   ├── main.rs
│   │   └── lib.rs           # greet + get_simulation_status IPC commands
│   ├── Cargo.toml
│   └── tauri.conf.json
├── public/
│   └── artic-logo.svg
├── index.html
├── package.json
├── vite.config.ts
├── vitest.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## Module status

| Module | Status | Notes |
|--------|--------|-------|
| Overview | ✅ Working | Simulated telemetry, auto-refreshes every 2 s |
| Flight Simulator | ⚠ Partial | Controls + readout work; 3-D viewport not built |
| Mission Planner | 🔲 Planned | Interactive map, waypoint editor |
| Flight Logs | 🔲 Planned | Persistent storage, replay, export |
| Settings | ✅ Working | Read-only; persistence not yet wired |

---

## Safety policy

This codebase **does not and must not** send commands to real aircraft hardware.
The simulation banner is non-dismissable by design. If you ever extend this
application to interface with live hardware, create a separate, clearly
gated hardware-interface module and conduct a full safety review before
enabling it.

---

## License

MIT © A.R.T.I.C Team
