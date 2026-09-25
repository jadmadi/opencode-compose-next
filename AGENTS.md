# AGENTS.md

Guidance for agents working in this repository.

## What this is

An OpenCode V2 port of MiMoCode's compose-next workflow. One plugin
(`compose-next.ts`), one skill (`skills/compose-next/SKILL.md`), and one
reviewer subagent (`agents/reviewer.md`). No build step, no dependencies, AGPL-3.0-only
licensed.

## Local development

```sh
bun test                                                        # unit tests
cp compose-next.ts ~/.config/opencode/plugins/compose-next.ts
cp skills/compose-next/SKILL.md ~/.config/opencode/skills/compose-next/SKILL.md
cp agents/reviewer.md ~/.config/opencode/agents/reviewer.md
touch ~/.config/opencode/plugins/compose-next.ts                # reload
```

Verify registration:

```sh
opencode2 api get /api/command | grep compose-next
opencode2 api get /api/skill   | grep compose-next
opencode2 debug agents         | grep reviewer
```

## Tests

`bun test` runs `compose-next.test.ts`. Bun is a deliberate exception to the
global no-bun rule here: the plugin runs inside OpenCode, which embeds Bun, so
the tests share the runtime and globals. Keep the pure helper exported so it
stays testable.

## Hard constraints

- Do not import `@opencode/plugin`. The runtime does not resolve it. Export a
  plain `{ id, setup }` object; the loader only needs a default export with an
  `id` and a `setup` or `effect` function.
- Keep the plugin dependency-free. Use Bun globals for file or process access.
- The skill must keep `metadata.opencode/autoinvoke: false` so the model cannot
  start the workflow on its own. The command is the entry point.
- Plugin `console` output does not reach `~/.local/share/opencode/log/opencode.log`
  (the service sends stdout to /dev/null and stderr to a socket). Do not rely
  on it for user feedback. Throwing from `execute` surfaces as
  `CommandExecutionError` with the message.

## Skill frontmatter gotcha

An unquoted YAML `description` that contains a colon breaks the parse and
OpenCode silently drops the skill. Quote the whole description. This already
happened once.

## API notes

- `ctx.skill.list()` returns `{ location, data: [...] }`; entries have `id`,
  `name`, `description`.
- `ctx.session.prompt({ sessionID, text, files, skills, delivery })` attaches a
  skill with `skills: [{ id: "compose-next" }]`. The runtime injects the skill
  body as a `<skill_content name="compose-next">` part on the user message.
- `ctx.command.transform` registers the command; `ctx.session.prompt` submits
  the attached skill.
- Plugins can register tools, skills, and commands. They cannot create new
  agents. The reviewer is a markdown agent under `~/.config/opencode/agents/`.

## Layout

- `compose-next.ts` - plugin; `promptFor` builds the prompt, `setup` registers
  the command and warns when the skill is missing.
- `skills/compose-next/SKILL.md` - the workflow contract, adapted from MiMoCode.
- `agents/reviewer.md` - the read-only reviewer subagent.
- `NOTICE` - attribution for the adapted skill.

## Releasing

- Use semantic commit messages.
- Changes go through a feature branch and a PR; do not push to `main`.
- Keep `NOTICE` in sync if the adapted skill text changes.
- When the workflow changes, update this file, the README, and the tests
  together.
