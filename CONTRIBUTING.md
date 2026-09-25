# Contributing

Thanks for helping improve opencode-compose-next. This guide covers how to set
up, test, and send a change.

## What we welcome

- Bug reports and fixes.
- Clearer skill wording that keeps the contract executable.
- New tests.
- Portability fixes for OpenCode releases.

For a big change, open an issue first so we can agree on the shape.

## Before you start

You need:

- OpenCode V2, tested on `0.0.0-beta-19425`.
- Bun, which OpenCode embeds. The tests run under Bun on purpose.

## Set up

```sh
git clone https://github.com/jadmadi/opencode-compose-next
cd opencode-compose-next
bun test
```

To run your copy inside OpenCode:

```sh
cp compose-next.ts ~/.config/opencode/plugins/compose-next.ts
cp skills/compose-next/SKILL.md ~/.config/opencode/skills/compose-next/SKILL.md
cp agents/reviewer.md ~/.config/opencode/agents/reviewer.md
touch ~/.config/opencode/plugins/compose-next.ts
```

Check the command and skill are registered:

```sh
opencode2 api get /api/command | grep compose-next
opencode2 api get /api/skill   | grep compose-next
```

## Tests

```sh
bun test
```

Add a test for any behavior you change.

## The rules for this project

These are not style preferences. The port stops working if you break them.

- No imports in the plugin. The runtime does not resolve `@opencode/plugin`.
  Export a plain `{ id, setup }` object.
- Keep the skill hidden from model auto-invocation
  (`metadata.opencode/autoinvoke: false`). The user starts it.
- Quote any frontmatter `description` that contains a colon. An unquoted colon
  makes OpenCode drop the skill without an error.
- Keep `NOTICE` accurate. The skill text is adapted from MiMoCode, which is MIT.

## Reporting a bug

Open a GitHub issue and include:

- Your OpenCode version from `opencode2 --version`.
- The command you ran and the request text.
- The relevant skill or agent file, if you changed it.
- The error message, or the log line from
  `~/.local/share/opencode/log/opencode.log`.

## Sending a change

1. Create a branch: `git checkout -b fix/short-description`.
2. Make the change and add tests.
3. Run `bun test`.
4. Write a semantic commit message, for example
   `fix: quote the skill description`.
5. Open a pull request against `main`.

Keep one pull request to one idea.

## License

By contributing, you agree that your work is released under the AGPL-3.0-only License.
