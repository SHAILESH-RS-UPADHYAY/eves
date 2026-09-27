// Runs package.json's "dev" script straight through its CLI (no npm shell).
// The build tool's info chatter is silenced (--logLevel warn) and any line that
// still carries the runtime's brand is rewritten, so the console reads as EVES.
const { spawn } = require('child_process')
const path = require('path')

const root = path.resolve(__dirname, '..')
const [tool, ...args] = require(path.join(root, 'package.json')).scripts.dev.split(/\s+/)
const toolDir = path.join(root, 'node_modules', tool)
const { bin } = require(path.join(toolDir, 'package.json'))
const brand = new RegExp(tool.split('-')[0] + '(\\.exe)?', 'gi')

const env = { ...process.env }
if (process.argv.includes('--dashboard')) env.EVES_OPEN_DASHBOARD = '1'

console.log('[SYS] EVES core starting...')
const child = spawn(
  process.execPath,
  [path.join(toolDir, typeof bin === 'string' ? bin : bin[tool]), ...args, '--logLevel', 'warn'],
  { cwd: root, env, stdio: ['inherit', 'pipe', 'pipe'] }
)

function relay(stream, out) {
  let buffer = ''
  stream.on('data', (chunk) => {
    const lines = (buffer + chunk).split('\n')
    buffer = lines.pop()
    for (const line of lines) out.write(line.replace(brand, 'EVES') + '\n')
  })
  stream.on('end', () => buffer && out.write(buffer.replace(brand, 'EVES') + '\n'))
}
relay(child.stdout, process.stdout)
relay(child.stderr, process.stderr)

child.on('close', (code) => process.exit(code || 0))
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => child.kill(sig))
