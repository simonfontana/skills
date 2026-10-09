---
name: agents-md
description: AGENTS.md and CLAUDE.md files. Read before creating or editing either one.
---

# Maintaining AGENTS.md

An AGENTS.md is a cache: it holds only what an agent cannot find by reading the code, the directory listing, or standard tooling.
Test every line with one question: would an agent who just read the source already know this?
If yes, leave the line out.

Size: under 4,000 characters; never over 6,000.

## Workflow

1. Inspect the repository before writing:
   - package manager: lock files and manifests
   - commands: `Makefile`, task runners, CI workflows
   - docs, specs, and policies: `README.md`, `CONTRIBUTING.md`, `docs/`, `specs/`, `.github/`, `.skills/`, an existing `AGENTS.md`
   - conventions: code patterns, test layout, generated files, legacy areas to avoid (`vendor/`, `build/`)
2. Write the smallest file that covers the sections below that apply.
3. Check the file: every path and command in it exists, and `wc -c AGENTS.md` reports under 4,000.

## File setup

- Create `AGENTS.md` at the repository root.
- When a Claude-compatible entry point is needed, make `CLAUDE.md` a symlink to `AGENTS.md`, so only one copy exists.

## Sections

Include a section only when it orients an agent or prevents a mistake in this repository.

| Section | Include when… |
|---------|---------------|
| Project Overview | The repo purpose isn't obvious from its name |
| Repository Structure | The layout has non-obvious directories |
| Build & Test | There are build/test/lint commands (almost always) |
| External References | Docs, specs, or policies exist that agents should consult |
| Key Conventions | The project has style rules beyond what linters enforce |
| Do Not Modify | There are generated, vendored, or script-maintained files |
| Guardrails | There are rules agents must follow (validation steps, dependency policy, doc style) |

## Writing rules

- Write terse, impersonal text in headings, bullets, and tables, one rule per bullet.
- Put commands in a table when there are several.
  Prefer file-scoped test, lint, and typecheck commands; list a full build only when no narrower command exists.
- Use exact repo-relative paths in place of phrases like "see docs".
- Point to existing docs, specs, and policies instead of copying them.
  When setup, architecture, API, security, release, or policy docs exist, list them under External References.
- Give a reason only when it prevents a likely mistake.
- Use [semantic line breaks](https://sembr.org/): break lines at sentence and clause boundaries, not at a fixed column.
- When editing an existing file, keep its content as terse as you found it.

The cache test usually removes:

- intros, conclusions, and quality slogans
- linter, formatter, or typechecker settings
- installed skills or plugins
- walkthroughs of control flow or lifecycles
- type or file listings that a directory listing shows
- test conventions the code already shows (mocks, test clocks, in-memory stores)

## External References

Name the trigger, not the topic, in a "Consult when…" column.
Cover both triggers: changing the subject, and answering questions about it.

```markdown
## External References
| Consult when… | File |
|----------------|------|
| Changing or asking about the API contract | `docs/api.md` |
| Following or asking about the release process | `docs/releasing.md` |
```
