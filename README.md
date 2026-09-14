# opencode-compose-next

An OpenCode V2 port of MiMoCode's compose-next workflow, packaged as a plugin,
a skill, and a reviewer subagent.

The workflow is a compact contract for grill, spec, workspace, implement,
verify, review, finalize, and finish. One durable feature document at
`docs/compose/spec/<feature>.md` carries the design, tasks, and delivery
evidence. A fresh reviewer checks the change before you merge.

## What is included

| File                          | Role                                                    |
| ----------------------------- | ------------------------------------------------------- |
| `compose-next.ts`             | Plugin that registers the `/compose-next` command       |
| `skills/compose-next/SKILL.md`| The workflow contract                                   |
| `agents/reviewer.md`          | Read-only reviewer subagent used in the Review phase    |

## OpenCode

This plugin runs on OpenCode. New accounts through my referral link get $5 in
usage credits, and I get $5 too:

https://opencode.ai/go?ref=N9H3ZEP22A

## Install

```sh
mkdir -p ~/.config/opencode/plugins ~/.config/opencode/skills/compose-next ~/.config/opencode/agents
base=https://raw.githubusercontent.com/jadmadi/opencode-compose-next/main
curl -fsSL "$base/compose-next.ts" -o ~/.config/opencode/plugins/compose-next.ts
curl -fsSL "$base/skills/compose-next/SKILL.md" -o ~/.config/opencode/skills/compose-next/SKILL.md
curl -fsSL "$base/agents/reviewer.md" -o ~/.config/opencode/agents/reviewer.md
touch ~/.config/opencode/plugins/compose-next.ts
```

Then check the command is registered:

```sh
opencode2 api get /api/command | grep compose-next
```

For one project, install the skill under `.opencode/skills/` and the agent under
`.opencode/agents/` instead, and put the plugin under `.opencode/plugins/`.
Tested against OpenCode v2.0.3.

To pin a release, replace `main` in the URL with a tag such as `v0.1.0`.

## Use

```text
/compose-next add a settings page with local persistence
```

A bare `/compose-next` starts the workflow and lets it orient first. The
command attaches the skill and forwards your text.

## Behavior notes

- The skill is user-invoked only. It sets `metadata.opencode/autoinvoke: false`,
  so the model cannot start the workflow on its own.
- Workspace uses the worktree directory from your config (`worktree.directory`),
  otherwise `.worktrees/<slug>`.
- The Review phase uses the `reviewer` subagent when it is installed, otherwise
  `general`.
- The spec path is `docs/compose/spec/<feature>.md`. A user-specified path
  overrides it.

## Differences from MiMoCode

- MiMoCode's `change_directory` tool is replaced by OpenCode's session move tool.
- MiMoCode's `task` tool is gone. The feature document's task list is the
  tracker.
- The skill is hidden from model auto-invocation, which matches the original
  explicit-only intent.

## Tests

```sh
bun test
```

## Attribution

The workflow contract in `skills/compose-next/SKILL.md` is adapted from
MiMoCode's compose-next skill, MIT licensed, Copyright (c) 2026 MiMo Code,
Xiaomi Corporation. See `NOTICE`.

## License

MIT
