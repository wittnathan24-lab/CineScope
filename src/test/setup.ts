import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
// Node 25 exposes an incomplete native localStorage in the test worker.
// Supply the browser Storage contract explicitly for deterministic tests.
const values = new Map<string, string>();
const storage: Storage = {
  get length() {
    return values.size;
  },
  clear: () => values.clear(),
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => {
    values.set(key, String(value));
  },
  removeItem: (key) => {
    values.delete(key);
  },
  key: (index) => [...values.keys()][index] ?? null,
};
Object.defineProperty(globalThis, "localStorage", {
  value: storage,
  configurable: true,
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});
window.scrollTo = () => {};
