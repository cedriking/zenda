/**
 * Agent Health Monitor — periodic health checks for system agents.
 *
 * Runs every 30 minutes, checks each registered agent, records health events,
 * alerts on state transitions (healthy → error), and optionally auto-recovers
 * transient failures.
 *
 * Architecture:
 *   - Agents are registered in-code (add to AGENT_REGISTRY below)
 *   - Each agent has a `check()` that returns its current status
 *   - State transitions are persisted to agent_health_events table
 *   - Alerts fire as in-app notifications via the existing notification system
 *   - Auto-recovery attempts a restart for transient errors (max 3 retries)
 */
import { db } from "@zenda/db/client";
import { logger } from "../../infra/logger.js";
import { createNotification } from "../notification/service.js";

// ── Types ──────────────────────────────────────────────────────────

export type AgentHealthStatus =
  | "healthy"
  | "degraded"
  | "error"
  | "unknown"
  | "recovering";

export interface AgentHealthCheckResult {
  details?: Record<string, unknown>;
  error?: string;
  latencyMs?: number;
  status: AgentHealthStatus;
}

export interface AgentDescriptor {
  /** Health check function — returns current status */
  check: () => Promise<AgentHealthCheckResult>;
  /** Human-readable label for notifications */
  label: string;
  /** Unique name for the agent (e.g. "ai-conversation", "whatsapp-bridge") */
  name: string;
  /** Optional recovery function — called when auto-recovery is triggered */
  recover?: () => Promise<boolean>;
}

// ── In-memory state ────────────────────────────────────────────────

const lastKnownStatus = new Map<string, AgentHealthStatus>();
const recoveryAttempts = new Map<string, number>();
const MAX_RECOVERY_ATTEMPTS = 3;

// ── Agent Registry ─────────────────────────────────────────────────
// Add new agents here as the system grows.

const AGENT_REGISTRY: AgentDescriptor[] = [
  {
    name: "ai-conversation",
    label: "AI Conversation Agent",
    check: checkAiConversation,
  },
  {
    name: "circuit-breaker",
    label: "AI Provider Circuit Breaker",
    check: checkCircuitBreaker,
  },
  {
    name: "outbound-queue",
    label: "Outbound Message Queue",
    check: checkOutboundQueue,
  },
  {
    name: "database",
    label: "Database",
    check: checkDatabase,
  },
];

// ── Health check implementations ───────────────────────────────────

async function checkAiConversation(): Promise<AgentHealthCheckResult> {
  try {
    // The AI agent itself is stateless — we verify the provider router is functional
    // by checking that at least one provider circuit breaker is not permanently open
    const { getCircuitStatus } = await import("../ai/circuit-breaker/index.js");
    const circuits = getCircuitStatus();

    const providers = Object.entries(circuits);
    if (providers.length === 0) {
      // No circuits seen yet = no calls made = healthy (not yet exercised)
      return { status: "healthy" };
    }

    const allOpen = providers.every(([, c]) => c.state === "open");
    if (allOpen) {
      return {
        status: "error",
        error: "All AI provider circuit breakers are open",
        details: circuits as Record<string, unknown>,
      };
    }

    const anyDegraded = providers.some(
      ([, c]) => c.state === "half-open" || c.failures > 2
    );
    return {
      status: anyDegraded ? "degraded" : "healthy",
      details: circuits as Record<string, unknown>,
    };
  } catch (err) {
    return { status: "error", error: (err as Error).message };
  }
}

async function checkCircuitBreaker(): Promise<AgentHealthCheckResult> {
  try {
    const { getCircuitStatus } = await import("../ai/circuit-breaker/index.js");
    const circuits = getCircuitStatus();
    const entries = Object.entries(circuits);

    if (entries.length === 0) {
      return { status: "healthy" };
    }

    const hasOpen = entries.some(([, c]) => c.state === "open");
    if (hasOpen) {
      return {
        status: "degraded",
        details: circuits as Record<string, unknown>,
      };
    }

    return { status: "healthy", details: circuits as Record<string, unknown> };
  } catch (err) {
    return { status: "error", error: (err as Error).message };
  }
}

async function checkOutboundQueue(): Promise<AgentHealthCheckResult> {
  try {
    const result: Array<{ pending: bigint; failed: bigint }> =
      await db.$queryRaw`
        SELECT
          count(*) FILTER (WHERE status = 'pending') AS pending,
          count(*) FILTER (WHERE status = 'failed') AS failed
        FROM outbound_queue
      `;
    const row = result[0];
    const pending = Number(row?.pending ?? 0);
    const failed = Number(row?.failed ?? 0);

    if (failed > 50) {
      return {
        status: "error",
        error: `${failed} failed messages in outbound queue`,
        details: { pending, failed },
      };
    }

    if (pending > 200) {
      return {
        status: "degraded",
        details: { pending, failed },
      };
    }

    return { status: "healthy", details: { pending, failed } };
  } catch (err) {
    return { status: "error", error: (err as Error).message };
  }
}

async function checkDatabase(): Promise<AgentHealthCheckResult> {
  try {
    const start = Date.now();
    await db.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - start;

    if (latencyMs > 2000) {
      return {
        status: "degraded",
        latencyMs,
        error: `Database latency high: ${latencyMs}ms`,
      };
    }

    return { status: "healthy", latencyMs };
  } catch (err) {
    return { status: "error", error: (err as Error).message };
  }
}

