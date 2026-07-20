import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputRoot = '.output'
const textExtensions = new Set([
  '.html',
  '.js',
  '.json',
  '.map',
  '.mjs',
  '.txt',
])

const replacements = [
  [/\/Users\/doujiajun\/work\/mars\/myschooldates\.com/g, '/app'],
  [/\/Users\/doujiajun\/work\/mars/g, '/app'],
  [/\/Users\/doujiajun/g, '/home/app'],
  [/\.\.\/node_modules\/\.pnpm\/[^"'`\s]+?\/node_modules\//g, 'node_modules/'],
  [/node_modules\/\.pnpm\/[^"'`\s]+?\/node_modules\//g, 'node_modules/'],
]

function extensionOf(filePath) {
  const match = filePath.match(/(\.[^.\/]+)$/)
  return match ? match[1] : ''
}

function sanitizeFile(filePath) {
  if (!textExtensions.has(extensionOf(filePath))) return 0

  const original = readFileSync(filePath, 'utf8')
  let next = original

  for (const [pattern, replacement] of replacements) {
    next = next.replace(pattern, replacement)
  }

  if (next === original) return 0

  writeFileSync(filePath, next)
  return 1
}

function walk(dir) {
  let changed = 0
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    const stat = statSync(path)
    if (stat.isDirectory()) {
      changed += walk(path)
    } else if (stat.isFile()) {
      changed += sanitizeFile(path)
    }
  }
  return changed
}

if (existsSync(outputRoot)) {
  const changed = walk(outputRoot)
  console.log(`Sanitized build path references in ${changed} file${changed === 1 ? '' : 's'}.`)
}
