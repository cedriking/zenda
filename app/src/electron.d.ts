export {}

declare global {
  interface Window {
    electron?: {
      invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
      on: (channel: string, callback: (...args: unknown[]) => void) => (() => void) | undefined
      send: (channel: string, ...args: unknown[]) => void
    }
  }
}
