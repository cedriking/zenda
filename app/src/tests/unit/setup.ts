import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock the IPC manager so components that call ipc.client.* don't explode in jsdom.
// The real IPC manager posts MessagePort messages which don't exist in test env.
vi.mock("@/ipc/manager", () => ({
  ipc: {
    client: {
      theme: {
        toggleThemeMode: vi.fn().mockResolvedValue(true),
        setThemeMode: vi.fn().mockResolvedValue(undefined),
        getCurrentThemeMode: vi.fn().mockResolvedValue("light"),
      },
    },
  },
}));
