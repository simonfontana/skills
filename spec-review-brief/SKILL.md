---
name: spec-review-brief
description: Only use when the user invokes this skill by name. Unofficial, custom skill (not part of the OpenSpec project) that turns an OpenSpec change (proposal.md, design.md, tasks.md, spec deltas) into one readable brief, with Mermaid diagrams where useful, for a developer's first-pass review. Writes the brief to .local/change-briefs/ in the project being reviewed.
disable-model-invocation: true
---

# OpenSpec change → developer brief

OpenSpec artifacts are written so a machine can implement them without asking questions. That makes them normative (`SHALL`, `WHEN`/`THEN`), deliberately redundant (each artifact stands alone, so one fact shows up in the proposal, a decision, a requirement, its scenarios, *and* a task), and written in the eternal present tense of the finished system.

All three properties hide the thing a developer actually wants: **what will be different, and why.**

Your job is to write the document a good staff engineer writes before asking their team to review a change. The reader is a developer on the team doing a first-pass review; the brief helps them understand the change, but the OpenSpec artifacts remain the authority for requirements. Not a summary of four files — one argument, told once, with diagrams where they carry weight.

Two rules shape everything below:

- **Reorganize along "what changes", never along "which file it came from."** A section per source artifact, a requirements table, or a numbered decision list mirroring `design.md` all rebuild the maze you were asked to escape.
- **Architecture, behavior and flow are the subject.** Requirement enumeration and decision cataloguing are not. Rationale still matters — it just belongs inline, where it explains a design, rather than in a list of its own.

## 1. Gather the source

Start by pinning down *which* change. If the user named a slug, use it. If they said something like "the change I just wrote", list the candidates rather than guessing — the wrong change produces a confidently wrong document:

```bash
openspec list                                # active changes
```

When more than one plausibly matches, ask instead of picking.

Once the change is identified, check whether the output file in section 5 already exists. If it does, warn the user early and stop until they confirm that it may be replaced. Do this before reading the remaining artifacts or drafting the brief.

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
| `tasks.md` | Dependencies on other changes, and work order that affects integration, compatibility, migration, or what can be reviewed independently; leave routine build steps there |

`design.md` is optional in OpenSpec. If it's missing, the reasoning has to come from the proposal — say less about *why* rather than inventing it.

If artifacts disagree, do not choose a side silently. Ask before writing if either reading would change the brief's central claim or runtime diagram, or if a missing answer would do the same. Put narrower conflicts in open questions, without presenting either reading as settled.

## 2. Fill gaps in today's behavior

Trust the change's own description of today's behavior by default. When a claim about current code is central to the brief's problem or before/after picture and the named code is available, follow only enough of that code path to confirm or reject it. If the code contradicts the change, pause and ask about the specific discrepancy before writing the brief. Do not audit unrelated behavior.

When the description is too thin to explain the problem — for example no `design.md`, a one-line "Why", and deltas that describe only the result — fill the gap in this order:

1. Read the current spec of each capability the change touches, `openspec/specs/<capability>/spec.md`. It describes the system before this change.
2. If that is still not enough, open the files named in the proposal's `## Impact`.
3. If that code is not in this repository (for example, the change lives in a separate OpenSpec store), skip step 2 and say in the brief that today's behavior comes from the spec only.

## 3. Find the spine

Before writing a line, answer these four questions in your head. If you can't, keep reading the source.

1. What breaks or annoys people **today**, in one sentence?
2. What are the **three to five things** that are genuinely different afterwards? (Not fifteen — the spec has fifteen because it must be exhaustive. Most are consequences of a few.)
3. What is the **one runtime story** a reader has to follow to understand it? A startup path, a failure path, a state transition, a request crossing components.
4. What would a sharp reviewer **object to**? Answer from the artifacts when possible; otherwise make it an open question.

Those four answers are the document. Everything else is support.

## 4. Choose diagrams that carry weight

Use diagrams only where they clarify a real structural, ordering, or state change; a brief may have none. Each one has to answer a question that prose would need a page for — a diagram that restates a list is decoration, and readers learn to skip it.

