import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());

function detectEol(text) {
  return text.includes('\r\n') ? '\r\n' : '\n';
}

function parseRow(line) {
  const t = line.trim();
  if (!t.startsWith('|')) return null;
  const parts = t.split('|');
  return parts.slice(1, -1).map((c) => c.trim());
}

function renderRow(cells) {
  return `| ${cells.join(' | ')} |`;
}

function isSeparatorRow(cells) {
  return cells.length > 0 && cells.every((c) => /^:?-{3,}:?$/.test(c));
}

function idKey(idCell) {
  // Sort key that handles common formats:
  // - API_CART_01
  // - FE-LOGIN-002A
  // - SCREEN-ADMIN-005
  // - UNI_USER_UNIT_01 / UNI_USER_UNIT_16  (take first ID for ordering)
  // Fallback to string compare.

  const raw = (idCell || '').trim();
  const first = raw.split('/')[0].trim();

  // Extract prefix and number+suffix
  // Examples:
  //   API_CART_01 -> prefix API_CART_  num 1 suffix ''
  //   FE-LOGIN-002A -> prefix FE-LOGIN- num 2 suffix 'A'
  //   SCREEN-ADMIN-005 -> prefix SCREEN-ADMIN- num 5 suffix ''
  const m = first.match(/^(.*?)(\d+)([A-Za-z]?)$/);
  if (!m) return { prefix: first, num: Number.NaN, suf: '', raw: first };

  return {
    prefix: m[1],
    num: Number.parseInt(m[2], 10),
    suf: m[3] || '',
    raw: first,
  };
}

function compareIdCells(a, b) {
  const ka = idKey(a);
  const kb = idKey(b);

  if (ka.prefix !== kb.prefix) return ka.prefix.localeCompare(kb.prefix);

  const aNum = ka.num;
  const bNum = kb.num;
  const aNan = Number.isNaN(aNum);
  const bNan = Number.isNaN(bNum);

  if (aNan && bNan) return ka.raw.localeCompare(kb.raw);
  if (aNan) return 1;
  if (bNan) return -1;
  if (aNum !== bNum) return aNum - bNum;

  if (ka.suf !== kb.suf) return ka.suf.localeCompare(kb.suf);

  return ka.raw.localeCompare(kb.raw);
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out = [];

  for (const ent of entries) {
    if (ent.name === 'node_modules' || ent.name === '.git' || ent.name === '.test-results' || ent.name === 'coverage' || ent.name === 'playwright-report' || ent.name === 'test-results') {
      continue;
    }
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...(await walk(full)));
    else if (ent.isFile() && ent.name.endsWith('.test.md')) out.push(full);
  }
  return out;
}

function sortTableInLines(lines, startIdx) {
  // startIdx points to header row (| ID | ...)
  const headerCells = parseRow(lines[startIdx]);
  if (!headerCells || headerCells[0] !== 'ID') return { changed: false, endIdx: startIdx };

  const sepCells = parseRow(lines[startIdx + 1] || '');
  if (!sepCells || !isSeparatorRow(sepCells)) return { changed: false, endIdx: startIdx };

  const idCol = 0;

  const rows = [];
  let i = startIdx + 2;
  while (i < lines.length) {
    const rowCells = parseRow(lines[i]);
    if (!rowCells) break;
    if (lines[i].trim() === '') break;

    // end table if line doesn't start with pipe
    if (!lines[i].trim().startsWith('|')) break;

    // keep separator rows as-is (rare inside body)
    if (isSeparatorRow(rowCells)) {
      rows.push({ kind: 'sep', cells: rowCells, raw: lines[i] });
      i++;
      continue;
    }

    rows.push({ kind: 'row', cells: rowCells, raw: lines[i] });
    i++;
  }

  const bodyRows = rows.filter((r) => r.kind === 'row');
  const seps = rows.filter((r) => r.kind !== 'row');

  // Only sort if there are no mid-body separator rows; otherwise keep as-is to avoid weird formatting changes.
  if (seps.length > 0) return { changed: false, endIdx: i };

  const originalIds = bodyRows.map((r) => r.cells[idCol] ?? '');
  const sorted = [...bodyRows].sort((ra, rb) => compareIdCells(ra.cells[idCol], rb.cells[idCol]));
  const sortedIds = sorted.map((r) => r.cells[idCol] ?? '');

  let changed = false;
  for (let k = 0; k < originalIds.length; k++) {
    if (originalIds[k] !== sortedIds[k]) {
      changed = true;
      break;
    }
  }

  if (!changed) return { changed: false, endIdx: i };

  // Write back sorted rows
  for (let k = 0; k < sorted.length; k++) {
    lines[startIdx + 2 + k] = renderRow(sorted[k].cells);
  }

  return { changed: true, endIdx: i };
}

async function main() {
  const files = await walk(ROOT);

  const updated = [];
  const unchanged = [];

  for (const file of files) {
    const raw = await fs.readFile(file, 'utf8');
    const eol = detectEol(raw);
    const lines = raw.split(/\r\n|\n/);

    let anyChange = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!/^\|\s*ID\s*\|/i.test(line)) continue;

      const res = sortTableInLines(lines, i);
      if (res.changed) anyChange = true;
      i = res.endIdx;
    }

    if (!anyChange) {
      unchanged.push(path.relative(ROOT, file));
      continue;
    }

    await fs.writeFile(file, lines.join(eol), 'utf8');
    updated.push(path.relative(ROOT, file));
  }

  console.log(JSON.stringify({ scanned: files.length, updated: updated.length, unchanged: unchanged.length, updatedFiles: updated }, null, 2));
}

await main();
