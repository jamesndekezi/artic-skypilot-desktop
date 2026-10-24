import "@testing-library/jest-dom";
import React from "react";
import { vi } from "vitest";

// Silence Tauri IPC calls in tests — the Tauri bridge isn't present in jsdom.
// Any component that calls `invoke()` will get a resolved promise with undefined.
Object.defineProperty(window, "__TAURI_INTERNALS__", {
  value: {
    invoke: () => Promise.resolve(undefined),
    transformCallback: () => 0,
  },
  writable: true,
});

// Suppress matchMedia warnings from jsdom (Tailwind responsive utilities)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock @react-three/fiber: replace Canvas with a plain div wrapper
// so FlightSimulatorPage renders without a WebGL context in tests.
vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "r3f-canvas" }, children),
  useFrame: () => undefined,
  useThree: () => ({ gl: { setClearColor: () => undefined } }),
}));

// Mock @react-three/drei: replace all named exports with no-op components/functions
vi.mock("@react-three/drei", () => ({
  OrbitControls: () => null,
  Grid: () => null,
  Line: () => null,
  Html: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
}));

// Mock three: provide minimal stubs for classes used in FlightScene.tsx
vi.mock("three", async () => {
  const actual = await vi.importActual<typeof import("three")>("three");
  return {
    ...actual,
    WebGLRenderer: class {
      setClearColor() {}
      setSize() {}
      render() {}
      dispose() {}
      domElement = document.createElement("canvas");
    },
  };
});
