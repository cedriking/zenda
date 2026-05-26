// Load test script for Zenda API
// Run with: bun run api/src/scripts/load-test.ts
// Simulates 100 concurrent workspaces making typical requests

const API_BASE = process.env.API_BASE ?? "http://localhost:3001";
const CONCURRENT_WORKSPACES = 100;
const REQUESTS_PER_WORKSPACE = 10;

async function signupWorkspace(
  idx: number
): Promise<{ token: string; workspaceId: string }> {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: `loadtest-${idx}@test.com`,
      password: "LoadTest123!",
      name: `Load Test Business ${idx}`,
    }),
  });

  if (!res.ok) {
    throw new Error(`Signup failed: ${res.status}`);
  }
  const data = await res.json();
  return { token: data.accessToken, workspaceId: data.workspace?.id };
}

async function simulateWorkspace(
  token: string,
  _idx: number
): Promise<{ success: number; errors: number }> {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  let success = 0;
  let errors = 0;

  for (let i = 0; i < REQUESTS_PER_WORKSPACE; i++) {
    try {
      const endpoints = [
        () => fetch(`${API_BASE}/appointments`, { headers }),
        () => fetch(`${API_BASE}/conversations`, { headers }),
        () => fetch(`${API_BASE}/services`, { headers }),
        () => fetch(`${API_BASE}/business/profile`, { headers }),
        () => fetch(`${API_BASE}/usage`, { headers }),
      ];

      const fn = endpoints[Math.floor(Math.random() * endpoints.length)];
      const res = await fn();
      if (res.ok) {
        success++;
      } else {
        errors++;
      }
    } catch {
      errors++;
    }
  }

  return { success, errors };
}

async function main() {
  console.log(
    `Starting load test: ${CONCURRENT_WORKSPACES} workspaces x ${REQUESTS_PER_WORKSPACE} requests`
  );
  const startTime = Date.now();

  // Sign up workspaces in batches
  console.log("Creating test accounts...");
  const batchSize = 10;
  const allTokens: Array<{ token: string; workspaceId: string }> = [];

  for (let i = 0; i < CONCURRENT_WORKSPACES; i += batchSize) {
    const batch = Array.from(
      { length: Math.min(batchSize, CONCURRENT_WORKSPACES - i) },
      (_, j) => signupWorkspace(i + j)
    );
    const results = await Promise.allSettled(batch);
    for (const r of results) {
      if (r.status === "fulfilled") {
        allTokens.push(r.value);
      }
    }
  }
  console.log(`Created ${allTokens.length} accounts`);

  // Run concurrent requests
  console.log("Simulating load...");
  const results = await Promise.all(
    allTokens.map((t, idx) => simulateWorkspace(t.token, idx))
  );

  const totalSuccess = results.reduce((sum, r) => sum + r.success, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);
  const duration = (Date.now() - startTime) / 1000;
  const totalRequests = totalSuccess + totalErrors;

  console.log("\n=== Load Test Results ===");
  console.log(`Duration: ${duration.toFixed(1)}s`);
  console.log(`Total requests: ${totalRequests}`);
  console.log(
    `Success: ${totalSuccess} (${((totalSuccess / totalRequests) * 100).toFixed(1)}%)`
  );
  console.log(
    `Errors: ${totalErrors} (${((totalErrors / totalRequests) * 100).toFixed(1)}%)`
  );
  console.log(`Requests/sec: ${(totalRequests / duration).toFixed(1)}`);
  console.log(
    `Avg response time: ${((duration * 1000) / totalRequests).toFixed(0)}ms`
  );
}

main().catch(console.error);
