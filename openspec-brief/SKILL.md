---
name: openspec-brief
description: Turn an OpenSpec change (proposal.md, design.md, tasks.md, spec deltas) into one human-readable brief for developers, with Mermaid diagrams. Use this whenever someone wants an OpenSpec change explained, summarized, written up, reviewed, shared with the team, or turned into a design doc / developer doc / readable doc / implementation brief — and also when they say a spec is dense or unreadable, ask "what does this change actually do", or want something to hand reviewers before implementation starts. Prefer this over summarizing the spec files yourself; a plain summary reproduces the structure that made the spec hard to read in the first place.
---

# OpenSpec change → developer brief

OpenSpec artifacts are written so a machine can implement them without asking questions. That makes them normative (`SHALL`, `WHEN`/`THEN`), deliberately redundant (each artifact stands alone, so one fact shows up in the proposal, a decision, a requirement, its scenarios, *and* a task), and written in the eternal present tense of the finished system.

All three properties hide the thing a developer actually wants: **what will be different, and why.**

Your job is to write the document a good staff engineer writes before asking their team to review a change. Not a summary of four files — one argument, told once, with diagrams that carry weight.

Two rules shape everything below:

- **Reorganize along "what changes", never along "which file it came from."** A section per source artifact, a requirements table, or a numbered decision list mirroring `design.md` all rebuild the maze you were asked to escape.
- **Architecture, behavior and flow are the subject.** Requirement enumeration and decision cataloguing are not. Rationale still matters — it just belongs inline, where it explains a design, rather than in a list of its own.

## 1. Gather the source

Start by pinning down *which* change. If the user named a slug, use it. If they said something like "the change I just wrote", list the candidates rather than guessing — the wrong change produces a confidently wrong document:

```bash
openspec list                                # active changes
```

When more than one plausibly matches, ask instead of picking.

Then resolve that change's real artifact paths rather than guessing them. Spec deltas sit at `changes/<name>/specs/<capability>/spec.md`, which is deeper than a shallow `find` reaches, and a change may touch several capabilities.

```bash
openspec status --change "<name>" --json     # artifactPaths.* holds every real path
```

If the CLI is unavailable, glob instead — and note that an already-shipped change lives under `changes/archive/<date>-<name>/`:

```bash
ls openspec/changes/<name>/*.md openspec/changes/<name>/specs/*/spec.md
```

Read every artifact you find. Typically:

| Artifact | What you mine it for |
|---|---|
| `proposal.md` | The motivating problem, scope, blast radius (`## Impact`) |
| `design.md` | Reasoning, constraints from today's code, rejected alternatives |
| `specs/*/spec.md` | Exact behavior, ordering guarantees, and the edge cases in `#### Scenario:` blocks |
| `tasks.md` | Implementation order and dependencies on other changes |

`design.md` is optional in OpenSpec. If it's missing, the reasoning has to come from the proposal and from the code — say less about *why* rather than inventing it.

## 2. Ground it in the code

Spend a few minutes in the repository before writing. Open the packages and files named in `## Impact` and in design's "Context", and confirm the current behavior the change complains about.

This pays for itself three ways: the "today" section becomes concrete instead of abstract, you catch spec statements that have drifted from the code, and you can name real files and symbols so a reader can grep their way in. A brief whose first section is verifiably true is one a reviewer trusts.

## 3. Find the spine

Before writing a line, answer these four questions in your head. If you can't, keep reading the source.

1. What breaks or annoys people **today**, in one sentence?
2. What are the **three to five things** that are genuinely different afterwards? (Not fifteen — the spec has fifteen because it must be exhaustive. Most are consequences of a few.)
3. What is the **one runtime story** a reader has to follow to understand it? A startup path, a failure path, a state transition, a request crossing components.
4. What would a sharp reviewer **object to**, and what's the answer?

Those four answers are the document. Everything else is support.

## 4. Choose diagrams that carry weight

Two to four diagrams is normal. Each one has to answer a question that prose would need a page for — a diagram that restates a list is decoration, and readers learn to skip it.

| Use | When the interesting thing is |
|---|---|
| `flowchart` / `graph` | Wiring and data flow: who owns what, who calls whom, what moves between components |
| `sequenceDiagram` | Ordering: handshakes, who waits for whom, what completes before what starts |
| `stateDiagram-v2` | A lifecycle: modes, generations, suspend/resume, retry loops |

The highest-value diagram in a brief is usually **before/after wiring** — two small flowcharts, or one with `subgraph Today` and `subgraph After`. It shows the delta directly, which is precisely what spec prose cannot do.

Label your edges. An unlabeled box-and-arrow graph carries almost no information. Keep each diagram under roughly a dozen nodes; if it wants to be bigger, it's two diagrams.

Never restate a diagram in the paragraph next to it. The diagram shows *what* the order is; the prose says *why* it has to be that order.

## 5. The document

Decide where it goes before you write. Someone who asked for a doc to share, review, or hand to reviewers wants a file. Someone who asked a question — "what does this change actually do?" — wants an answer, and a file they didn't ask for is a chore, not a deliverable. So when the ask was a question, ask whether they want a brief written to disk; if they don't, answer in the conversation. Everything below applies either way — only the destination changes.

When you do write a file, write one markdown file. Default location, unless the user says otherwise:

```
openspec/briefs/<change-name>-brief.md
```

Never write inside `openspec/changes/<name>/`. That directory's contents are schema-defined, and `openspec archive` moves the whole thing to `changes/archive/<date>-<name>/` when the change ships — a brief stored there relocates, and every link to it breaks, at exactly the moment reviewers go looking for it. A sibling `briefs/` directory keeps the brief next to the specs it explains without being part of them.

