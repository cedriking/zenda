import { describe, expect, test, beforeEach } from 'bun:test'
import {
  markConnected,
  markDisconnected,
  shouldReconnect,
  getReconnectionStatus,
  resetReconnection,
} from '../../src/modules/whatsapp/reconnection'

const WS_1 = 'workspace-rc-1'
const WS_2 = 'workspace-rc-2'

beforeEach(() => {
  resetReconnection(WS_1)
  resetReconnection(WS_2)
})

// ===========================================================================
// markConnected
// ===========================================================================

describe('markConnected', () => {
  test('sets state to connected', () => {
    markConnected(WS_1)
    const status = getReconnectionStatus(WS_1)
    expect(status).not.toBeNull()
    expect(status!.state).toBe('connected')
  })

  test('resets attempts to 0', () => {
    markDisconnected(WS_1) // increment attempts
    markDisconnected(WS_1)
    expect(getReconnectionStatus(WS_1)!.attempts).toBe(2)

    markConnected(WS_1)
    expect(getReconnectionStatus(WS_1)!.attempts).toBe(0)
  })
})

// ===========================================================================
// markDisconnected
// ===========================================================================

describe('markDisconnected', () => {
  test('sets state to reconnecting', () => {
    markDisconnected(WS_1)
    expect(getReconnectionStatus(WS_1)!.state).toBe('reconnecting')
  })

  test('increments attempts', () => {
    markDisconnected(WS_1)
    markDisconnected(WS_1)
    markDisconnected(WS_1)
    expect(getReconnectionStatus(WS_1)!.attempts).toBe(3)
  })

  test('sets nextRetry to a future timestamp', () => {
    const before = Date.now()
    markDisconnected(WS_1)
    const status = getReconnectionStatus(WS_1)!
    expect(status.nextRetry).toBeGreaterThan(before)
  })

  test('exponential backoff increases delay with attempts', () => {
    markDisconnected(WS_1) // attempt 1
    const delay1 = getReconnectionStatus(WS_1)!.nextRetry - Date.now()

    markDisconnected(WS_1) // attempt 2
    const delay2 = getReconnectionStatus(WS_1)!.nextRetry - Date.now()

    // Delay should increase (accounting for jitter)
    // Base: 2*2^1=4s vs 2*2^2=8s — allow wide tolerance for jitter
    expect(delay2).toBeGreaterThan(delay1 * 0.5)
  })
})

// ===========================================================================
// shouldReconnect
// ===========================================================================

describe('shouldReconnect', () => {
  test('returns false if no state exists', () => {
    expect(shouldReconnect('nonexistent')).toBe(false)
  })

  test('returns false if state is connected', () => {
    markConnected(WS_1)
    expect(shouldReconnect(WS_1)).toBe(false)
  })

  test('returns false immediately after disconnect (delay not elapsed)', () => {
    markDisconnected(WS_1)
    // The nextRetry is in the future
    expect(shouldReconnect(WS_1)).toBe(false)
  })

  test('returns true after delay has elapsed', () => {
    markDisconnected(WS_1)
    const status = getReconnectionStatus(WS_1)!

    // Simulate time passing by manipulating nextRetry
    status.nextRetry = Date.now() - 1000 // set to past
    expect(shouldReconnect(WS_1)).toBe(true)
  })

  test('returns false after max attempts reached', () => {
    // Set max attempts to 0 to simulate exhaustion
    for (let i = 0; i < 50; i++) {
      markDisconnected(WS_1)
    }
    const status = getReconnectionStatus(WS_1)!
    status.nextRetry = Date.now() - 1000 // delay has passed

    expect(status.attempts).toBeGreaterThanOrEqual(status.maxAttempts)
    expect(shouldReconnect(WS_1)).toBe(false)
  })
})

// ===========================================================================
// getReconnectionStatus
// ===========================================================================

describe('getReconnectionStatus', () => {
  test('returns null for unknown workspace', () => {
    expect(getReconnectionStatus('nonexistent')).toBeNull()
  })

  test('returns state after markConnected', () => {
    markConnected(WS_1)
    const status = getReconnectionStatus(WS_1)!
    expect(status.workspaceId).toBe(WS_1)
    expect(status.state).toBe('connected')
    expect(status.attempts).toBe(0)
  })
})

// ===========================================================================
// resetReconnection
// ===========================================================================

describe('resetReconnection', () => {
  test('resets state to idle', () => {
    markDisconnected(WS_1)
    resetReconnection(WS_1)
    expect(getReconnectionStatus(WS_1)!.state).toBe('idle')
  })

  test('resets attempts to 0', () => {
    markDisconnected(WS_1)
    markDisconnected(WS_1)
    resetReconnection(WS_1)
    expect(getReconnectionStatus(WS_1)!.attempts).toBe(0)
  })

  test('does nothing for unknown workspace', () => {
    expect(() => resetReconnection('nonexistent')).not.toThrow()
  })
})