// ── Core monitoring loop ───────────────────────────────────────────

export async function runHealthCheckCycle(): Promise<{
  checked: number;
  alerts: number;
  recovered: number;
}> {
  let checked = 0;
  let alerts = 0;
  let recovered = 0;

  for (const agent of AGENT_REGISTRY) {
    checked++;
    try {
      const result = await agent.check();
      const previousStatus = lastKnownStatus.get(agent.name) ?? "unknown";

      // Record the event
      await db.agentHealthEvent.create({
        data: {
          agentName: agent.name,
          status: result.status,
          previousStatus,
          details: result.details ?? null,
          latencyMs: result.latencyMs ?? null,
          error: result.error ?? null,
        },
      });

      // Update in-memory state
      lastKnownStatus.set(agent.name, result.status);

      // Detect state transitions
      const transitioned = previousStatus !== result.status;
      if (transitioned) {
        logger.info("Agent health transition", {
          agent: agent.name,
          from: previousStatus,
          to: result.status,
        });

        // Alert on error transitions
        if (result.status === "error" && previousStatus !== "error") {
          alerts++;
          await sendAlert(agent, result);
          // Attempt auto-recovery
          if (agent.recover) {
            const attempts = recoveryAttempts.get(agent.name) ?? 0;
            if (attempts < MAX_RECOVERY_ATTEMPTS) {
              recoveryAttempts.set(agent.name, attempts + 1);
              logger.info("Attempting auto-recovery", {
                agent: agent.name,
                attempt: attempts + 1,
              });
              try {
                const success = await agent.recover();
                if (success) {
                  recovered++;
                  recoveryAttempts.delete(agent.name);
                  logger.info("Auto-recovery succeeded", { agent: agent.name });
                }
              } catch (err) {
                logger.error("Auto-recovery failed", {
                  agent: agent.name,
                  error: (err as Error).message,
                });
              }
            }
          }
        }

        // Clear recovery counter on recovery
        if (result.status === "healthy" && previousStatus === "error") {
          recoveryAttempts.delete(agent.name);
        }
      }
    } catch (err) {
      logger.error("Health check failed for agent", {
        agent: agent.name,
        error: (err as Error).message,
      });
    }
  }

  return { checked, alerts, recovered };
}

// ── Alerting ───────────────────────────────────────────────────────

async function sendAlert(
  agent: AgentDescriptor,
  result: AgentHealthCheckResult
): Promise<void> {
  try {
    // Find workspaces to alert — notify all workspaces with active WhatsApp connections
    const activeWorkspaces: Array<{ workspace_id: string }> =
      await db.$queryRaw`
        SELECT DISTINCT workspace_id
        FROM whatsapp_connections
        WHERE status = 'connected'
        LIMIT 50
      `;

    if (activeWorkspaces.length === 0) {
      logger.warn("No active workspaces to send agent health alert", {
        agent: agent.name,
      });
      return;
    }

    // Send one notification per workspace (batch, don't await each)
    const promises = activeWorkspaces.map(({ workspace_id }) =>
      createNotification({
        workspaceId: workspace_id,
        type: "agent_error",
        title: `${agent.label} — Error Detected`,
        body:
          result.error ??
          `Agent "${agent.name}" transitioned to error state. Investigation recommended.`,
        relatedId: agent.name,
      }).catch((err) =>
        logger.error("Failed to send agent health notification", {
          workspace: workspace_id,
          error: (err as Error).message,
        })
      )
    );

    await Promise.allSettled(promises);
    logger.info("Agent health alerts sent", {
      agent: agent.name,
      count: activeWorkspaces.length,
    });
  } catch (err) {
    logger.error("Failed to send agent health alert", {
      agent: agent.name,
      error: (err as Error).message,
    });
  }
}

// ── Query helpers ──────────────────────────────────────────────────

export async function getAgentHealthHistory(agentName?: string, limit = 100) {
  return db.agentHealthEvent.findMany({
    where: agentName ? { agentName } : undefined,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getAgentStatusSummary(): Promise<
  Record<string, { status: AgentHealthStatus; lastChecked: string | null }>
> {
  const result: Record<
    string,
    { status: AgentHealthStatus; lastChecked: string | null }
  > = {};

  // Initialize all registered agents
  for (const agent of AGENT_REGISTRY) {
    result[agent.name] = {
      status: lastKnownStatus.get(agent.name) ?? "unknown",
      lastChecked: null,
    };
  }

  // Fetch latest event per agent
  for (const agent of AGENT_REGISTRY) {
    const latest = await db.agentHealthEvent.findFirst({
      where: { agentName: agent.name },
      orderBy: { createdAt: "desc" },
    });

    if (latest) {
      result[agent.name] = {
        status: latest.status as AgentHealthStatus,
        lastChecked: latest.createdAt?.toISOString() ?? null,
      };
    }
  }

  return result;
}

// ── Register additional agents at runtime ──────────────────────────

export function registerAgent(descriptor: AgentDescriptor): void {
  const existing = AGENT_REGISTRY.findIndex((a) => a.name === descriptor.name);
  if (existing >= 0) {
    AGENT_REGISTRY[existing] = descriptor;
    logger.info("Agent health monitor: updated agent", {
      name: descriptor.name,
    });
  } else {
    AGENT_REGISTRY.push(descriptor);
    logger.info("Agent health monitor: registered agent", {
      name: descriptor.name,
    });
  }
}
