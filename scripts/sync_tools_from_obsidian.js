#!/usr/bin/env node
/**
 * Keep the Obsidian tool notes and tools.json synchronized.
 *
 * Source of truth: MY-NOTES/THEHUB/Tools/<category>/<slug>.md
 *
 * First migration only:
 *   node scripts/sync_tools_from_obsidian.js --import-json
 *
 * Normal workflow:
 *   node scripts/sync_tools_from_obsidian.js --check
 *   node scripts/sync_tools_from_obsidian.js --apply
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HUB = path.join(ROOT, 'MY-NOTES', 'THEHUB');
const TOOLS_DIR = path.join(HUB, 'Tools');
const CATEGORIES_DIR = path.join(HUB, 'Categories');
const JSON_PATH = path.join(ROOT, 'tools.json');
const REQUIRED = [
  'name', 'slug', 'by', 'blurb', 'category', 'tags',
  'pricing', 'badges', 'url', 'review', 'added',
];

const args = new Set(process.argv.slice(2));
const IMPORT_JSON = args.has('--import-json');
const APPLY = args.has('--apply');
const CHECK = args.has('--check') || (!IMPORT_JSON && !APPLY);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function frontmatterValue(value) {
  return JSON.stringify(value);
}

function noteFor(tool, order) {
  const rows = [
    '---',
    `name: ${frontmatterValue(tool.name)}`,
    `slug: ${frontmatterValue(tool.slug)}`,
    `by: ${frontmatterValue(tool.by)}`,
    `blurb: ${frontmatterValue(tool.blurb)}`,
    `category: ${frontmatterValue(tool.category)}`,
    `tags: ${frontmatterValue(tool.tags)}`,
    `pricing: ${frontmatterValue(tool.pricing)}`,
    `badges: ${frontmatterValue(tool.badges)}`,
    `url: ${frontmatterValue(tool.url)}`,
    `review: ${frontmatterValue(tool.review)}`,
    `added: ${frontmatterValue(tool.added)}`,
    `order: ${order}`,
    '---',
    '',
    `# ${tool.name}`,
    '',
    `**What:** ${tool.blurb}`,
    '',
    `**Who:** ${tool.by}`,
    '',
    `**Where:** [Official website](${tool.url}) · [Qutaifan review route](https://www.qutaifan.com${tool.review})`,
    '',
    `**Category:** [[${tool.category}]] · **Pricing:** ${tool.pricing}`,
    '',
    '> Edit the Properties/frontmatter above. Then run `node scripts/sync_tools_from_obsidian.js --apply` from the repo root.',
    '',
  ];
  return rows.join('\n');
}

function parseYamlScalar(raw) {
  const value = raw.trim();
  if (value === '') return '';
  try {
    return JSON.parse(value);
  } catch {
    if (value.startsWith("'") && value.endsWith("'")) {
      return value.slice(1, -1).replace(/''/g, "'");
    }
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null' || value === '~') return null;
    if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value);
    return value;
  }
}

function parseFrontmatter(block, file) {
  const data = {};
  const lines = block.split(/\r?\n/);
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const sep = line.indexOf(':');
    if (sep < 1) throw new Error(`${file}: invalid frontmatter line: ${line}`);
    const key = line.slice(0, sep).trim();
    const raw = line.slice(sep + 1).trim();

    if (raw === '') {
      const items = [];
      while (index + 1 < lines.length && /^\s+-\s*/.test(lines[index + 1])) {
        index++;
        items.push(parseYamlScalar(lines[index].replace(/^\s+-\s*/, '')));
      }
      data[key] = items.length ? items : (key === 'tags' || key === 'badges' ? [] : '');
    } else {
      data[key] = parseYamlScalar(raw);
    }
  }
  return data;
}

function parseNote(file) {
  const text = fs.readFileSync(file, 'utf8');
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error(`${file}: missing YAML frontmatter`);

  const data = parseFrontmatter(match[1], file);

  for (const key of REQUIRED) {
    if (!(key in data)) throw new Error(`${file}: missing property "${key}"`);
  }
  if (!Array.isArray(data.tags) || !Array.isArray(data.badges)) {
    throw new Error(`${file}: tags and badges must be arrays`);
  }
  const basename = path.basename(file, '.md');
  if (basename !== data.slug && basename !== `tool--${data.slug}`) {
    throw new Error(`${file}: filename must be "tool--${data.slug}.md"`);
  }
  if (path.basename(path.dirname(file)) !== data.category) {
    throw new Error(`${file}: parent folder must match category "${data.category}"`);
  }

  const tool = {};
  for (const key of REQUIRED) tool[key] = data[key];
  return { tool, order: Number.isFinite(data.order) ? data.order : Number.MAX_SAFE_INTEGER };
}

function markdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? markdownFiles(full) : entry.name.endsWith('.md') ? [full] : [];
  });
}