| Use | When the interesting thing is |
|---|---|
| `flowchart` / `graph` | Wiring and data flow: who owns what, who calls whom, what moves between components |
| `sequenceDiagram` | Ordering: handshakes, who waits for whom, what completes before what starts |
| `stateDiagram-v2` | A lifecycle: modes, generations, suspend/resume, retry loops |

When wiring changes, **before/after wiring** often shows the delta directly. Draw it as **two separate diagrams**, "today" first and "after" second, each with a one-line lead-in. Do not put the two states in one diagram as side-by-side subgraphs: with no edges between them, the layout engine orders subgraphs by the nodes inside them rather than by declaration order, so "after" often renders on the left and the reader sees the change backwards. Two diagrams also stay readable on a narrow screen.

Label conceptual diagrams as conceptual, and do not imply ownership, component boundaries, or ordering that the source does not establish. Label your edges. An unlabeled box-and-arrow graph carries almost no information. Keep each diagram under roughly a dozen nodes; if it wants to be bigger, it's two diagrams.

Never restate a diagram in the paragraph next to it. The diagram shows *what* the order is; the prose says *why* it has to be that order.

## 5. The document

Always write one markdown file, then post a two- or three-sentence summary in the conversation with a link to it. Default location in the project being reviewed, unless the user says otherwise:

```
.local/change-briefs/<change-name>-brief.md
```

Do not stage or commit the brief. Do not edit the project's `.gitignore`; suggest adding `.local/change-briefs/` to it at the end of the conversation summary, so the repository owner can decide whether to ignore the directory.

Never write anywhere under `openspec/`. A brief is a snapshot: it goes out of date the first time someone edits the change, and nothing updates it. An agent working on the spec reads what is under `openspec/` and cannot tell a brief from an artifact, so it would take the old version as a requirement. Inside `openspec/changes/<name>/` it is worse again — `openspec archive` moves that directory when the change ships, and every link to the brief breaks.

Location alone is not enough, because an agent can still reach the brief through a search. So every brief file opens with the notice in the template below.

Keep this five-beat spine and its order — problem → shape → behavior → code → caveats is how a developer reads. Make the headings concrete where a concrete heading is clearly better ("Today: suspending only pauses the scheduler" beats "The problem").

Title the document with what the change *does*, not with its slug: "Suspending the vehicle now stops every component, not just the scheduler" tells a reader whether to keep going; "Coordinator Resilience" does not.

Link claims that affect behavior, ordering, or compatibility to the relevant source artifacts. Routine background needs no citation; links should help a reviewer check consequential claims without turning the brief into a requirements list.

```markdown
# <Change name as a claim, not a slug>

> **Not part of the spec.** This brief summarizes `openspec/changes/<name>/`
> as of <YYYY-MM-DD>, with commit `<short-sha>` as a reference point. It is
> not an OpenSpec artifact and is not updated when the change is, so it may
> be out of date. For requirements, read the change itself.

*<If this builds on another change: name what the brief assumes, and whether that part is implemented or planned.>*

<Lede: two or three sentences, no heading. What this change does and why it
matters, written so someone who closes the tab here still understood the point.>

## The problem today
<The concrete pain, grounded in available sources. Name files and types when
known. If a diagram of today's wiring makes the problem obvious, put it here.>

## What changes
<The shape of the change. The before/after picture. The three-to-five genuinely
different things, each with the reasoning folded in.>

## How it behaves
<The runtime story. Ordering, states, and the edge cases that make it subtle —
this is where sequence and state diagrams live, and where the spec's WHEN/THEN
scenarios become illustrations woven into prose.>

## What lands in the code
<Packages and files touched, new or changed interfaces and signatures, anything
breaking, and dependencies or work order that create review risks. Prose or a
small table — never a copy of tasks.md's checkboxes.>

## Trade-offs and open questions
<Roads not taken, one line each, phrased as the question a reviewer would ask.
Real risks, narrower conflicts, and anything the spec left unresolved. Do not supply an unsupported answer.>
```

