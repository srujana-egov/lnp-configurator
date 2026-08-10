import { spawn, type ChildProcess } from 'node:child_process'

// Codifies the exact manual regression sequence run live against this
// backend: a Workflow turn referencing a role that doesn't exist yet gets
// flagged by the Reference Resolver; adding the role clears it; touching
// Workflow again on a later turn doesn't regenerate ids for untouched
// states (reconcileIds.ts); highlightPaths stays precise per turn, not just
// "whichever domain the router picked" (diff.ts). Also checks the
// shared-secret auth gate actually rejects an unauthenticated request.
//
// Self-contained: spawns its own server instance (so `npm run smoke` works
// standalone, locally or in CI) rather than assuming one is already
// running. Makes real calls to the OpenAI API — this is a real integration
// check, not a mock — so it needs a real OPENAI_API_KEY and costs a small
// amount to run; that's why it's wired to CI as a manual/scheduled trigger,
// not on every push (see .github/workflows/ci.yml).

const PORT = process.env.PORT ?? '8787'
const BASE_URL = `http://localhost:${PORT}`
const SECRET = process.env.API_SHARED_SECRET
if (!SECRET) {
  console.error('API_SHARED_SECRET must be set to run the smoke test (see .env.example).')
  process.exit(1)
}
const AUTH_HEADERS = { Authorization: `Bearer ${SECRET}` }

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(`FAILED: ${message}`)
}

async function waitForHealth(child: ChildProcess, timeoutMs = 20_000): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Server process exited early with code ${child.exitCode} before becoming healthy`)
    }
    try {
      const res = await fetch(`${BASE_URL}/api/health`)
      if (res.ok) return
    } catch {
      // Not up yet — keep polling.
    }
    await new Promise((r) => setTimeout(r, 300))
  }
  throw new Error('Server did not become healthy in time')
}

async function postJson(path: string, body: unknown) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...AUTH_HEADERS },
    body: JSON.stringify(body),
  })
  return { status: res.status, body: await res.json() }
}

async function postTurn(sessionId: string, message: string) {
  const formData = new FormData()
  formData.append('message', message)
  const res = await fetch(`${BASE_URL}/api/sessions/${sessionId}/turns`, {
    method: 'POST',
    headers: AUTH_HEADERS,
    body: formData,
  })
  if (!res.ok) {
    throw new Error(`Turn failed: ${res.status} ${JSON.stringify(await res.json().catch(() => ({}) ))}`)
  }
  return res.json() as Promise<{
    definition: { workflow: { states: { id: string; label: string }[] } }
    referenceChecks: { id: string; status: string }[]
    highlightPaths: string[]
  }>
}

async function run(): Promise<void> {
  console.log('1. Auth gate rejects an unauthenticated request...')
  const unauthed = await fetch(`${BASE_URL}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  })
  assert(unauthed.status === 401, `expected 401 for an unauthenticated request, got ${unauthed.status}`)
  console.log('   ok')

  console.log('2. Create a session...')
  const created = await postJson('/api/sessions', {})
  assert(created.status === 200, `session creation failed: ${created.status}`)
  const sessionId = (created.body as { sessionId: string }).sessionId
  console.log(`   ok (${sessionId})`)

  console.log('3. Workflow turn referencing a role that does not exist yet...')
  const turn1 = await postTurn(
    sessionId,
    "Add workflow states 'Submitted' and 'Approved', with a transition from Submitted to Approved handled by the 'Approver' role.",
  )
  const roleCheck1 = turn1.referenceChecks.find((c) => c.id === 'workflow-roles-exist')
  assert(roleCheck1?.status === 'failed', `expected workflow-roles-exist to be failed, got ${JSON.stringify(roleCheck1)}`)
  assert(turn1.highlightPaths.includes('workflow'), `expected highlightPaths to include 'workflow', got ${JSON.stringify(turn1.highlightPaths)}`)
  const statesAfterTurn1 = new Map(turn1.definition.workflow.states.map((s) => [s.label, s.id]))
  console.log('   ok — flagged as failed')

  console.log('4. Add the missing role...')
  const turn2 = await postTurn(sessionId, "Add a role called 'Approver', tagged Internal.")
  const roleCheck2 = turn2.referenceChecks.find((c) => c.id === 'workflow-roles-exist')
  assert(roleCheck2?.status === 'passed', `expected workflow-roles-exist to clear to passed, got ${JSON.stringify(roleCheck2)}`)
  assert(!turn2.highlightPaths.includes('workflow'), `expected 'workflow' NOT in highlightPaths (only roles changed), got ${JSON.stringify(turn2.highlightPaths)}`)
  assert(turn2.highlightPaths.includes('roles'), `expected highlightPaths to include 'roles', got ${JSON.stringify(turn2.highlightPaths)}`)
  console.log('   ok — cleared to passed, highlightPaths precise')

  console.log('5. Touch Workflow again — ids must stay stable...')
  const turn3 = await postTurn(
    sessionId,
    "Add another workflow state called 'Rejected', with a transition from Submitted to Rejected handled by the Approver role.",
  )
  for (const [label, id] of statesAfterTurn1) {
    const currentId = turn3.definition.workflow.states.find((s) => s.label === label)?.id
    assert(currentId === id, `expected '${label}' id to stay '${id}' across turns, got '${currentId}'`)
  }
  console.log('   ok — ids stable across turns')

  console.log('\nAll smoke checks passed.')
}

async function main(): Promise<void> {
  console.log(`Starting server on port ${PORT}...`)
  const child = spawn('npx', ['tsx', 'src/index.ts'], {
    env: { ...process.env, PORT },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  child.stdout?.on('data', (d) => process.stdout.write(`[server] ${d}`))
  child.stderr?.on('data', (d) => process.stderr.write(`[server] ${d}`))

  try {
    await waitForHealth(child)
    await run()
  } finally {
    child.kill()
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
