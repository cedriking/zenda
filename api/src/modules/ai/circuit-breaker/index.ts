import { logger } from '../../../infra/logger.js'

interface CircuitState {
  failures: number
  halfOpenInFlight: number
  lastFailure: number
  state: 'closed' | 'open' | 'half-open'
  nextRetry: number
}

const FAILURE_THRESHOLD = 5
const OPEN_DURATION = 60_000 // 1 minute
const HALF_OPEN_MAX_CALLS = 1

const circuits = new Map<string, CircuitState>()

function getCircuit(provider: string): CircuitState {
  if (!circuits.has(provider)) {
    circuits.set(provider, {
      failures: 0,
      halfOpenInFlight: 0,
      lastFailure: 0,
      state: 'closed',
      nextRetry: 0,
    })
  }
  return circuits.get(provider)!
}

export function isProviderHealthy(provider: string): boolean {
  const circuit = getCircuit(provider)

  if (circuit.state === 'closed') return true
  if (circuit.state === 'open') {
    // Check if we should transition to half-open
    if (Date.now() >= circuit.nextRetry) {
      circuit.state = 'half-open'
      circuit.halfOpenInFlight = 0
      logger.info('Circuit breaker: half-open', { provider })
      return true
    }
    return false
  }
  // half-open: allow only HALF_OPEN_MAX_CALLS concurrent calls
  if (circuit.halfOpenInFlight >= HALF_OPEN_MAX_CALLS) {
    return false
  }
  circuit.halfOpenInFlight++
  return true
}

export function recordSuccess(provider: string): void {
  const circuit = getCircuit(provider)
  if (circuit.state === 'half-open') {
    circuit.halfOpenInFlight = Math.max(0, circuit.halfOpenInFlight - 1)
    circuit.state = 'closed'
    circuit.failures = 0
    logger.info('Circuit breaker: closed (recovered)', { provider })
  } else {
    // In closed state, success resets failure counter to 0 (not decrement)
    circuit.failures = 0
  }
}

export function recordFailure(provider: string, error?: string): void {
  const circuit = getCircuit(provider)
  circuit.failures++
  if (circuit.state === 'half-open') {
    circuit.halfOpenInFlight = Math.max(0, circuit.halfOpenInFlight - 1)
  }
  circuit.lastFailure = Date.now()

  logger.warn('Circuit breaker: failure recorded', {
    provider,
    failures: circuit.failures,
    error,
  })

  if (circuit.failures >= FAILURE_THRESHOLD) {
    circuit.state = 'open'
    circuit.nextRetry = Date.now() + OPEN_DURATION
    logger.error('Circuit breaker: OPENED', {
      provider,
      failures: circuit.failures,
      retryAt: new Date(circuit.nextRetry).toISOString(),
    })
  }
}

export function getCircuitStatus(): Record<string, { state: string; failures: number }> {
  const status: Record<string, { state: string; failures: number }> = {}
  for (const [provider, circuit] of circuits) {
    status[provider] = { state: circuit.state, failures: circuit.failures }
  }
  return status
}
