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

function extractIdsFromIdCell(idCell) {
  const raw = (idCell || '').trim();
  if (!raw) return [];
  return raw
    .split(/\s*(?:\/|,|;|\|)\s*/g)
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) =>
      /^(?:API_[A-Z]+_\d+|DAT_[A-Z]{4}_DI_\d+|SEC_[A-Z]{4}_SEC_\d+|UNI_[A-Z]+_UNIT_\d+|FE-[A-Z]+-\d+[A-Za-z]?|FEA_[A-Z]+_FEAT_\d+|SCREEN-(?:FE|ADMIN)-\d+)$/i.test(t)
    );
}

function idParts(id) {
  const m = id.match(/^(.*?)(\d+)([A-Za-z]?)$/);
  if (!m) return null;
  return {
    prefix: m[1],
    width: m[2].length,
    suffix: m[3] || '',
  };
}

function formatId(prefix, width, num) {
  return `${prefix}${String(num).padStart(width, '0')}`;
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out = [];
  for (const ent of entries) {
    if (ent.name === 'node_modules' || ent.name === '.git' || ent.name === 'coverage' || ent.name === 'playwright-report' || ent.name === 'test-results') continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

async function main() {
  const all = await walk(ROOT);
  const mdFiles = all.filter((p) => p.endsWith('.test.md'));

  const updated = [];
  const warnings = [];

  for (const mdFile of mdFiles) {
    const raw = await fs.readFile(mdFile, 'utf8');
    const eol = detectEol(raw);
    const lines = raw.split(/\r\n|\n/);

    let changed = false;

    // For pairing with test JS in same folder
    const jsCandidate = mdFile.replace(/\.md$/i, '.js');
    let jsRaw = null;
    try {
      jsRaw = await fs.readFile(jsCandidate, 'utf8');
    } catch {
      jsRaw = null;
    }

    // We will collect per-table new IDs in appearance order for updating JS titles sequentially
    /** @type {Array<{prefix:string,width:number,newIds:string[]}>} */
    const tables = [];

    for (let i = 0; i < lines.length; i++) {
      if (!/^\|\s*ID\s*\|/i.test(lines[i])) continue;

      const header = parseRow(lines[i]);
      const sep = parseRow(lines[i + 1] || '');
      if (!header || !sep || !isSeparatorRow(sep)) continue;

      // Determine which column is Inter-test case Dependence (optional)
      const depCol = header.findIndex((h) => h.toLowerCase() === 'inter-test case dependence');

      // Read all body rows
      const body = [];
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
        body.push({ idx: j, cells: row });
        j++;
      }

      // Extract IDs in row order
      const rowIdTokens = body.map((r) => extractIdsFromIdCell(r.cells[0]));
      const flatIds = rowIdTokens.flat();

      if (flatIds.length === 0) {
        i = j;
        continue;
      }

      // Determine prefix/width from first ID
      const first = idParts(flatIds[0]);
      if (!first) {
        i = j;
        continue;
      }

      const prefix = first.prefix;
      const width = first.width;

      // Verify all IDs share same prefix (most files do). If not, we renumber per-prefix within table.
      const byPrefix = new Map();
      for (let r = 0; r < body.length; r++) {
        for (const id of rowIdTokens[r]) {
          const p = idParts(id);
          if (!p) continue;
          const key = p.prefix;
          if (!byPrefix.has(key)) byPrefix.set(key, { width: p.width, seq: 1, ids: [] });
        }
      }

      // Build mapping old->new by *occurrence* order (disambiguates duplicates)
      // We store mapping as array per old ID.
      /** @type {Map<string, string[]>} */
      const occMap = new Map();

      const newIdsByRow = [];

      for (let r = 0; r < body.length; r++) {
        const ids = rowIdTokens[r];
        if (ids.length === 0) {
          newIdsByRow.push([]);
          continue;
        }

        const assigned = [];
        for (const oldId of ids) {
          const p = idParts(oldId);
          if (!p) continue;

          const slot = byPrefix.get(p.prefix);
          const useWidth = Math.max(slot.width, p.width);
          slot.width = useWidth;

          const nextId = formatId(p.prefix, useWidth, slot.seq++);
          slot.ids.push(nextId);
          assigned.push(nextId);

          if (!occMap.has(oldId)) occMap.set(oldId, []);
          occMap.get(oldId).push(nextId);
        }
        newIdsByRow.push(assigned);
      }

      // Rewrite ID column in table body
      for (let r = 0; r < body.length; r++) {
        const { idx, cells } = body[r];
        const assigned = newIdsByRow[r];
        if (!assigned || assigned.length === 0) continue;

        // Keep multi-IDs joined with " / " (same as before)
        const newIdCell = assigned.join(' / ');
        if (cells[0] !== newIdCell) {
          cells[0] = newIdCell;
          lines[idx] = renderRow(cells);
          changed = true;
        }
      }

      // Update dependency column if present AND if we can map uniquely.
      if (depCol >= 0) {
        // Build a unique mapping when possible (oldId appears once).
        const uniqueMap = new Map();
        for (const [oldId, arr] of occMap.entries()) {
          if (arr.length === 1) uniqueMap.set(oldId, arr[0]);
        }

        for (let r = 0; r < body.length; r++) {
          const { idx, cells } = body[r];
          const dep = (cells[depCol] || '').trim();
          if (!dep) continue;

          const tokens = extractIdsFromIdCell(dep);
          if (tokens.length === 0) continue;

          let nextDep = dep;
          for (const t of tokens) {
            if (!uniqueMap.has(t)) {
              // Ambiguous (duplicate old ID) — warn but keep original.
              if (occMap.has(t) && occMap.get(t).length > 1) {
                warnings.push(`Ambiguous dependency in ${path.relative(ROOT, mdFile)}: ${t} appears multiple times; dependency left unchanged.`);
              }
              continue;
            }
            // replace whole token occurrences
            nextDep = nextDep.replaceAll(t, uniqueMap.get(t));
          }

          if (nextDep !== dep) {
            cells[depCol] = nextDep;
            lines[idx] = renderRow(cells);
            changed = true;
          }
        }
      }

      // Record table ids for updating JS sequentially (per prefix)
      for (const [pfx, slot] of byPrefix.entries()) {
        tables.push({ prefix: pfx, width: slot.width, newIds: slot.ids });
      }

      i = j;
    }

    // Update corresponding test .js file (if exists)
    if (jsRaw && tables.length > 0) {
      let jsNext = jsRaw;

      for (const t of tables) {
        // Replace IDs in it/test titles in order of appearance.
        // Match: it('ID · ...' or test("ID · ...")
        const titleRe = new RegExp(`\\b(it|test)\\(\\s*(['\"])(${t.prefix}\\d{${t.width}}[A-Za-z]?)\\s*·`, 'g');

        let idx = 0;
        jsNext = jsNext.replace(titleRe, (m, fn, quote, id) => {
          // We assign next sequential ID. If mismatch in count, keep existing and warn.
          if (idx >= t.newIds.length) {
            warnings.push(`JS title count mismatch for ${path.relative(ROOT, jsCandidate)} prefix ${t.prefix}: more tests than doc rows.`);
            return `${fn}(${quote}${id} ·`;
          }
          const newId = t.newIds[idx++];
          return `${fn}(${quote}${newId} ·`;
        });

        // If docs have more IDs than tests
        if (idx < t.newIds.length) {
          warnings.push(`JS title count mismatch for ${path.relative(ROOT, jsCandidate)} prefix ${t.prefix}: fewer tests than doc rows.`);
        }
      }

      if (jsNext !== jsRaw) {
        await fs.writeFile(jsCandidate, jsNext, 'utf8');
        changed = true;
      }
    }

    if (!changed) continue;

    await fs.writeFile(mdFile, lines.join(eol), 'utf8');
    updated.push(path.relative(ROOT, mdFile));
  }

  await fs.mkdir(path.join(ROOT, '.id-migration'), { recursive: true });
  await fs.writeFile(
    path.join(ROOT, '.id-migration', 'id-renumber-by-row-summary.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), updatedCount: updated.length, updatedFiles: updated, warnings }, null, 2),
    'utf8'
  );

  console.log(JSON.stringify({ scanned: mdFiles.length, updated: updated.length, warnings: warnings.length, summary: '.id-migration/id-renumber-by-row-summary.json' }, null, 2));
}

await main();