function readToolsFromNotes() {
  const records = markdownFiles(TOOLS_DIR).map(parseNote);
  records.sort((a, b) => a.order - b.order || a.tool.name.localeCompare(b.tool.name));

  const slugs = new Set();
  for (const { tool } of records) {
    if (slugs.has(tool.slug)) throw new Error(`Duplicate slug: ${tool.slug}`);
    slugs.add(tool.slug);
  }
  return records.map(({ tool }) => tool);
}

function groupByCategory(tools) {
  const groups = new Map();
  for (const tool of tools) {
    if (!groups.has(tool.category)) groups.set(tool.category, []);
    groups.get(tool.category).push(tool);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function categoryNote(category, tools) {
  const lines = [
    '---',
    'generated: true',
    `category: ${frontmatterValue(category)}`,
    '---',
    '',
    `# ${category}`,
    '',
    '> Generated by `scripts/sync_tools_from_obsidian.js`. Edit individual tool notes, not this page.',
    '',
    '| What | Who | Where | Pricing |',
    '|---|---|---|---|',
  ];
  for (const tool of tools.sort((a, b) => a.name.localeCompare(b.name))) {
    lines.push(`| [[tool--${tool.slug}|${tool.name}]] — ${tool.blurb.replace(/\|/g, '\\|')} | ${tool.by.replace(/\|/g, '\\|')} | [Website](${tool.url}) · [Review route](https://www.qutaifan.com${tool.review}) | ${tool.pricing} |`);
  }
  lines.push('');
  return lines.join('\n');
}

function directoryNote(groups, total) {
  const lines = [
    '---',
    'generated: true',
    '---',
    '',
    '# Freeapps — What, Who, Where',
    '',
    '> This directory is generated. The individual notes under `Tools/` are the source of truth.',
    '',
    `**${total} tools · ${groups.length} categories**`,
    '',
    '| Category | What is inside | Count |',
    '|---|---|---:|',
  ];
  for (const [category, tools] of groups) {
    lines.push(`| [[${category}]] | ${tools.slice(0, 5).map((tool) => tool.name).join(', ')}${tools.length > 5 ? ', …' : ''} | ${tools.length} |`);
  }
  lines.push('', '## How ownership works', '', '1. Open a category above.', '2. Open the tool note.', '3. Edit its Properties: **What** (`blurb`), **Who** (`by`), and **Where** (`url` and `review`).', '4. Run `node scripts/sync_tools_from_obsidian.js --apply`.', '5. The script validates all notes and rebuilds `tools.json`.', '');
  return lines.join('\n');
}

function writeGeneratedIndexes(tools) {
  ensureDir(CATEGORIES_DIR);
  const groups = groupByCategory(tools);
  for (const [category, categoryTools] of groups) {
    fs.writeFileSync(path.join(CATEGORIES_DIR, `${category}.md`), categoryNote(category, categoryTools));
  }
  fs.writeFileSync(path.join(HUB, 'Freeapps-Tools-by-Category.md'), directoryNote(groups, tools.length));
}

function writeToolNotes(tools) {
  ensureDir(TOOLS_DIR);
  const expected = new Set();
  tools.forEach((tool, index) => {
    const dir = path.join(TOOLS_DIR, tool.category);
    ensureDir(dir);
    const file = path.join(dir, `tool--${tool.slug}.md`);
    expected.add(file);
    fs.writeFileSync(file, noteFor(tool, index));
  });
  for (const file of markdownFiles(TOOLS_DIR)) {
    if (!expected.has(file)) fs.unlinkSync(file);
  }
}

function importJson() {
  const tools = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  tools.forEach((tool, index) => {
    for (const key of REQUIRED) {
      if (!(key in tool)) throw new Error(`tools.json item ${index} missing "${key}"`);
    }
  });
  writeToolNotes(tools);
  writeGeneratedIndexes(tools);
  console.log(`Imported ${tools.length} tools into ${TOOLS_DIR}`);
}

function normalizedJson(tools) {
  return `${JSON.stringify(tools, null, 2)}\n`;
}

function main() {
  if (IMPORT_JSON) importJson();

  const tools = readToolsFromNotes();
  if (!tools.length) throw new Error(`No tool notes found in ${TOOLS_DIR}`);
  const next = normalizedJson(tools);
  const current = fs.existsSync(JSON_PATH) ? fs.readFileSync(JSON_PATH, 'utf8').replace(/\r\n/g, '\n') : '';

  if (APPLY) {
    fs.writeFileSync(JSON_PATH, next);
    writeToolNotes(tools);
    writeGeneratedIndexes(tools);
    console.log(`Applied ${tools.length} Obsidian tool notes to tools.json and regenerated indexes.`);
  } else if (CHECK) {
    if (current !== next) {
      console.error('OUT OF SYNC: Obsidian tool notes differ from tools.json.');
      console.error('Run: node scripts/sync_tools_from_obsidian.js --apply');
      process.exitCode = 1;
    } else {
      console.log(`OK: ${tools.length} Obsidian tool notes match tools.json.`);
    }
  }
}

try {
  main();
} catch (error) {
  console.error(`ERROR: ${error.message}`);
  process.exitCode = 1;
}
