import fs from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(process.cwd())
const resultsDir = path.join(repoRoot, '.test-results')
const resultsFile = path.join(resultsDir, 'usability.json')

const files = [
  path.join(repoRoot, 'docs', 'testing', 'usability', 'admin', 'admin.usability.test.md'),
  path.join(repoRoot, 'docs', 'testing', 'usability', 'frontend', 'frontend.usability.test.md')
]

const REQUIRED_COLS = [
  'ID',
  'Test level',
  'Mô tả test case',
  'Inter-test case Dependence',
  'Quy trình kiểm thử',
  'Kết quả mong đợi',
  'Dữ liệu kiểm thử',
  'Kết quả'
]

function die(msg) {
  console.error(`[usability] ${msg}`)
  process.exitCode = 1
}

function splitTableRow(line) {
  // `| a | b |` -> ['a','b']
  const raw = line.trim()
  if (!raw.startsWith('|')) return []
  const parts = raw.split('|').slice(1, -1)
  return parts.map((p) => p.trim())
}

function parseFirstMarkdownTable(md) {
  const lines = md.split(/\r?\n/)
  const tableStart = lines.findIndex((l) => /^\|\s*ID\s*\|/i.test(l))
  if (tableStart < 0) return null

  const headerLine = lines[tableStart]
  const divider = lines[tableStart + 1]
  if (!divider || !/^\|\s*-+/.test(divider)) return null

  const headerCols = splitTableRow(headerLine)
  if (headerCols.length === 0) return null

  const rows = []
  for (let i = tableStart + 2; i < lines.length; i++) {
    const l = lines[i]
    if (!l.startsWith('|')) break
    if (/^\|\s*---/.test(l)) continue
    rows.push(l)
  }

  return { headerCols, rows }
}

/**
 * @param {string[]} headerCols
 */
function buildColumnIndex(headerCols) {
  /** @type {Record<string, number>} */
  const idx = {}
  for (let i = 0; i < headerCols.length; i++) {
    idx[headerCols[i].toLowerCase()] = i
  }
  return idx
}

function getCell(cells, colIdx) {
  if (colIdx < 0) return ''
  return (cells[colIdx] || '').trim()
}

let ok = true
/** @type {{ id: string, status: 'PASS'|'FAIL', file: string, reason?: string }[]} */
const testcaseResults = []

for (const filePath of files) {
  const rel = path.relative(repoRoot, filePath)
  if (!fs.existsSync(filePath)) {
    die(`Missing file: ${rel}`)
    ok = false
    continue
  }

  const md = fs.readFileSync(filePath, 'utf8')
  const table = parseFirstMarkdownTable(md)
  if (!table) {
    die(`No valid table found in: ${rel}`)
    ok = false
    continue
  }

  const colIdx = buildColumnIndex(table.headerCols)

  for (const col of REQUIRED_COLS) {
    if (typeof colIdx[col.toLowerCase()] !== 'number') {
      die(`Missing column "${col}" in: ${rel}`)
      ok = false
    }
  }

  if (table.rows.length === 0) {
    die(`Table has 0 test rows in: ${rel}`)
    ok = false
    continue
  }

  for (const rowLine of table.rows) {
    const cells = splitTableRow(rowLine)
    if (cells.length === 0) continue

    const id = getCell(cells, colIdx['id'])
    if (!id) {
      ok = false
      testcaseResults.push({ id: '', status: 'FAIL', file: rel, reason: 'Missing ID cell' })
      continue
    }

    // Validate all required columns (except "Kết quả") are non-empty.
    const missing = []
    for (const col of REQUIRED_COLS) {
      if (col === 'Kết quả') continue
      const v = getCell(cells, colIdx[col.toLowerCase()])
      if (!v) missing.push(col)
    }

    if (missing.length > 0) {
      ok = false
      testcaseResults.push({
        id,
        status: 'FAIL',
        file: rel,
        reason: `Missing required cells: ${missing.join(', ')}`
      })
    } else {
      testcaseResults.push({ id, status: 'PASS', file: rel })
    }
  }
}

// Always write a result artifact so the markdown updater can consume it.
fs.mkdirSync(resultsDir, { recursive: true })
fs.writeFileSync(
  resultsFile,
  JSON.stringify(
    {
      ok,
      generatedAt: new Date().toISOString(),
      results: testcaseResults
    },
    null,
    2
  ),
  'utf8'
)

if (ok) {
  console.log(`[usability] OK (${files.length} files validated; wrote ${path.relative(repoRoot, resultsFile)})`)
} else {
  console.error(`[usability] FAIL (wrote ${path.relative(repoRoot, resultsFile)})`)
  process.exitCode = 1
}
