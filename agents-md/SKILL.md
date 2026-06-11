---
name: agents-md
description: ALWAYS read this skill before creating or modifying any AGENTS.md or CLAUDE.md file. Covers creating AGENTS.md, updating AGENTS.md, maintaining agent docs, setting up CLAUDE.md, documenting repository agent conventions, and keeping coding-agent instructions minimal and reference-backed.
---

# Maintaining AGENTS.md

> **Required**: Read this entire file before writing or editing any AGENTS.md content.

Goal: concise, actionable agent instructions.
- Target under 4,000 characters; never exceed 6,000.

## Workflow

1. Inspect before writing:
   - package manager: lock files and manifests
   - commands: `Makefile`, task runners, CI workflows
   - docs/specs/policies: `README.md`, `CONTRIBUTING.md`, `docs/`, `specs/`, `.github`, `.skills`, `AGENTS.md`
   - conventions: current code patterns, test layout, generated files, legacy areas avoid (`vendor/`, `build/`)
2. Write the smallest useful file.
3. Verify exact paths and commands exist.

## File Setup

- Create `AGENTS.md` at the repository root.
- If a Claude-compatible entrypoint is required, symlink `CLAUDE.md` to `AGENTS.md`.
- Do not maintain divergent `AGENTS.md` and `CLAUDE.md` copies.

## Sections

Add project-specific sections when they orient an agent or prevent mistakes. Drop any that don't add value for the specific repo.

| Section | Include when… |
|---------|---------------|
| Project Overview | The repo purpose isn't obvious from its name |
| Repository Structure | The layout has non-obvious directories |
| Build & Test | There are build/test/lint commands (almost always) |
| External References | Docs, specs, or policies exist that agents should consult |
| Key Conventions | The project has style rules beyond what linters enforce |
| Do Not Modify | There are generated, vendored, or script-maintained files |
| Guardrails | There are rules agents must follow (validation steps, dependency policy, doc style) |

### Format guidance

- Put commands in a table when there is more than one.
- Keep conventions as one-rule-per-bullet lists.
- Use repo-relative paths in External References tables.

## Writing Rules

- **Only include what an agent cannot learn by reading the code, directory listing, or standard tooling.** Self-check every line: "Would an agent who just read the source already know this?" If yes, omit it.
- Use [semantic line breaks](https://sembr.org/): break lines at sentence and clause boundaries, not at a fixed column width.
- Use headings, bullets, and tables; avoid paragraphs; no filler, no conversational tone.
- Use repo-relative paths; avoid vague references like "see docs".
- Reference existing docs/specs/policies instead of copying them.
- List exact external files for setup, architecture, API specs, security, release, and policy docs when they exist.
- Prefer file-scoped test/lint/typecheck commands; include full builds only when no narrower command exists.
- Put commands in tables when there is more than one.
- Keep one rule per bullet.
- Keep rationale out unless it prevents a likely mistake.
- Do not restate linter, formatter, or typechecker config.
- Do not list installed skills or plugins.
- Do not include generic quality slogans.
- Never expand existing content into verbose prose.

## External Reference Rules

- Use "Consult when…" as the header column — describe the trigger (both editing and Q&A), not the topic.
- Include both modification triggers ("changing X") and inquiry triggers ("answering questions about X").

Good:

```markdown
## External References
| Consult when… | File |
|----------------|------|
| Changing or asking about the API contract | `docs/api.md` |
| Following or asking about the release process | `docs/releasing.md` |
```

## Anti-Patterns

- welcome text, intros, conclusions, or pleasantries
- long prose explaining why instructions matter
- duplicated content from `README.md`, `CONTRIBUTING.md`, or policy docs
- project-wide commands when file-scoped commands are available
- "Testing" sections that repeat root conventions (mocks, test clocks, in-memory stores)
- flow/lifecycle walkthroughs — the agent reads code for flow; only document what the code doesn't make obvious
- type or file listings the agent would find by listing the directory
