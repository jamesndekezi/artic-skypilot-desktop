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

## Stage 2: 3-D Flight Simulator

The Flight Simulator page includes an interactive 3-D viewport powered by
[Three.js](https://threejs.org/), [React Three Fiber](https://docs.pmnd.rs/react-three-fiber),
and [Drei](https://github.com/pmndrs/drei).

### Additional npm dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `three` | 0.169.0 | 3-D rendering engine |
| `@react-three/fiber` | 8.17.10 | React renderer for Three.js |
| `@react-three/drei` | 9.114.3 | Three.js helpers (OrbitControls, Grid, Line, …) |
| `@types/three` | 0.169.0 | TypeScript definitions for three |

### Camera controls

| Action | Input |
|--------|-------|
| Rotate | Left-click drag |
| Pan | Right-click drag |
| Zoom | Scroll wheel |
| Reset camera | Refresh the page (camera reset button planned) |

### Coordinate system

The scene origin corresponds to Nairobi, Kenya (lat −1.2921, lng 36.8219).
One scene unit ≈ 0.001 degree (roughly 111 m at the equator).
Altitude is mapped directly to the Y axis (1 unit = 1 metre).

### Limitations

- All aircraft movement and telemetry are **simulation-only**; no real flight
  data is used.
- Terrain is a flat procedural grid — it is **illustrative only** and does not
  represent real topography, approved routes, or official airspace.
- No physics engine is implemented; aircraft positions interpolate linearly
  between simulated telemetry ticks.
- The viewport requires a browser with WebGL support. If WebGL is unavailable
  the error boundary shows a fallback message.

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
| Flight Simulator | ✅ Working | Interactive 3-D viewport, simulated telemetry, Pause/Resume/Stop controls |
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
