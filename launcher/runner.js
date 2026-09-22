const { spawn } = require('child_process')
const path = require('path')

const projectRoot = path.resolve(__dirname, '..')
const viteBin = path.resolve(projectRoot, 'node_modules', 'electron-vite', 'bin', 'electron-vite.js')

const env = { ...process.env }
if (process.argv.includes('--dashboard')) {
  env.EVES_OPEN_DASHBOARD = '1'
}

const child = spawn(process.execPath, [viteBin, 'dev'], {
  cwd: projectRoot,
  env,
  stdio: ['inherit', 'pipe', 'pipe']
})

function filterLine(line) {
  return line
    .replace(/build the electron main process successfully/gi, '[OK] EVES core process ready')
    .replace(/build the electron preload files successfully/gi, '[OK] EVES system bridge ready')
    .replace(/dev server running for the electron renderer process at:/gi, '[INFO] EVES interface ready at:')
    .replace(/start electron app\.\.\./gi, '[SYS] EVES desktop service active')
    .replace(/electron-vite/gi, 'eves-core')
    .replace(/electron-builder/gi, 'eves-packager')
    .replace(/electron\.exe/gi, 'eves.exe')
    .replace(/\belectron\b/gi, 'EVES')
}

function processStream(stream, outStream) {
  let buffer = ''
  stream.on('data', (data) => {
    buffer += data.toString()
    const lines = buffer.split('\n')
    buffer = lines.pop()
    for (const l of lines) {
      outStream.write(filterLine(l) + '\n')
    }
  })
  stream.on('end', () => {
    if (buffer) {
      outStream.write(filterLine(buffer) + '\n')
    }
  })
}

processStream(child.stdout, process.stdout)
processStream(child.stderr, process.stderr)

child.on('close', (code) => {
  process.exit(code || 0)
})

process.on('SIGINT', () => {
  child.kill('SIGINT')
})
process.on('SIGTERM', () => {
  child.kill('SIGTERM')
})
