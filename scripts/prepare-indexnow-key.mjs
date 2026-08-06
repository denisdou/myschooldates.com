import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const envPath = join(root, '.env')
const publicDir = join(root, 'public')
const keyPattern = /^[A-Za-z0-9-]{8,128}$/
const optional = process.argv.includes('--if-configured')

if (existsSync(envPath)) process.loadEnvFile(envPath)

const key = process.env.INDEXNOW_KEY
if (!key && optional) {
  console.log('INDEXNOW_KEY is not configured; skipping IndexNow key file generation.')
  process.exit(0)
}
if (!keyPattern.test(key || '')) {
  throw new Error('INDEXNOW_KEY must be 8-128 characters using only letters, numbers, and dashes')
}

mkdirSync(publicDir, { recursive: true })
writeFileSync(join(publicDir, `${key}.txt`), key, 'utf8')

console.log('Created the root-level IndexNow verification file under public/.')
console.log('Deploy this file before running a live IndexNow submission.')
