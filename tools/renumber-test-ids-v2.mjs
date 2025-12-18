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
  const raw = (idCell || '').trim();
  if (!raw) return [];

  const tokens = raw
    .split(/\s*(?:\/|,|;|\|)\s*/g)
    .map((t) => t.trim())
    .filter(Boolean);

  const looksLikeId = (t) =>
    /^(?:API_[A-Z]+_\d+|DAT_[A-Z]{4}_DI_\d+|SEC_[A-Z]{4}_SEC_\d+|UNI_[A-Z]+_UNIT_\d+|FE-[A-Z]+-\d+[A-Za-z]?|FEA_[A-Z]+_FEAT_\d+|SCREEN-(?:FE|ADMIN)-\d+)$/i.test(t);

  return tokens.filter(looksLikeId);
}

function idParts(id) {
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
          if (parts) seen.set(id, { order: order++, parts });
        }
      }

      j++;
    }

    i = j;
  }

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
    const width = Math.max(...items.map((it) => it.parts.width));

    const ordered = [...items].sort((a, b) => a.order - b.order);

    let seq = 1;
    for (const it of ordered) {
      map.set(it.id, formatId({ prefix, width, num: seq++, suffix: it.parts.suffix }));
    }
  }

  return map;
}

function buildGlobalMapping(testMdFilesRaw) {
  /** @type {Map<string,string>} */
  const globalMap = new Map();

  for (const { file, raw } of testMdFilesRaw) {
    const map = buildMappingFromTestMd(raw);
    for (const [oldId, newId] of map.entries()) {
      if (globalMap.has(oldId) && globalMap.get(oldId) !== newId) {
        throw new Error(`ID collision: ${oldId} -> ${globalMap.get(oldId)} vs ${newId} (file: ${file})`);
      }
      globalMap.set(oldId, newId);
    }
  }

  return globalMap;
}

function makeReplacementRegex(oldIds) {
  // One-pass replacement to avoid cascading (new IDs matching old IDs).
  // We anchor with "not [A-Z0-9_-]" boundaries.
  const sorted = [...oldIds].sort((a, b) => b.length - a.length);
  const body = sorted.map(escapeRegExp).join('|');
  return new RegExp(`(^|[^A-Z0-9_-])(${body})(?=[^A-Z0-9_-]|$)`, 'g');
}

function applyMappingOnePass(text, re, map) {
  return text.replace(re, (m, lead, id) => `${lead}${map.get(id) ?? id}`);
}

async function main() {
  const testMdFiles = await findTestMdFiles();
  const testMdFilesRaw = [];

  for (const file of testMdFiles) {
    const raw = await fs.readFile(file, 'utf8');
    testMdFilesRaw.push({ file: path.relative(ROOT, file), raw });
  }

  const globalMap = buildGlobalMapping(testMdFilesRaw);

  const renumbered = [...globalMap.entries()].filter(([a, b]) => a !== b);
  const oldIds = [...globalMap.keys()];
  const re = makeReplacementRegex(oldIds);

  const allFiles = await walk(ROOT);

  const shouldUpdate = (p) => {
    const rel = path.relative(ROOT, p).replaceAll('/', '\\');
    const ext = path.extname(p).toLowerCase();

    if (!TARGET_EXTS.has(ext)) return false;

    if (rel.endsWith('.test.md')) return true;
    if (rel.startsWith(`backend\\testing\\`) && rel.endsWith('.test.js')) return true;
    if (rel.startsWith(`frontend\\e2e\\`) && rel.endsWith('.ts')) return true;
    if (rel.startsWith(`admin\\e2e\\`) && rel.endsWith('.ts')) return true;
    if (rel.startsWith(`.test-results\\`) && ext === '.json') return true;
    if (rel === `tools\\update-test-results-md.mjs`) return true;

    return false;
  };

  let updated = 0;
  const updatedFiles = [];

  for (const file of allFiles) {
    if (!shouldUpdate(file)) continue;

    const raw = await fs.readFile(file, 'utf8');
    const eol = detectEol(raw);

    const next = applyMappingOnePass(raw, re, globalMap);
    if (next === raw) continue;

    const normalized =
      eol === '\r\n'
        ? next.replace(/\n/g, '\r\n').replace(/\r\r\n/g, '\r\n')
        : next.replace(/\r\n/g, '\n');

    await fs.writeFile(file, normalized, 'utf8');
    updated++;
    updatedFiles.push(path.relative(ROOT, file));
  }

  await fs.mkdir(path.join(ROOT, '.id-migration'), { recursive: true });
  await fs.writeFile(
    path.join(ROOT, '.id-migration', 'id-renumber-map.json'),
    JSON.stringify(Object.fromEntries(globalMap), null, 2),
    'utf8'
  );
  await fs.writeFile(
    path.join(ROOT, '.id-migration', 'id-renumber-summary.json'),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        testMdFiles: testMdFiles.length,
        totalIds: globalMap.size,
        renumberedIds: renumbered.length,
        filesUpdated: updated,
      },
      null,
      2
    ),
    'utf8'
  );

  console.log(
    JSON.stringify(
      {
        testMdFiles: testMdFiles.length,
        totalIds: globalMap.size,
        renumberedIds: renumbered.length,
        filesUpdated: updated,
        mapFile: '.id-migration/id-renumber-map.json',
      },
      null,
      2
    )
  );
}

await main();
