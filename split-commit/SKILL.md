---
name: split-commit
description: 'Split one named commit into a series of smaller, standalone commits on a new branch. Use when the user asks to split or break up a specific commit (e.g. "split HEAD", "break abc123 into smaller commits").'
argument-hint: 'Commit to split (e.g. HEAD, abc123)'
---

# Split Commit

Split one named commit into a series of standalone commits on a new branch. The original branch stays as it is.

## Standalone commits

A commit is **standalone** when it meets all of these:

1. **Understandable alone**: a reviewer reading only this commit understands what it does and why, without knowing the commits after it. It covers one concern.
2. **Named for the present**: file names, doc comments, variable names, and comments describe their purpose at this commit, not what they become later. Rename in the commit that adds the new purpose.
3. **Only live code**: every line added is used and working. Remove code rather than commenting it out "for later".
4. **Files and imports earn their place**: each new file, import, and dependency is used by the commit that adds it. Use an existing file (e.g. an existing test helper file) as a temporary home, and extract code to its own file in the commit that gives it a second caller.
5. **Builds and tests pass.**

## Procedure

### 1. Check preconditions

Stop and report if a check fails, leaving the repository as it is:
- `git status --porcelain --untracked-files=no` is empty. Untracked files are allowed.
- The commit has exactly one parent.

Done when both checks pass.

### 2. Analyze the diff

Read the full diff of the commit. Sort the changes by concern, not by file; one file may hold changes for several commits:
- **Bugfixes**: corrections to existing behavior. Smallest, and they go first, including a bug that a refactoring in the same commit revealed.
- **Refactorings**: structural changes that keep behavior.
- **New features**: new capabilities, built on the refactorings.

Done when every hunk of the diff belongs to exactly one concern.

### 3. Plan the series

Order the commits so each depends only on commits before it. For each commit, write one sentence describing its observable effect; if the sentence needs a later commit to make sense, move the boundary. Check every new file against the standalone rules.

Done when every commit has its sentence and every hunk is assigned to exactly one commit.

### 4. Find build and test commands

Look in AGENTS.md, README, Makefile, or CI config; if nothing is found, ask the user once. If the test suite is slow, ask whether to build every commit and run the full tests only on the final commit.

Done when you know which commands to run on each commit.

### 5. Get the plan approved

Show the user:
- The one-sentence effect of each commit, in order
- Where each new file is created
- Any intended difference between the final tree and the original commit (normally none)

Wait for approval before changing anything.

### 6. Build the series

Create `<branch>-split` from the commit's parent, where `<branch>` is the current branch; if the name is taken, use `<branch>-split-2`, `-3`, and so on. Use another git method only if the user names one. The new branch ends with the last commit of the series; commits that came after the original commit stay only on the original branch.

For each commit in order:
1. Write each file to its intended state for this commit, then `git add <file>`. For a file whose changes all belong to this commit, use `git checkout <original> -- <file>`.
2. Check that the commit is standalone, running the build and test commands.
3. Write the message with the commit-message skill.
4. Commit as the current user with the current time.

If a commit fails to build or its tests fail, add temporary code to it that a later commit removes, keeping the final tree unchanged. Reordering or merging commits changes the plan: stop and get approval again.

Done when every planned commit is on the branch and has passed the commands chosen in step 4.

### 7. Final check

Read `git log --oneline <parent>..<branch>-split` and check that the series reads as a logical story from top to bottom.

Run `git diff <original-commit> <branch>-split`. Fix every difference not listed in the approved plan.

Done when the diff is empty, apart from the planned differences.

### 8. Report

Keep all work local and leave every existing branch where it is; never delete, rename over, or push a branch. Report exactly these items, with no suggested next steps:
- The new branch name and the original commit
- `git log --oneline <parent>..<branch>-split`
- The result of the final diff (empty, or the planned differences)
- Which commits were built and tested, and which were only built
