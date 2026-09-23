#!/usr/bin/env node
// Validate every ```mermaid block in one or more markdown files.
//
//   node validate-mermaid.mjs <file.md> [file.md ...]
//
// Uses mermaid.parse(), which checks syntax without rendering, so no browser is
// needed. Requires `npm install` in this directory first; it never installs on
// your behalf.
//
// Exit codes: 0 all valid, 1 a diagram failed, 2 bad usage or unreadable file,
// 3 deps missing.

import { readFileSync } from 'node:fs';
import { dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('usage: node validate-mermaid.mjs <file.md> [file.md ...]');
  process.exit(2);
}

async function load(spec) {
  try {
    return await import(spec);
  } catch (err) {
    if (err?.code !== 'ERR_MODULE_NOT_FOUND') throw err;
    console.error(`Missing ${spec}. To enable parser-based validation, run:\n`);
    console.error(`    npm install --prefix ${here}\n`);
    console.error('Skipping this step is fine — the diagrams just go out unchecked.');
    process.exit(3);
  }
}

const { JSDOM } = await load('jsdom');
const dom = new JSDOM('<!DOCTYPE html><body></body>');

// mermaid reaches for these at import time, so define them before importing it.
for (const key of ['window', 'document', 'Element', 'Node', 'HTMLElement', 'SVGElement', 'DOMParser', 'navigator']) {
  try {
    const value = key === 'window' ? dom.window : dom.window[key];
    Object.defineProperty(globalThis, key, { value, writable: true, configurable: true });
  } catch {
    // read-only global on newer Node; mermaid tolerates the built-in one
  }
}

const mermaid = (await load('mermaid')).default;
mermaid.initialize({ startOnLoad: false });

function* mermaidBlocks(src) {
  const lines = src.split(/\r?\n/);

  for (let index = 0; index < lines.length; index++) {
    const opening = /^( {0,3})(`{3,}|~{3,})(.*)$/.exec(lines[index]);
    if (!opening) continue;

    const marker = opening[2][0];
    const fenceLength = opening[2].length;
    const info = opening[3].trim();

    // Backticks are forbidden in the info string of a backtick fence.
    if (marker === '`' && info.includes('`')) continue;

    const contentStart = index + 1;
    let contentEnd = contentStart;
    const closing = new RegExp(`^ {0,3}\\${marker}{${fenceLength},}[ \\t]*$`);
    while (contentEnd < lines.length && !closing.test(lines[contentEnd])) contentEnd++;

    if (info.split(/\s+/, 1)[0] === 'mermaid') {
      const indent = opening[1].length;
      const body = lines
        .slice(contentStart, contentEnd)
        .map((line) => line.replace(new RegExp(`^ {0,${indent}}`), ''))
        .join('\n');
      yield { body, line: index + 1 };
    }

    index = contentEnd;
  }
}

let total = 0;
let failed = 0;

for (const file of files) {
  let src;
  try {
    src = readFileSync(file, 'utf8');
  } catch (err) {
    console.error(`Cannot read ${file}: ${err.message}`);
    process.exit(2);
  }

  const rel = relative(process.cwd(), file);
  const label = rel && !rel.startsWith('..') ? rel : file;

  for (const block of mermaidBlocks(src)) {
    total++;
    try {
      const { diagramType } = await mermaid.parse(block.body, { suppressErrors: false });
      console.log(`OK   ${label}:${block.line} (${diagramType})`);
    } catch (err) {
      failed++;
      console.log(`FAIL ${label}:${block.line}`);
      console.log(String(err?.message ?? err).replace(/^/gm, '     '));
    }
  }
}

console.log(`\n${total - failed}/${total} diagram(s) valid`);
process.exit(failed > 0 ? 1 : 0);
