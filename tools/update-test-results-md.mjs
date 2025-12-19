import fs from 'fs/promises'
import path from 'path'

const ROOT = path.resolve(process.cwd())
const RESULTS_DIR = path.join(ROOT, '.test-results')

const ID_PATTERNS = [
  /API_[A-Z]+_\d+/g,
  /DAT_[A-Z]{4}_DI_\d+/g,
  /SEC_[A-Z]{4}_SEC_\d+/g,
  /UNI_[A-Z]+_UNIT_\d+/g,
  /FE-[A-Z]+-\d+[A-Z]?/g,
  /FEA_[A-Z]+_FEAT_\d+/g,
  /SCREEN-(?:FE|ADMIN)-\d+/g,
  /COMPAT-(?:FE|ADMIN)-\d+/g,
  /SPEED-(?:FE|ADMIN)-\d+/g,
  /STRESS-\d+/g,
  /USABILITY-(?:FE|ADMIN)-\d+/g
]

function extractIds(text) {
  const ids = new Set()
  for (const re of ID_PATTERNS) {
    const matches = text.match(re)
    if (!matches) continue
    for (const m of matches) ids.add(m)
  }
  return [...ids]
}

function mergeStatus(existing, incoming) {
  // FAIL dominates, then PASS, then NOT RUN
  if (!existing) return incoming
  if (existing === 'FAIL' || incoming === 'FAIL') return 'FAIL'
  if (existing === 'PASS' || incoming === 'PASS') return 'PASS'
  return 'NOT RUN'
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw)
}

async function buildStatusMap() {
  /** @type {Map<string, 'PASS'|'FAIL'|'NOT RUN'>} */
  const map = new Map()

  const push = (id, status) => {
    map.set(id, mergeStatus(map.get(id), status))
  }

  // Jest results
  const jestFiles = [
    'jest-api.json',
    'jest-security.json',
    'jest-data-integrity.json',
    'jest-unit.json',
    'jest-features.json'
  ]

  for (const file of jestFiles) {
    const fp = path.join(RESULTS_DIR, file)
    try {
      const json = await readJson(fp)
      for (const tr of json.testResults || []) {
        for (const ar of tr.assertionResults || []) {
          const title = ar.title || ar.fullName || ''
          const ids = extractIds(title)
          if (ids.length === 0) continue
          const status = ar.status === 'passed' ? 'PASS' : ar.status === 'failed' ? 'FAIL' : 'NOT RUN'
          for (const id of ids) push(id, status)
        }
      }
    } catch {
      // ignore missing files
    }
  }

  // Playwright JSON reporter results
  /** @type {string[]} */
  let pwFiles = []
  try {
    const entries = await fs.readdir(RESULTS_DIR, { withFileTypes: true })
    pwFiles = entries
      .filter((e) => e.isFile() && /^playwright-.*\.json$/i.test(e.name))
      .map((e) => e.name)
  } catch {
    pwFiles = []
  }

  const visitSuites = (suite, fn) => {
    if (!suite) return
    if (Array.isArray(suite.specs)) {
      for (const spec of suite.specs) fn(spec)
    }
    if (Array.isArray(suite.suites)) {
      for (const child of suite.suites) visitSuites(child, fn)
    }
  }

  for (const file of pwFiles) {
    const fp = path.join(RESULTS_DIR, file)
    try {
      const json = await readJson(fp)
      for (const top of json.suites || []) {
        visitSuites(top, (spec) => {
          const title = spec.title || ''
          const ids = extractIds(title)
          if (ids.length === 0) return

          // status across all projects/results
          let sawAny = false
          let failed = false
          let passed = true

          for (const test of spec.tests || []) {
            for (const result of test.results || []) {
              sawAny = true
              if (result.status === 'failed' || result.status === 'timedOut') failed = true
              if (result.status !== 'passed') passed = false
            }
          }

          const status = !sawAny ? 'NOT RUN' : failed ? 'FAIL' : passed ? 'PASS' : 'NOT RUN'
          for (const id of ids) push(id, status)
        })
      }
    } catch {
      // ignore missing/invalid files
    }
  }

  // Usability validator results
  try {
    const fp = path.join(RESULTS_DIR, 'usability.json')
    const json = await readJson(fp)
    for (const r of json.results || []) {
      const id = String(r.id || '').trim()
      if (!id) continue
      const status = r.status === 'PASS' ? 'PASS' : r.status === 'FAIL' ? 'FAIL' : 'NOT RUN'
      push(id, status)
    }
  } catch {
    // ignore missing file
  }

  return map
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  /** @type {string[]} */
  const out = []
  for (const ent of entries) {
    if (ent.name === 'node_modules' || ent.name === '.git' || ent.name === '.test-results') continue
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      out.push(...(await walk(full)))
    } else {
      out.push(full)
    }
  }
  return out
}

