---
name: compose-next
description: "Use for multi-step feature work, bug fixes, or refactors where requirements need to settle, a feature document should carry design, tasks, and delivery evidence, and the change deserves independent review before merge. Start it only on an explicit user request, whether through the /compose-next command, the skill name, or a clear natural-language ask. Never infer it from task size alone. Not for one-shot edits or questions."
metadata:
  opencode/autoinvoke: false
---

# Compose Next

Compact end-to-end contract for grill → spec → workspace → implement → verify → review → finalize → finish.

When you write a checkpoint or compact context, preserve this recovery instruction in the checkpoint or summary: on resumption, if the compose-next instructions are absent, load the `compose-next` skill before continuing.

Enter this workflow only on an explicit user request. Any clear natural-language request for the workflow counts, just like `/compose-next`. If the user has not clearly asked for it, do the work directly and run none of the phases below. Do not infer consent from task size.

## Step 0 - Orient

Inspect the repository, its instructions (`AGENTS.md`, `README`, existing spec files), and recent changes before asking anything. Do not ask the user for facts the environment already answers.

Decide the shape of the work:

- Fully constrained mechanical change with no durable design surface → skip Grill and Spec, go to Workspace then Implement.
- Requirements or design ambiguous → Grill first.
- Requirements clear and the feature deserves a durable document → Spec first.

User gates and project overrides:

- If the user says `without worktree`, or names a worktree or workspace path, use that and skip the default worktree gate. Do not ask for worktree consent again.
- If the user says `without spec`, "no spec needed", "this is a small fix", or similar, skip the durable feature document and its gate. Keep verification and review when the task still warrants them.
- Project instructions or `AGENTS.md` may define a worktree path, branch convention, spec path, or spec format. Use that instead of the defaults in this skill, and record the override in the feature document or final report when it changes the normal artifact location.

Every path passes through Workspace before Implement. No branch skips it.

## Grill - resolve decisions

Resolve one decision axis at a time. One decision may bundle dependent fields into a single structured question; unrelated decisions need separate turns.

Use the `question` tool for every user decision:

- Put known choices in `options`. Each option gets a concise `label` and a `description` explaining the consequence. List the recommendation first and mark its label `(Recommended)`.
- For consequential choices, include 2 or 3 viable alternatives.
- When choices cannot be enumerated, still call `question` with an empty option list for free text.
- Do not ask for permission to continue when no decision remains.

Split requests that span independent subsystems before refining each part. Do not begin implementation until requirements and scope are settled.

### Unavailable question tool

If the `question` tool is unavailable or returns nothing usable, resolve this one decision yourself and continue:

1. Choose the option marked `(Recommended)` when repository evidence still supports it and it can run unattended.
2. Otherwise choose the closest minimal-scope option supported by the evidence, and prefer text-only, non-interactive work.
3. If the decision includes destructive or irreversible work, choose a non-destructive path that preserves progress. Never auto-approve the destructive option.
4. State the option selected and the reason in the response.

This applies to the current decision only. At every later decision point, call the `question` tool again.

## Spec - one document per feature

Maintain one document per feature at `docs/compose/spec/<feature-name>.md` from the repository root. Do not add a date to the filename. A user-specified location overrides this path. Edit an existing document in place; never create a separate plan or report.

### Template

```markdown
---
feature: <feature-name>
status: designed | in-progress | delivered
updated: YYYY-MM-DD
branch: <branch-name>
commits: <base-sha>..<head-sha> # filled at delivery
---

# <Feature Name>

## Report

## [S1] Problem
Describe the user-visible problem.

## [S2] Design
Record the chosen behavior and the contracts needed to implement it.

## [S3] Out of Scope
State explicit boundaries.

## Tasks
- [ ] T1: <work item> - acceptance: <observable result> (covers: S2)
- [ ] T2: <work item> - acceptance: <observable result> (covers: S2; depends: T1)
```

### Design-time rules

- Leave `Report` empty and set `status: designed`.
- Keep `[Sn]` anchors stable when headings change; never renumber existing anchors.
- Record settled decisions and precise contracts, not exploration history or file-level code dumps. Include architecture, interfaces, data flow, error behavior, and testing boundaries when they affect the change.
- Make each task the smallest independently verifiable work item and give it an observable acceptance criterion. Add `depends:` only for real prerequisites, and keep dependencies acyclic.
- Add `covers:` for every task that implements a design section. Every design requirement must be covered by at least one task, and every reference must resolve.
- Remove placeholders such as `TBD`, "handle edge cases", and references to unspecified similar work.
- Scale detail to the change. Do not pad small designs.

Before implementation, fix ambiguous requirements, contradictions, unresolved references, and unverifiable acceptance criteria. If the user is available, ask for document approval with the `question` tool; otherwise continue.

### Amendments

Update only the affected sections, bump `updated:`, preserve anchors, and keep only the tasks the amendment needs and their dependents. Do not regenerate the document or create duplicate tasks.

## Workspace - worktree ownership

Never begin implementation on `main` or `master` without explicit user consent.

1. Compare `git rev-parse --git-dir` with `git rev-parse --git-common-dir`. If they differ, you are already in a linked worktree; do not nest another. A non-empty `git rev-parse --show-superproject-working-tree` means a submodule, not a linked worktree.
2. Create a linked worktree. Use the worktree directory configured for the project when one is set, otherwise `.worktrees/<slug>`. Run `git check-ignore -q "$path"`; if it is not ignored, write `*` to a `.gitignore` in the worktree's parent. Then run `git worktree add "$path" -b "$branch"`.
3. Move the session into the worktree with the session move tool, then continue the workflow there.
4. Install dependencies per the repository instructions. Prefer lockfile-frozen, hardlink-friendly modes over commands that mutate the lockfile. Confirm the toolchain works before continuing.

