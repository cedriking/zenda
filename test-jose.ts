// Simulate the exact extraction code from appPlugin
const payload = {
  sub: "30aaf0a1-b992-42a4-b1b3-d0fe1511be41",
  workspaceId: "5f6eef6a-66dd-45f2-a11a-b1a4b0094bd5",
  exp: 1777437732,
  iat: 1777434132
}

const userId = (payload.sub as string) ?? null
const workspaceId = (payload as Record<string, unknown>).workspaceId as string ?? null

console.log('userId:', JSON.stringify(userId))
console.log('workspaceId:', JSON.stringify(workspaceId))

// Test what happens with the actual runtime expression (as is erased)
const wsId2 = payload.workspaceId ?? null
console.log('wsId2 (no casting):', JSON.stringify(wsId2))

// Test with explicit null check
const wsId3 = payload.workspaceId ? String(payload.workspaceId) : null
console.log('wsId3 (explicit):', JSON.stringify(wsId3))

// Test with default value
const wsId4 = payload.workspaceId || null
console.log('wsId4 (|| null):', JSON.stringify(wsId4))