function computeRowStatus(ids, statusMap) {
  if (ids.length === 0) return null

  const statuses = ids.map((id) => statusMap.get(id)).filter(Boolean)
  if (statuses.includes('FAIL')) return 'FAIL'

  const unique = new Set(statuses)
  if (unique.size === 1 && unique.has('PASS') && statuses.length === ids.length) return 'PASS'

  // If some IDs are missing from automation mapping, keep it explicit.
  if (statuses.length === 0) return 'NOT RUN'
  if (statuses.every((s) => s === 'PASS')) return 'NOT RUN'

  return 'NOT RUN'
}

async function updateMarkdownFile(filePath, statusMap) {
  const original = await fs.readFile(filePath, 'utf8')
  const lines = original.split(/\r?\n/)

  let inTable = false
  let headerHasResultColumn = false
  let changed = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // naive table detection: header row begins with | ID |
    if (!inTable && /^\|\s*ID\s*\|/i.test(line)) {
      inTable = true
      headerHasResultColumn = /\|\s*Kết quả\s*\|\s*$/i.test(line) || /\|\s*Kết quả\s*\|/i.test(line)
      continue
    }

    if (!inTable) continue

    // End of table when blank line encountered
    if (line.trim() === '') {
      inTable = false
      headerHasResultColumn = false
      continue
    }

    if (!headerHasResultColumn) continue

    // Skip separator row
    if (/^\|\s*-{2,}/.test(line)) continue

    if (!line.startsWith('|')) continue

    const parts = line.split('|')
    if (parts.length < 4) continue

    const idCell = (parts[1] || '').trim()
    const ids = extractIds(idCell)
    if (ids.length === 0) continue

    const rowStatus = computeRowStatus(ids, statusMap)
    if (!rowStatus) continue

    const resultIdx = parts.length - 2
    const current = (parts[resultIdx] || '').trim()
    if (current === rowStatus) continue

    parts[resultIdx] = ` ${rowStatus} `
    lines[i] = parts.join('|')
    changed = true
  }

  if (!changed) return { changed: false, rowsUpdated: 0 }

  await fs.writeFile(filePath, lines.join('\n'), 'utf8')
  return { changed: true }
}

async function main() {
  const statusMap = await buildStatusMap()

  const targets = new Set([
    path.join(ROOT, 'backend', 'testing'),
    path.join(ROOT, 'tests', 'screen'),
    path.join(ROOT, 'docs', 'testing')
  ])

  const allFiles = []
  for (const dir of targets) {
    try {
      allFiles.push(...(await walk(dir)))
    } catch {
      // ignore
    }
  }

  const mdFiles = allFiles.filter((p) => p.endsWith('.test.md'))

  let changedCount = 0
  for (const mdFile of mdFiles) {
    const res = await updateMarkdownFile(mdFile, statusMap)
    if (res.changed) changedCount++
  }

  console.log(`Updated ${changedCount}/${mdFiles.length} markdown test matrices.`)
  console.log(`Collected ${statusMap.size} test IDs from automation results.`)
}

await main()
