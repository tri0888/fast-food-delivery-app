import { promises as fs } from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd());

function detectEol(text) {
  return text.includes('\r\n') ? '\r\n' : '\n';
}

function parseRow(line) {
  // Markdown table row: | a | b | c |
  // Return trimmed cells without the outer empty segments.
  const trimmed = line.trim();
  if (!trimmed.startsWith('|')) return null;
  const parts = trimmed.split('|');
  // parts[0] and last are usually empty due to leading/trailing pipe
  const cells = parts
    .slice(1, -1)
    .map((c) => c.trim());
  return cells;
}

function renderRow(cells) {
  return `| ${cells.join(' | ')} |`;
}

function isSeparatorRow(cells) {
  // Typical: --- / :---: etc.
  return cells.every((c) => /^:?-{3,}:?$/.test(c));
}

function levelForFile(filePath) {
  const p = filePath.replaceAll('/', '\\').toLowerCase();

  if (p.includes('\\backend\\testing\\unit\\')) return 'Unit';
  if (p.includes('\\backend\\testing\\api\\')) return 'Integration';
  if (p.includes('\\backend\\testing\\security\\')) return 'Integration';
  if (p.includes('\\backend\\testing\\data-integrity\\')) return 'Integration';
  if (p.includes('\\backend\\testing\\features\\')) return 'System';
  if (p.includes('\\tests\\screen\\')) return 'Acceptance';

  return null;
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out = [];
  for (const ent of entries) {
    if (ent.name === 'node_modules' || ent.name === '.git' || ent.name === 'coverage' || ent.name === 'playwright-report' || ent.name === 'test-results' || ent.name === '.test-results') {
      continue;
    }
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...(await walk(full)));
    } else if (ent.isFile() && ent.name.endsWith('.test.md')) {
      out.push(full);
    }
  }
  return out;
}

function transformMarkdown(content, level) {
  const eol = detectEol(content);
  const lines = content.split(/\r\n|\n/);

  let changed = false;

  for (let i = 0; i < lines.length; i++) {
    const headerCells = parseRow(lines[i]);
    if (!headerCells) continue;

    // We only target tables whose first header cell is exactly "ID".
    if (headerCells[0] !== 'ID') continue;

    // Already has Test level
    if ((headerCells[1] || '').toLowerCase() === 'test level') {
      continue;
    }

    // Need a separator row following
    if (i + 1 >= lines.length) continue;
    const sepCells = parseRow(lines[i + 1]);
    if (!sepCells || !isSeparatorRow(sepCells)) continue;

    // Insert column in header + separator
    const newHeader = [headerCells[0], 'Test level', ...headerCells.slice(1)];
    const newSep = [sepCells[0] ?? '---', '---', ...sepCells.slice(1)];

    lines[i] = renderRow(newHeader);
    lines[i + 1] = renderRow(newSep);
    changed = true;

    // Update body rows until table ends
    let j = i + 2;
    while (j < lines.length) {
      const rowCells = parseRow(lines[j]);
      if (!rowCells) break;

      // Stop if we hit a new header or separator row unexpectedly? We'll just treat it as a row.
      if (isSeparatorRow(rowCells)) {
        // Rare, but keep structure by inserting a separator cell.
        lines[j] = renderRow([rowCells[0] ?? '---', '---', ...rowCells.slice(1)]);
        changed = true;
        j++;
        continue;
      }

      // If row already has the new column (e.g., manually edited), skip.
      // Heuristic: if row length matches new header and cell[1] already looks like a known level.
      const known = new Set(['unit', 'integration', 'system', 'acceptance']);
      if (rowCells.length === newHeader.length && known.has((rowCells[1] || '').toLowerCase())) {
        j++;
        continue;
      }

      lines[j] = renderRow([rowCells[0], level, ...rowCells.slice(1)]);
      changed = true;
      j++;
    }

    // If there could be multiple tables, keep scanning after this one.
    i = j;
  }

  return {
    changed,
    content: lines.join(eol),
  };
}

async function main() {
  const files = await walk(repoRoot);

  const updated = [];
  const skipped = [];
  const warnings = [];

  for (const file of files) {
    const level = levelForFile(file);
    if (!level) {
      warnings.push(`No level mapping for: ${path.relative(repoRoot, file)}`);
      continue;
    }

    const raw = await fs.readFile(file, 'utf8');
    const { changed, content } = transformMarkdown(raw, level);

    if (!changed) {
      skipped.push(path.relative(repoRoot, file));
      continue;
    }

    await fs.writeFile(file, content, 'utf8');
    updated.push(path.relative(repoRoot, file));
  }

  const summary = {
    scanned: files.length,
    updated: updated.length,
    skipped: skipped.length,
    warnings: warnings.length,
  };

  console.log(JSON.stringify({ summary, updated, skipped, warnings }, null, 2));
}

await main();
