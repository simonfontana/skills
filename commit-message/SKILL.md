---
name: commit-message
description: Commit messages for staged changes or existing commits. Use when asked to write, review, or rewrite a commit message.
---

# Commit Messages

Write for a developer who knows the project's language and domain but has
not read the changed code.

## Process

1. Read the changes:
   - Staged changes: run `git diff --staged`. If nothing is staged, say so
     and ask whether to use the unstaged changes. Do not stage anything.
   - An existing commit: run the command below. `--format=` leaves out the
     author, date, and message, and prints only the diff.

     ```sh
     git show --format= <commit>
     ```

   - If the user describes the change instead, use the description.
2. If there is an existing message, from the user or from a commit, write
   your own from the diff alone and read the existing one only at step 7;
   "Improving an existing message" gives the reason. Until then, read an
   existing commit only with the commands in steps 1 and 3. Other
   commands, such as `git log` or `git show` without `--format=`, print
   the message. If the user pasted it, leave it unread while you write.
3. Read enough of the surrounding code to name the actors: the callers,
   background tasks, services, or people that the change affects. If the
   diff does not show why the change is needed, read the nearest test,
   documentation, or git history. For an existing commit, read files as
   they were at that commit, and only the history before it:

   ```sh
   git show <commit>:<path>
   git log <commit>^ -- <path>
   ```
4. Work out what prompted the change, what it changes, and why this
   approach works. Use only facts that the code or the user supports.
   Never invent a cause, symptom, or impact.
5. Write the message by the rules below.
6. Reread it as a developer who has not seen the diff. They should be able
   to tell what prompted the change, what it changes, and why the approach
   works. Remove every detail that does not help with one of these. Then
   check every name copied from the code, such as a camelCase or
   snake_case identifier: keep it only if it passes "Words and names".
7. If there is an existing message, read and compare it now; see
   "Improving an existing message". For an existing commit, run
   `git log -1 --format=%B <commit>`.
8. Measure the line lengths instead of estimating them:

   ```sh
   grep -n '' <<'EOF' | grep -E '^1:.{51,}$|^[0-9]+:.{73,}$'
   <message>
   EOF
   ```

   The first `grep` numbers the lines, and the second prints each line
   that is too long. Rewrap each line it prints, then run it again until
   it prints nothing; `grep` then exits with status 1.
9. Show the message in one fenced code block, with nothing else inside the
   block.
   - If the code does not show the motivation, show a draft with the parts
     the code supports, and ask the user one question about the missing
     motivation.
   - If the staged changes contain unrelated concerns, write one message
     that covers all of them. After the block, add one line that names the
     separate concerns and says they would be better as separate commits.
   - Do not run `git commit` unless the user asks.

## Subject

- Use the imperative mood: "Prevent", not "Prevents" or "Prevented".
- Use at most 50 characters.
- Start with the verb. Leave out conventional commit prefixes (`feat:`,
  `fix:`, `chore:`).
- Describe the change that a user, operator, or caller would notice, not
  how it was made. For a refactoring, rename, or test-only change, the
  subject may describe the structure or the tests instead.

## Body

- Omit the body when the subject says everything the reader needs.
- Otherwise, give the full chain of cause, effect, and change, and nothing
  more. One to three short paragraphs is typical. Stop once the chain is
  complete; do not end with a general summary of the fix.
- For a fix, say when the failure happens, what goes wrong, and why the
  change prevents it. For other changes, say what prompted the change, what
  it makes possible or simpler, and any constraint that shaped the approach.
- Explain behaviour, not edits. Do not walk through the diff.
- Describe the code without this change in the present tense: "Atlas Queue
  reassigns the job", not "Atlas Queue reassigned the job". The reader
  reads the message together with its diff. Describe the change in the
  imperative mood. Past tense fits only after an explicit "Before,".
- Wrap lines at 72 characters.
- Write prose by default. Use a numbered list for separate steps or separate
  effects. Use "before/after" only when the earlier state tells the reader
  something the subject does not already imply.

## Words and names

- Name a component only if the reader would recognize it: a subsystem, a
  service, a public API, a configuration key, or another public contract.
  Such a name may appear in the subject.
- Refer to internal functions, variables, types, and errors by the role
  they play: "the retry worker", not `retryLoop`.
