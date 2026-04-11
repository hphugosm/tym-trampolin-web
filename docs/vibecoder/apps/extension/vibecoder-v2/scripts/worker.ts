import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

type Role = 'structure' | 'ui' | 'research' | 'review' | 'polish'
type Agent = 'plan' | 'build' | 'review' | 'polish'

type CliOptions = {
  brief: string
  briefFile?: string
  previewUrl: string
  executionMode: 'auto' | 'dry-run' | 'execute'
  timeoutSeconds: number
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..')
const promptDir = path.join(projectRoot, 'prompts')

const roleOrder: Role[] = ['structure', 'ui', 'research', 'review', 'polish']

const roleAgentMap: Record<Role, Agent> = {
  structure: 'build',
  ui: 'build',
  research: 'build',
  review: 'review',
  polish: 'polish',
}

const providerHints = [
  'ANTHROPIC_API_KEY',
  'OPENAI_API_KEY',
  'GEMINI_API_KEY',
  'GITHUB_TOKEN',
  'GROQ_API_KEY',
  'AWS_ACCESS_KEY_ID',
  'AZURE_OPENAI_ENDPOINT',
  'LOCAL_ENDPOINT',
].filter((name) => Boolean(process.env[name]))

function installPipeSafety(): void {
  const handlePipeError = (error: NodeJS.ErrnoException): void => {
    if (error.code === 'EPIPE') {
      process.exit(0)
    }

    throw error
  }

  process.stdout.on('error', handlePipeError)
  process.stderr.on('error', handlePipeError)
}

async function main() {
  installPipeSafety()
  const options = parseArgs(process.argv.slice(2))
  if (options.briefFile) {
    const briefFilePath = path.resolve(projectRoot, options.briefFile)
    options.brief = (await readFile(briefFilePath, 'utf8')).trim()
  }

  const dryRun =
    options.executionMode === 'dry-run'
      ? true
      : options.executionMode === 'execute'
        ? false
        : providerHints.length === 0

  console.log(`vibecoder-v2 worker`)
  logStatus('bezi', 'workflow start')
  console.log(`brief: ${options.brief}`)
  console.log(`preview: ${options.previewUrl}`)
  console.log(`mode: ${dryRun ? 'dry-run' : 'execute'}`)
  if (!dryRun) {
    console.log(
      `provider env: ${providerHints.length > 0 ? providerHints.join(', ') : 'credentials-managed (opencode providers login)'}`,
    )
  } else {
    console.log('provider env: none detected, printing commands only')
  }
  console.log('')

  const planPrompt = buildPlanPrompt(options)
  console.log('→ plan')
  logStatus('bezi', 'plan')
  if (dryRun) {
    console.log(renderCommand('plan', planPrompt))
    logStatus('nebezi', 'plan (dry-run printed)')
    console.log('')
  } else {
    try {
      await runOpenCodeWithRetry('plan', planPrompt, options.timeoutSeconds, false)
      logStatus('nebezi', 'plan (done)')
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.log(`Plan failed, continuing without plan: ${message}`)
      logStatus('nebezi', 'plan (skipped after failure)')
    }
    console.log('')
  }

  for (const role of roleOrder) {
    const prompt = await buildPrompt(role, options)
    const agent = roleAgentMap[role]
    console.log(`→ ${role} (${agent})`)
    logStatus('bezi', `${role}`)

    if (dryRun) {
      console.log(renderCommand(agent, prompt))
      logStatus('nebezi', `${role} (dry-run printed)`)
      console.log('')
      continue
    }

    await runOpenCodeWithRetry(agent, prompt, options.timeoutSeconds)
    logStatus('nebezi', `${role} (done)`)
    console.log('')
  }

  if (dryRun) {
    console.log('Set a provider env var or LOCAL_ENDPOINT, then rerun with the same brief.')
    logStatus('nebezi', 'workflow end (dry-run)')
  } else {
    console.log('Workflow complete. Review the files, then run npm run build and npm run lint.')
    logStatus('nebezi', 'workflow end (success)')
  }
}

function logStatus(state: 'bezi' | 'nebezi', context: string): void {
  console.log(`STATUS: ${state} | ${context}`)
}

function parseArgs(args: string[]): CliOptions {
  let brief = ''
  let briefFile: string | undefined
  let previewUrl = 'http://localhost:5173'
  let executionMode: 'auto' | 'dry-run' | 'execute' = 'auto'
  let timeoutSeconds = 120

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--brief' && index + 1 < args.length) {
      brief = args[index + 1]
      index += 1
      continue
    }

    if (arg === '--brief-file' && index + 1 < args.length) {
      briefFile = args[index + 1]
      index += 1
      continue
    }

    if (arg === '--preview-url' && index + 1 < args.length) {
      previewUrl = args[index + 1]
      index += 1
      continue
    }

    if (arg === '--dry-run') {
      executionMode = 'dry-run'
      continue
    }

    if (arg === '--execute') {
      executionMode = 'execute'
      continue
    }

    if (arg === '--timeout-seconds' && index + 1 < args.length) {
      const parsed = Number(args[index + 1])
      if (Number.isFinite(parsed) && parsed > 0) {
        timeoutSeconds = Math.floor(parsed)
      }
      index += 1
      continue
    }
  }

  if (!brief) {
    brief = 'Udělej modernější homepage pro DemocraTICon.'
  }

  return { brief, briefFile, previewUrl, executionMode, timeoutSeconds }
}

