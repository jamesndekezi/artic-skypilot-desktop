import "@testing-library/jest-dom";

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