## Implement

Use the feature document as the source of requirements, or the conversation for an undocumented mechanical change. When a feature document exists, set its `status: in-progress` on the first implementation commit. Execute tasks in dependency order and track progress in the document's task list.

For behavior changes with a cheap reproduction, write a failing test, confirm it fails for the intended reason, implement the smallest fix, and confirm it passes. A bug fix needs a regression test when one can be written. Skip test-first for generated code, configuration-only changes, throwaway prototypes, or explicit user direction.

Test public behavior. Do not duplicate production logic in expected values, add test-only production APIs, or assert only that mocks were called. Prefer real implementations over mocks.

For failures, reproduce before editing and find the root cause from errors, diffs, recent commits, or boundary instrumentation. After two failed fixes, stop patching and re-derive the cause.

### Parallel work

Dispatch independent tasks in parallel only when isolation prevents collisions, and keep tightly coupled work together. Prefer giving parallel subagents disjoint file sets and keep commits with the orchestrator. Give each subagent the worktree path, the task, the acceptance criteria, the relevant spec sections, and the required verification. Do not pass session history. Treat its report as a claim and inspect the resulting diff.

Continue through tasks without routine approval pauses. Stop only for an unresolved product decision, a blocker you cannot work around, a destructive action that needs consent, or completion.

## Verify

Before any completion claim, run the repository's relevant tests, typecheck, build, or reproduction from the correct directory and read the output. Record each command and result. Mark known baseline failures as `PRE-EXISTING` with a short identifier. Do not substitute prior output or a subagent report for fresh evidence.

Verification and review are strictly sequential. Wait for all verification commands to exit before dispatching the reviewer. Never overlap review with a resource-heavy test or application process in the same environment.

## Review

After implementation is verified and before finalizing the feature document, dispatch one fresh subagent to review the complete change. Use the `reviewer` subagent when it is installed, otherwise `general`.

Provide the reviewer:

- the applicable spec sections and acceptance criteria;
- the worktree path, base branch, base SHA, head SHA, and the exact diff command or a precomputed diff;
- a compact verification summary: one line per command with `PASS`, `FAIL`, or `PRE-EXISTING`, plus test counts when available. Do not paste full command output unless a specific failure needs it.

Do not provide an implementer-authored narrative. The reviewer may inspect the diff and run additional commands to validate its conclusions. It must not repeat a command already reported as passing, especially a heavy end-to-end suite, unless the result is stale, the code changed afterward, or concrete evidence makes the result suspect. Before any justified rerun, confirm no equivalent command is still running. Missing evidence should be reported or gathered with the cheapest non-duplicative command.

Use a reviewer model at least as capable as the strongest implementer it reviews.

Require separate conclusions for:

1. Spec compliance - every acceptance criterion is met and points to evidence in the diff or in reviewer-observed command output.
2. Correctness - logic, boundaries, error handling, regressions, and tests are sound, including issues outside the written spec.
3. Codebase consistency - naming, structure, and local conventions match the surrounding code.

Classify unmet or unverifiable acceptance criteria and correctness bugs as critical. Fix critical findings, re-verify, and re-review the affected areas. Reject incorrect findings with technical evidence. If the fix-and-review loop stops converging, meaning repeated findings on the same area or fixes that introduce new criticals, stop looping and report the impasse with the remaining findings instead of forcing a pass.

For human review feedback, verify each item against the codebase, clarify ambiguous items before editing, and implement validated items one at a time with verification. Check actual usage before expanding an unused path, and surface conflicts with prior user decisions instead of silently complying.

For parallel task work, review integrated task diffs at useful boundaries only when delaying review would compound risk.

## Finalize - commit the feature document

After review passes, and before finishing the branch, finalize the feature document:

1. Set `status: delivered`, bump `updated:`, and record the reviewed range as `<base-sha>..<head-sha>`.
2. Check off completed tasks. Leave incomplete tasks unchecked and do not claim delivery if they block acceptance.
3. Replace `Report` with:

```markdown
## Report

**What was built** - 1 to 3 concise paragraphs describing the final behavior.

**Verification** - commands run and their observed results.

**Journey log** - at most 5 entries that help future work: dead ends, pivots, or transferable lessons. Preserve useful prior entries and append new ones.
```

4. If the repository is part of the `jadmadi/opencode-*` plugin ecosystem,
   update the program map at `jadmadi/opencode-plugins` per its `AGENTS.md`
   checklist: the section bullet, the commands and tools table, the limits and
   overrides, and the design spec. When the map is a separate repository, ship
   the map change on its own branch and pull request, and name that pull request
   in the report.

Update a design section only when it contradicts the delivered behavior. Commit the finalized document on the feature branch before finishing. This documentation-only commit sits outside the recorded reviewed range by construction. It does not restart verification or review, and CI re-running on it is expected.

## Finish

Do not auto-finish. After Finalize, report the branch, base, head SHA, worktree, feature-doc path, and suggest a closing action.

If the user asks to finish but the path is unclear, use the `question` tool to settle:

- closing action: local merge, open PR, push only, or keep the branch;
- which base branch to merge or target;
- keep or remove the worktree.

Worktree pitfalls:

- Local merge and `gh pr merge` run from the main repository checkout. The base branch cannot be checked out while another worktree holds it.
- Run `git worktree remove` only on a worktree under the configured worktree directory or the path scoped by the prompt or `AGENTS.md`.

---

Adapted from MiMoCode's compose-next skill (https://github.com/XiaomiMiMo/MiMo-Code), MIT, Copyright (c) 2026 MiMo Code, Xiaomi Corporation.
