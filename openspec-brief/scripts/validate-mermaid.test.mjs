import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const validator = fileURLToPath(new URL('./validate-mermaid.mjs', import.meta.url));

function validate(markdown) {
  const directory = mkdtempSync(join(tmpdir(), 'validate-mermaid-'));
  const file = join(directory, 'fixture.md');
  writeFileSync(file, markdown);

  try {
    return spawnSync(process.execPath, [validator, file], { encoding: 'utf8' });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('validates CommonMark fence variants, including a fence extending to EOF', () => {
  const diagram = 'flowchart TD\n  A --> B';
  const result = validate([
    `\`\`\`mermaid\n${diagram}\n\`\`\``,
    ` \`\`\`mermaid\n ${diagram}\n \`\`\``,
    `\`\`\`\`mermaid\n${diagram}\n\`\`\`\``,
    `~~~mermaid\n${diagram}\n~~~`,
    `\`\`\` mermaid\n${diagram}`,
  ].join('\n\n'));

  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /5\/5 diagram\(s\) valid/);
});

test('rejects invalid Mermaid in every supported fence variant', () => {
  const diagram = 'not valid mermaid';
  const result = validate([
    `\`\`\`mermaid\n${diagram}\n\`\`\``,
    ` \`\`\`mermaid\n ${diagram}\n \`\`\``,
    `\`\`\`\`mermaid\n${diagram}\n\`\`\`\``,
    `~~~mermaid\n${diagram}\n~~~`,
    `\`\`\` mermaid\n${diagram}`,
  ].join('\n\n'));

  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout, /0\/5 diagram\(s\) valid/);
});

test('ignores Mermaid examples inside another fenced block', () => {
  const result = validate('````markdown\n```mermaid\nnot valid mermaid\n```\n````\n');

  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /0\/0 diagram\(s\) valid/);
});