Put the notice directly under the title, since the top of a file is what an agent reads before deciding what the file is. Fill in the commit with `git rev-parse --short HEAD`; it is a reference point, not proof that all source content was committed. If the source includes uncommitted working-tree edits, say so in the notice. A reader can run `git diff <sha> -- openspec/changes/<name>/` to see tracked changes since that commit.

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
- **Read it as a developer who has never seen the change.** Would you understand it? Would you finish it?

## 8. Check the brief

Run the checks, fix what they report, and run them again until they all pass:

```bash
<skill-dir>/scripts/check-brief.sh <brief>.md <change-dir>
```

`<skill-dir>` is the directory holding this file. `<change-dir>` is the change's directory, `openspec/changes/<name>/` or its `archive/` path. The script needs only Bash and standard tools. It fails when:

- the brief is too long compared with the change — cut it (step 7);
- the "Not part of the spec" notice is missing or not directly under the title;
- `SHALL` or `MUST` appears outside a blockquote or code — rewrite that sentence as prose (step 6).

Then check every diagram as described in [Checking the diagrams](#checking-the-diagrams).

Finally, have a read-only second agent compare the brief with the change artifacts and any code checked for central claims, when an agent is available. Ask it to flag consequential omissions, unsupported claims, and misleading diagrams, not to rewrite the brief. Resolve its findings yourself, then rerun affected checks. Without a second agent, make the same comparison directly. Do not treat the review as proof that every requirement is covered; the brief is still a first-pass aid.

## Mermaid that actually renders

A broken diagram can go unnoticed: some viewers show a raw error block, but others drop the diagram without any error, so a reader cannot tell anything is missing. That is why the diagrams have to be checked before you hand the brief over.

### Rules for writing diagrams

- Quote flowchart node labels: `A["Coordinator (v2)"]`. Unquoted parentheses, brackets, colons and commas break the parser.
- Quote flowchart edge labels: `A -->|"starts, then waits"| B`.
- In `stateDiagram-v2`, give any state name with spaces or punctuation an ID: `state "Waiting for ack" as Waiting`, then use `Waiting` in transitions.
- Never write `-->` inside a label or message; it ends the label early. Write "then".
- `end` as a bare node ID collides with `subgraph`'s terminator. Use another ID, such as `Done`.
- `stateDiagram-v2`, not `stateDiagram`. Only `-v2` supports composite states and notes reliably.
- In `sequenceDiagram`, declare every participant at the top. Undeclared ones appear in first-mention order, which is rarely the order you want.
- Keep semicolons out of labels and messages. Mermaid can read one as the end of a statement.
- Unconnected `subgraph`s render in an order the layout engine picks, not the order you wrote them. A validator passes and the diagram still reads wrong, so split them into separate diagrams instead.

### Checking the diagrams

1. If your agent has a Mermaid validation tool, for example `mermaid-diagram-validator` from the Mermaid Chart VS Code extension, run it on each diagram. A reported syntax error is a result: fix it and run the tool again. If the tool itself fails, errors, or does not respond, stop using it for this brief and go to step 2. Do not look for other tools or install anything.
2. Without a working tool, check by reading, as a separate pass after the brief is written. Take one diagram at a time, go through every rule above against it, and fix what fails.

In the conversation summary, say how the diagrams were checked: with the tool, or by reading against the rules because no validator was available. Leave this out of the brief itself.

## When the change sits on a stack

Changes often depend on earlier ones, and `tasks.md` usually opens with a prerequisite section naming them. Read only enough of an unarchived prerequisite to tell which parts exist in code and which are planned; do not summarize the other change. A document that silently assumes a component from an unarchived change reads as fiction.

State the specific baseline in the line under the notice — "Builds on `introduce-coordinator`; coordinator wiring is planned, not yet in code" — and, where it matters, mark which parts of the "today" picture are today's *code* versus today's *plan*. If the status cannot be established and changes the central story, ask before writing.
