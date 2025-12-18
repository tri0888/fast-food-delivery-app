import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());

const TARGET_EXTS = new Set(['.md', '.js', '.ts', '.json']);

function detectEol(text) {
  return text.includes('\r\n') ? '\r\n' : '\n';
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseRow(line) {
  const t = line.trim();
  if (!t.startsWith('|')) return null;
  const parts = t.split('|');
  return parts.slice(1, -1).map((c) => c.trim());
}

function isSeparatorRow(cells) {
  return cells.length > 0 && cells.every((c) => /^:?-{3,}:?$/.test(c));
}

function extractIdsFromIdCell(idCell) {
  // ID cell may contain multiple IDs: "A / B" or "A, B".
  // We only accept tokens that look like known IDs.
  const raw = (idCell || '').trim();
  if (!raw) return [];

  // Split on common separators while keeping order.
  const tokens = raw
    .split(/\s*(?:\/|,|;|\|)\s*/g)
    .map((t) => t.trim())
    .filter(Boolean);

  // Filter tokens that look like IDs.
  const looksLikeId = (t) =>
    /^(?:API_[A-Z]+_\d+|DAT_[A-Z]{4}_DI_\d+|SEC_[A-Z]{4}_SEC_\d+|UNI_[A-Z]+_UNIT_\d+|FE-[A-Z]+-\d+[A-Za-z]?|FEA_[A-Z]+_FEAT_\d+|SCREEN-(?:FE|ADMIN)-\d+)$/i.test(t);

  return tokens.filter(looksLikeId);
}

function idParts(id) {
  // Return { prefix, width, num, suffix }
  // Suffix is optional letter at the end (only for FE-* patterns currently).
  const m = id.match(/^(.*?)(\d+)([A-Za-z]?)$/);
  if (!m) return null;
  return {
    prefix: m[1],
    width: m[2].length,
    num: Number.parseInt(m[2], 10),
    suffix: m[3] || '',
  };
}

function formatId({ prefix, width, num, suffix }) {
  const n = String(num).padStart(width, '0');
  return `${prefix}${n}${suffix}`;
}

function compareIdsForOrdering(a, b) {
  const pa = idParts(a);
  const pb = idParts(b);
  if (!pa || !pb) return a.localeCompare(b);
  if (pa.prefix !== pb.prefix) return pa.prefix.localeCompare(pb.prefix);
  if (pa.num !== pb.num) return pa.num - pb.num;
  return pa.suffix.localeCompare(pb.suffix);
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out = [];

  for (const ent of entries) {
    if (
      ent.name === 'node_modules' ||
      ent.name === '.git' ||
      ent.name === 'coverage' ||
      ent.name === 'playwright-report' ||
      ent.name === 'test-results'
    ) {
      continue;
    }
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }

  return out;
}

async function findTestMdFiles() {
  const all = await walk(ROOT);
  return all.filter((p) => p.endsWith('.test.md'));
}

function buildMappingFromTestMd(content) {
  const lines = content.split(/\r\n|\n/);

  /** @type {Map<string, {order: number, parts: ReturnType<typeof idParts>}>} */
  const seen = new Map();

  let order = 0;

  for (let i = 0; i < lines.length; i++) {
    if (!/^\|\s*ID\s*\|/i.test(lines[i])) continue;

    const header = parseRow(lines[i]);
    const sep = parseRow(lines[i + 1] || '');
    if (!header || !sep || !isSeparatorRow(sep)) continue;

    // Walk body until blank or non-table
    let j = i + 2;
    while (j < lines.length) {
      const line = lines[j];
      if (line.trim() === '') break;
      if (!line.trim().startsWith('|')) break;

      const row = parseRow(line);
      if (!row || isSeparatorRow(row)) {
        j++;
        continue;
      }

      const ids = extractIdsFromIdCell(row[0]);
      for (const id of ids) {
        if (!seen.has(id)) {
          const parts = idParts(id);
          if (parts) {
            seen.set(id, { order: order++, parts });
          }
        }
      }

      j++;
    }

    i = j;
  }

  // Group by prefix to assign sequential numbers per prefix within this file
  /** @type {Map<string, Array<{id:string, order:number, parts:any}>>} */
  const byPrefix = new Map();
  for (const [id, meta] of seen.entries()) {
    const prefix = meta.parts.prefix;
    if (!byPrefix.has(prefix)) byPrefix.set(prefix, []);
    byPrefix.get(prefix).push({ id, order: meta.order, parts: meta.parts });
  }

  /** @type {Map<string,string>} */
  const map = new Map();

  for (const [prefix, items] of byPrefix.entries()) {
    // Determine width: keep the maximum width used in this prefix group
    const width = Math.max(...items.map((it) => it.parts.width));

    // Order by appearance first; ties by numeric+suffix.
    const ordered = [...items].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return compareIdsForOrdering(a.id, b.id);
    });

    let seq = 1;
    for (const it of ordered) {
      const next = formatId({ prefix, width, num: seq++, suffix: it.parts.suffix });
      map.set(it.id, next);
    }
  }

  return map;
}