Keep this five-beat spine and its order — problem → shape → behavior → code → caveats is how a developer reads. Make the headings concrete where a concrete heading is clearly better ("Today: suspending only pauses the scheduler" beats "The problem").

Title the document with what the change *does*, not with its slug: "Suspending the vehicle now stops every component, not just the scheduler" tells a reader whether to keep going; "Coordinator Resilience" does not.

```markdown
# <Change name as a claim, not a slug>

*Source: `openspec/changes/<name>/` · <one line on any change this builds on>*

<Lede: two or three sentences, no heading. What this change does and why it
matters, written so someone who closes the tab here still understood the point.>

## The problem today
<The concrete pain, grounded in real code. Name files and types. If a diagram
of today's wiring makes the problem obvious, put it here.>

## What changes
<The shape of the change. The before/after picture. The three-to-five genuinely
different things, each with the reasoning folded in.>

## How it behaves
<The runtime story. Ordering, states, and the edge cases that make it subtle —
this is where sequence and state diagrams live, and where the spec's WHEN/THEN
scenarios become illustrations woven into prose.>

## What lands in the code
<Packages and files touched, new or changed interfaces and signatures, anything
breaking, and the order the work has to happen in. Prose or a small table —
never a copy of tasks.md's checkboxes.>

## Trade-offs and open questions
<Roads not taken, one line each, phrased as the question a reviewer would ask.
Real risks. Anything the spec deliberately left unresolved.>
```

Drop a section when the change genuinely has nothing for it; don't pad it.

**Never invent behavior the spec doesn't state.** If something is unresolved, it belongs in open questions. Specs leave gaps on purpose, and quietly filling them turns a trustworthy doc into a misleading one.

## 6. Writing moves

Spec register and prose register are different languages. Translate rather than transcribe:

**Kill the modal verbs.** `SHALL` is the single strongest boredom signal in the source.

> Spec: *The uploader SHALL retry with exponential backoff up to five attempts.*
> Doc: *Uploads retry with exponential backoff, giving up after five attempts — long enough to ride out a tunnel, short enough that a dead endpoint doesn't pin a worker for an hour.*

**Recover the delta.** Spec prose describes the finished system; the reader wants the difference.

> Spec: *The queue SHALL persist accepted work before acknowledging.*
> Doc: *Today an accepted job lives only in memory, so a crash loses it. After this change the queue writes to disk before it acknowledges.*

**Turn scenarios into illustrations.** `WHEN`/`THEN` blocks are the best material in the whole spec — they're the edge cases someone already thought hard about. Weave them into the prose as concrete cases; don't dump them as a table.

> Spec: *WHEN shutdown races an in-flight upload THEN the upload completes before Stop returns.*
> Doc: *Stop is a completion barrier, not a signal: an upload already on the wire finishes before it returns. That's what keeps a shutdown during a large transfer from stranding a half-written object.*

**Say the punchline first.** Each section opens with its conclusion and then supports it. Building up to a point is fine in a spec, which is read by search; it's tiring in a document read start to finish.

**Use real names.** `ResultSink`, `Suspend()`, `packages/uploader/`. Specs are full of real identifiers — carrying them over is both more interesting and more useful, because a reader can grep.

## 7. Cut

Write the draft, then delete. This step is not optional; it's where the document gets good.

- **A fact appearing in four artifacts appears once here.** That redundancy was for machines.
- **If it survives only because it was in the source, it goes.** Every sentence earns its place by telling this reader something.
- **If the doc is longer than the `design.md` it explains, you transcribed instead of writing.** That's the fastest signal to trust. With no `design.md` to measure against, use the whole change: a brief longer than the artifacts it replaces has failed at its one job.
- **Read it as a developer who has never seen the change.** Would you understand it? Would you finish it?

## Mermaid that actually renders

A broken diagram is worse than none — some viewers show a raw error block. Validate every diagram before you hand the document over:

- In VS Code, the `mermaid-diagram-validator` tool, contributed by the [Mermaid Chart extension](https://marketplace.visualstudio.com/items?itemName=MermaidChart.vscode-mermaid-chart). It's an agent tool, not a CLI — it exists only when that extension is installed.
- Anywhere else, `npx -y @mermaid-js/mermaid-cli -i <file>.md -o /dev/null`.

If neither is available, say so and offer to install one rather than shipping unchecked diagrams. Whatever you use, these are the failures that bite most often:

- Parentheses, brackets, colons and commas in node labels break the parser. Quote the label: `A["Coordinator (v2)"]`.
- `end` as a bare node name or label collides with `subgraph`'s terminator. Capitalize or quote it.
- Arrows inside labels (`-->` in text) terminate the label early. Write "then" or use `&gt;`.
- `stateDiagram-v2`, not `stateDiagram`. Only `-v2` supports composite states and notes reliably.
- In `sequenceDiagram`, declare participants explicitly; implicit ones appear in first-mention order, which is rarely the order you want.
- Keep semicolons out. They're legal but inconsistent support makes them a needless risk.

## When the change sits on a stack

Changes often depend on earlier ones, and `tasks.md` usually opens with a prerequisite section naming them. A document that silently assumes a component from an unarchived change reads as fiction.

State the baseline in the source line under the title — "Builds on `introduce-coordinator`; assumes the coordinator exists and is wired in" — and, where it matters, mark which parts of the "today" picture are today's *code* versus today's *plan*.
