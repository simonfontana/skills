---
name: commit-message
description: Write git commit messages for staged changes. Use when the user asks to write, draft, or review a commit message.
---

# Commit Messages

## Rules

- Imperative mood in subject line.
- Subject line ≤ 50 characters. Body lines wrapped at 72 characters.
- Subject describes the observable behaviour change.
- Body explains the motivation (why the change matters).
- Do not use conventional commit prefixes (`feat:`, `fix:`, `chore:`, etc.).
- Never mention implementation mechanisms (function names, variable names, error types, control flow, code structure).
  - **Exception:** when the change IS the implementation (refactoring, renaming, restructuring internals, test-only changes), naming the affected component in the subject is fine. The rule targets behavioural changes — don't narrate *how* you achieved a behavioural change.

## Perspective

Think: "What changes for someone reading logs, operating the system, or reviewing the changelog?"
Not: "What did the diff do at the code level?"

## Body formatting

- Default to plain prose — a short paragraph explaining why.
- Use numbered lists when describing a sequence of discrete steps or multiple distinct effects.
- Use "before/after" framing when explaining a behavioural change that has a clear prior state.
- Omit the body entirely if the subject is self-explanatory.

## Trailers

- If the user mentions a Jira ticket ID, add it as a footer: `Jira: ABC-123`. Nothing else — no "Closes", "Implements", or similar verbs.
- Do not add any other trailers unless the user asks.

## Examples

Good subject + body:

```
Stop spurious error log when no results stored

An empty result store is a normal operating condition, not a failure.
The error log created unnecessary noise during regular driving cycles.
```

Bad (mentions implementation):

```
Add ErrNoResult check before logging in doUploadOldestStoredResult

The nil-result case is already handled gracefully below, so we skip
the error log by checking errors.Is(err, store.ErrNoResult).
```

Good (refactoring — naming the component is fine here):

```
Inject Clock into SDClient for faster TTL test
```

Good (single-line, small change):

```
Reduce upload retry from 4 minutes to 30 seconds
```

Bad (narrates the diff):

```
Change time.Duration constant from 4*time.Minute to 30*time.Second
```

## Process

1. Determine what changed: check `git diff --cached`; if empty, check `git diff`; if the user describes the change verbally, use that.
2. Identify the observable effect on the system's behaviour (or, for refactoring, the structural improvement).
3. Write the subject line describing that effect (≤ 50 chars, imperative, no prefix).
4. If the motivation isn't obvious from the subject, add a body paragraph explaining why (wrapped at 72 chars).
5. Self-check: does the message contain any function names, variable names, type names, or code-level descriptions? If the commit is a behavioural change, rewrite. If it's a refactoring/test change, naming the component is acceptable.