- Describe concrete actors and events. Write "a background worker can
  process a service offer before the test clock is set", not
  "nondeterministic TTL bookkeeping".
- Name who acts, in the active voice: "a worker can publish the result",
  not "the result can be published".
- Describe what the actor does, not the code construct it uses: "callers set
  the clock afterward", not "chained setters changed the clock".
- Keep an established technical term, such as lease, race condition, or
  rolling restart, when it is the clearest way to say something. Do not
  choose a term only because it sounds more precise, and do not stack
  nouns into dense phrases.

## Trailers

- If the user states a Jira ticket ID, add it as the last line:
  `Jira: ABC-123`. Do not add a verb such as "Closes" or "Fixes". Do not
  take ticket IDs from branch names.
- Add no other trailers, such as `Co-authored-by`, unless the user asks.

## Improving an existing message

An existing subject often names the functions and variables its author
edited, such as `Check generation in publishResult`. Once you have read
those names, they look like the normal words for the change, and they end
up in the rewrite. Its framing has the same effect: a subject that
describes the mechanism leads you to describe the mechanism too. That is
why step 2 has you write your own message first.

When you compare the two, keep a name from the existing message only if
it passes "Words and names", and follow "Subject" even when the existing
subject leads with the mechanism.

## Examples

All scenarios and names below are fictional. Assume that readers of each
project know Atlas Queue and Horizon API as components of that project.

Good fix (cause, effect, and change; a known component in the body):

```
Prevent stale workers from publishing results

A lease can expire while a worker is still processing a job.
Atlas Queue then reassigns the job, and both workers can publish a
result for the same execution.

Require the current lease generation when a worker publishes a result.
A worker may finish after Atlas Queue reassigns the job, but only the
current lease holder can commit the result.
```

Bad version of the same fix (internal names and a walk through the diff):

```
Check generation in publishResult

Compare leaseGeneration with currentGeneration and return ErrStaleLease.
```

Bad fix (abstract wording hides the failure):

```
Prevent nondeterministic TTL bookkeeping

Use immutable startup configuration to prevent clock mutation after
worker initialization.
```

Good version of the same fix (concrete actors and events):

```
Set service discovery options before startup

The service discovery constructor starts background workers before it
returns. A worker can process a service offer before the test clock is
set, giving the service an expiration time based on the real clock.

Pass these settings to the constructor and apply them before starting
the workers. Existing callers continue to use the same defaults.
```

Good feature (a public API in the subject):

```
Expose retry timing through Horizon API

Clients can see that an export is pending but not whether another
attempt is scheduled. They either poll aggressively or treat recoverable
delays as final failures.

Report the attempt count and next retry time through Horizon API.
Retry policy remains owned by the worker; the API exposes status
without letting clients alter scheduling.
```

Good refactoring (the subject describes structure; behaviour is
unchanged):

```
Separate retry policy from transports

HTTP and message-queue clients mix connection handling with backoff
decisions. Policy changes require parallel edits, and timing cannot be
tested without transport setup.

Move retry scheduling into shared policy code while preserving existing
schedules. Each client continues to decide which errors can be retried.
```

Good documentation change (an exact name that is a public contract):

```
Document cache setup for read-only homes

Offline startup writes downloaded indexes to the default home directory.
On read-only hosts, startup fails before the local index is available.

Document CACHE_DIR as the supported writable location and show how
containers should provision it.
```

Good before/after (the earlier state adds information):

```
Preserve filters when switching list views

Before, grid and table views kept separate query state. Switching views
therefore restored stale defaults. After, both views retain the same
filtered results until the user clears them.
```

Bad before/after (each half restates the subject):

```
Make anonymous usage data opt-in by default

Before, new installations sent anonymous usage data until an
administrator turned it off. After, new installations withhold it until
an administrator turns it on.
```

The subject already says the default changed, so both halves repeat it at
greater length. Keep only what the subject does not say, such as the fact
that existing installations keep their current setting, or omit the body.

Good numbered list (two separate effects):

```
Expire account-recovery links consistently

Account-recovery links must not remain valid after credentials change.
They now expire in two cases:

1. After the first successful password change.
2. When the account receives a newer recovery link.

This prevents an older link from restoring access after the owner has
completed or restarted recovery.
```

Good message for a change that needs no body, with a ticket the user
stated:

```
Sort country names alphabetically

Jira: APP-321
```
