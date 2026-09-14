// OpenCode V2 compose-next plugin.
//
// Registers the /compose-next command. The command attaches the compose-next
// skill (installed at ~/.config/opencode/skills/compose-next/SKILL.md) and
// forwards the user's request, so the workflow starts only when the user asks
// for it. The runtime does not resolve @opencode/plugin, so this file exports
// a plain { id, setup } object.

const VERSION = "0.1.2"

const SKILL_ID = "compose-next"
const START_TEXT = "Begin the compose-next workflow."

interface CommandInvocation {
  sessionID: string
  prompt: { text?: string; files?: unknown[] } & Record<string, unknown>
  delivery: unknown
}

interface CommandDefinition {
  name: string
  description: string
  execute: (invocation: CommandInvocation) => Promise<void>
}

interface CommandEditor {
  add(definition: CommandDefinition): void
}

function promptFor(skillID: string, invocation: CommandInvocation) {
  const text = typeof invocation.prompt?.text === "string" ? invocation.prompt.text.trim() : ""
  const files = Array.isArray(invocation.prompt?.files) ? invocation.prompt.files : []
  return {
    sessionID: invocation.sessionID,
    text: text || START_TEXT,
    files,
    skills: [{ id: skillID }],
    delivery: invocation.delivery,
  }
}

async function skillInstalled(ctx: any, id: string): Promise<boolean> {
  try {
    const list = await ctx.skill.list()
    const data: any[] = Array.isArray(list) ? list : (list?.data ?? [])
    return data.some((skill) => skill?.id === id)
  } catch (error) {
    console.error(`compose-next: could not read the skill list: ${error}`)
    return false
  }
}

const plugin = {
  id: "compose-next",
  async setup(ctx: any) {
    if (!(await skillInstalled(ctx, SKILL_ID))) {
      console.error(
        `compose-next: skill "${SKILL_ID}" is not installed; copy skills/compose-next/SKILL.md to ~/.config/opencode/skills/compose-next/SKILL.md`,
      )
    }

    await ctx.command.transform((editor: CommandEditor) => {
      editor.add({
        name: "compose-next",
        description:
          "Start the compose-next workflow: grill, spec, workspace, implement, verify, review, finalize, finish",
        execute: async (invocation: CommandInvocation) => {
          await ctx.session.prompt(promptFor(SKILL_ID, invocation))
        },
      })
    })
  },
}

export { promptFor, VERSION }
export default plugin