async function buildPrompt(role: Role, options: CliOptions): Promise<string> {
  const templatePath = path.join(promptDir, `${role}.md`)
  const template = await readFile(templatePath, 'utf8')

  return template
    .replaceAll('{{BRIEF}}', options.brief)
    .replaceAll('{{PREVIEW_URL}}', options.previewUrl)
    .replaceAll('{{PROJECT_ROOT}}', projectRoot)
}

function buildPlanPrompt(options: CliOptions): string {
  return [
    'You are the strategic planning agent for vibecoder-v2.',
    `Brief: ${options.brief}`,
    `Preview URL: ${options.previewUrl}`,
    '',
    'Create a concise implementation strategy for these exact stages in order:',
    '1) structure',
    '2) ui',
    '3) research',
    '4) review',
    '5) polish',
    '',
    'Rules:',
    '- Keep it practical and local-first for a Vite + React + TypeScript project.',
    '- Do not introduce backend, auth, database, or cloud scope.',
    '- Focus on high-impact edits with minimal file churn.',
    '- Mention key risks and a simple validation checklist.',
    '',
    'Output format:',
    '- Goal',
    '- Stage plan (5 bullets)',
    '- Risk list (max 5 bullets)',
    '- Validation checklist (max 5 bullets)',
  ].join('\n')
}

function renderCommand(agent: Agent, prompt: string): string {
  return [
    `opencode run --agent ${agent} --format default`,
    shellQuote(prompt),
  ].join(' ')
}

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", `'"'"'`)}'`
}

function runOpenCode(agent: Agent, prompt: string, timeoutSeconds: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn('opencode', ['run', '--agent', agent, '--format', 'default', prompt], {
      cwd: projectRoot,
      shell: false,
    })

    let stderr = ''
    let timedOut = false
    let elapsedSeconds = 0

    const heartbeatHandle = setInterval(() => {
      elapsedSeconds += 10
      logStatus('bezi', `agent ${agent} running (${elapsedSeconds}s)`)
    }, 10_000)

    const timeoutHandle = setTimeout(() => {
      timedOut = true
      child.kill('SIGTERM')
    }, timeoutSeconds * 1000)

    child.stdout.on('data', (chunk: Buffer) => {
      process.stdout.write(chunk)
    })

    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString()
      process.stderr.write(chunk)
    })

    child.on('error', (error) => {
      clearInterval(heartbeatHandle)
      clearTimeout(timeoutHandle)
      reject(error)
    })

    child.on('close', (code) => {
      clearInterval(heartbeatHandle)
      clearTimeout(timeoutHandle)

      if (timedOut) {
        reject(
          new Error(
            `OpenCode timeout for agent ${agent} after ${timeoutSeconds}s. Retry with --timeout-seconds 300 or test provider with: opencode run --format default "hello"`,
          ),
        )
        return
      }

      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`OpenCode failed for agent ${agent} with exit code ${code}\n${stderr}`))
    })
  })
}

async function runOpenCodeWithRetry(
  agent: Agent,
  prompt: string,
  timeoutSeconds: number,
  allowRetry = true,
): Promise<void> {
  const firstAttemptTimeout = timeoutSeconds
  const secondAttemptTimeout = Math.max(timeoutSeconds * 2, 180)

  try {
    await runOpenCode(agent, prompt, firstAttemptTimeout)
    return
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const isTimeout = message.includes('OpenCode timeout')

    if (!isTimeout || !allowRetry) {
      throw error
    }

    console.log(
      `Retrying ${agent} after timeout (${firstAttemptTimeout}s). Next timeout: ${secondAttemptTimeout}s`,
    )
    await runOpenCode(agent, prompt, secondAttemptTimeout)
  }
}

void main().catch((error) => {
  logStatus('nebezi', 'workflow end (error)')
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})