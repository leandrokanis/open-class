---
name: "speckit-ship"
description: "Execute the full speckit pipeline end-to-end — specify, plan, tasks, implement, and publish a PR — in a single uninterrupted run. Use this skill whenever the user wants to go from a feature description to a merged-ready PR without stopping, or says things like 'ship this feature', 'do the full speckit flow', 'spec to PR', 'build and ship', or 'run everything end to end'."
argument-hint: "Describe the feature you want to ship"
user-invocable: true
disable-model-invocation: false
---

## User Input

```text
$ARGUMENTS
```

The text after `/speckit-ship` is the feature description. Never ask the user to repeat it.

## Goal

Run the speckit pipeline from start to finish with zero interruptions:

1. **specify** — write the spec
2. **plan** — design the implementation
3. **tasks** — generate the task list
4. **implement** — execute all tasks
5. **PR** — create and publish the pull request

Do not pause between stages to ask for approval. If something is ambiguous, make a reasonable decision and document the assumption in the spec. The only valid reason to stop is an unrecoverable error (missing required file, test suite failure with no clear fix).

---

## Stage 1 — Specify

Invoke `/speckit-specify` with the feature description from `$ARGUMENTS`.

Wait for it to complete fully (spec.md written to disk) before proceeding.

---

## Stage 2 — Plan

Invoke `/speckit-plan`.

Wait for plan.md to be written before proceeding.

---

## Stage 3 — Tasks

Invoke `/speckit-tasks`.

Wait for tasks.md to be written before proceeding.

---

## Stage 4 — Implement

Invoke `/speckit-implement`.

Execute every task. Do not stop at TODO stubs or checkpoint markers — implement them fully.

If tests are present and fail after implementation, fix the failures before proceeding. If after two fix attempts the tests still fail, stop and report the error with the exact failure output.

---

## Stage 5 — Publish PR

After implementation is complete:

1. Run `git status` to confirm there are changes to commit.
2. Stage all relevant files (`git add` specific paths — never `git add -A` blindly).
3. Commit with a message that follows the repository's conventional-commits style (read recent `git log` to match the style).
4. Push the branch.
5. Create the PR via `gh pr create` using the template below.

### PR format

```
gh pr create --title "<conventional title under 70 chars>" --body "$(cat <<'EOF'
## Summary
- <bullet 1>
- <bullet 2>
- <bullet 3 if needed>

## Changes
<list the main files/modules changed and why>

## Test plan
- [ ] <key thing to verify>
- [ ] <edge case>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Return the PR URL to the user as the final output.

---

## Progress reporting

After each stage completes, output a one-line status update:

```
✓ Stage N/5 — <stage name> done
```

This lets the user see progress without interrupting the flow.

---

## Error handling

- **Missing prerequisite** (e.g. no `.specify/` directory): stop immediately, report the missing piece, suggest running `/speckit-constitution` first.
- **Test failure after two fix attempts**: stop, print exact test output, ask the user how to proceed.
- **gh CLI not authenticated**: stop, tell the user to run `gh auth login` and re-invoke the skill.
- **Any other error**: stop, report the stage that failed and the exact error message.