function applyMappingToText(text, mappingEntries) {
  // mappingEntries: Array<[old,new]> sorted by old length desc
  let out = text;

  for (const [oldId, newId] of mappingEntries) {
    if (oldId === newId) continue;
    const re = new RegExp(`(^|[^A-Z0-9_-])(${escapeRegExp(oldId)})(?=[^A-Z0-9_-]|$)`, 'g');
    out = out.replace(re, `$1${newId}`);
  }

  return out;
}

async function main() {
  const testMdFiles = await findTestMdFiles();

  /** @type {Map<string,string>} */
  const globalMap = new Map();
  const perFileCounts = [];

  for (const file of testMdFiles) {
    const raw = await fs.readFile(file, 'utf8');
    const map = buildMappingFromTestMd(raw);

    let changed = 0;
    for (const [k, v] of map.entries()) {
      if (globalMap.has(k) && globalMap.get(k) !== v) {
        // Collision: same old ID mapped differently from another file.
        // This should not happen; fail fast.
        throw new Error(`ID collision: ${k} -> ${globalMap.get(k)} vs ${v} (file: ${path.relative(ROOT, file)})`);
      }
      globalMap.set(k, v);
      if (k !== v) changed++;
    }
    perFileCounts.push({ file: path.relative(ROOT, file), ids: map.size, renumbered: changed });
  }

  const mappingEntries = [...globalMap.entries()].sort((a, b) => b[0].length - a[0].length);

  const allFiles = await walk(ROOT);

  // Only update likely-relevant files:
  // - *.test.md (docs)
  // - backend/testing/**/*.test.js
  // - frontend/admin playwright specs
  // - .test-results/*.json (so existing reports still map)
  // - tools/update-test-results-md.mjs or any other files containing IDs

  const shouldUpdate = (p) => {
    const rel = path.relative(ROOT, p).replaceAll('/', '\\');
    const ext = path.extname(p).toLowerCase();

    if (!TARGET_EXTS.has(ext)) return false;

    if (rel.endsWith('.test.md')) return true;
    if (rel.startsWith(`backend\\testing\\`) && rel.endsWith('.test.js')) return true;
    if (rel.startsWith(`frontend\\e2e\\`) && rel.endsWith('.ts')) return true;
    if (rel.startsWith(`admin\\e2e\\`) && rel.endsWith('.ts')) return true;
    if (rel.startsWith(`.test-results\\`) && ext === '.json') return true;

    // Also update tooling that parses IDs
    if (rel === `tools\\update-test-results-md.mjs`) return true;

    return false;
  };

  let updated = 0;
  const updatedFiles = [];

  for (const file of allFiles) {
    if (!shouldUpdate(file)) continue;

    const raw = await fs.readFile(file, 'utf8');
    const eol = detectEol(raw);

    const next = applyMappingToText(raw, mappingEntries);
    if (next === raw) continue;

    // preserve EOL (our replacement keeps original EOL because we don't split/join)
    // but ensure no accidental \n injection when file is \r\n
    const normalized = eol === '\r\n' ? next.replace(/\n/g, '\r\n').replace(/\r\r\n/g, '\r\n') : next.replace(/\r\n/g, '\n');

    await fs.writeFile(file, normalized, 'utf8');
    updated++;
    updatedFiles.push(path.relative(ROOT, file));
  }

  // Write mapping report for traceability
  const report = {
    generatedAt: new Date().toISOString(),
    totalTestMdFiles: testMdFiles.length,
    totalIds: globalMap.size,
    totalRenumberedIds: mappingEntries.filter(([a, b]) => a !== b).length,
    perFileCounts,
    updatedFilesCount: updated,
    updatedFiles,
  };

  await fs.mkdir(path.join(ROOT, '.id-migration'), { recursive: true });
  await fs.writeFile(path.join(ROOT, '.id-migration', 'id-renumber-report.json'), JSON.stringify(report, null, 2), 'utf8');

  console.log(JSON.stringify({
    testMdFiles: testMdFiles.length,
    totalIds: globalMap.size,
    renumbered: mappingEntries.filter(([a, b]) => a !== b).length,
    filesUpdated: updated,
    report: '.id-migration/id-renumber-report.json'
  }, null, 2));
}

await main();
