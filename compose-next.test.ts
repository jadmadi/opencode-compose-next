import { describe, expect, test } from "bun:test"
import plugin, { promptFor } from "./compose-next.ts"

function invocation(overrides: Record<string, unknown> = {}) {
  return {
    sessionID: "ses_1",
    prompt: { text: "Add a login page" },
    delivery: "steer",
    ...overrides,
  } as any
}

function makeCtx(skills: string[] = ["compose-next"]) {
  const added: any[] = []
  const calls = { prompt: [] as any[] }
  const ctx: any = {
    skill: { list: async () => ({ location: {}, data: skills.map((id) => ({ id })) }) },
    command: { transform: (callback: any) => callback({ add: (definition: any) => added.push(definition) }) },
    session: { prompt: async (input: any) => void calls.prompt.push(input) },
  }
  return { ctx, added, calls }
}

describe("promptFor", () => {
  test("attaches the skill and forwards the request", () => {
    expect(promptFor("compose-next", invocation())).toEqual({
      sessionID: "ses_1",
      text: "Add a login page",
      files: [],
      skills: [{ id: "compose-next" }],
      delivery: "steer",
    })
  })

  test("uses a starter message when the user types nothing", () => {
    const built = promptFor("compose-next", invocation({ prompt: { text: "   " } }))
    expect(built.text).toBe("Begin the compose-next workflow.")
  })

  test("forwards attached files", () => {
    const files = [{ uri: "file:///a.md" }]
    const built = promptFor("compose-next", invocation({ prompt: { text: "hi", files } }))
    expect(built.files).toEqual(files)
  })

  test("survives a missing prompt", () => {
    const built = promptFor("compose-next", invocation({ prompt: undefined }))
    expect(built.text).toBe("Begin the compose-next workflow.")
    expect(built.files).toEqual([])
  })
})

describe("setup", () => {
  test("registers the compose-next command", async () => {
    const { ctx, added } = makeCtx()
    await (plugin as any).setup(ctx)
    expect(added.map((definition) => definition.name)).toEqual(["compose-next"])
  })

  test("still registers when the skill is missing", async () => {
    const { ctx, added } = makeCtx([])
    await (plugin as any).setup(ctx)
    expect(added.map((definition) => definition.name)).toEqual(["compose-next"])
  })
})

describe("execute", () => {
  test("starts the workflow with the skill attached", async () => {
    const { ctx, added, calls } = makeCtx()
    await (plugin as any).setup(ctx)
    await added[0].execute(invocation())
    expect(calls.prompt).toEqual([
      {
        sessionID: "ses_1",
        text: "Add a login page",
        files: [],
        skills: [{ id: "compose-next" }],
        delivery: "steer",
      },
    ])
  })

  test("starts the workflow on a bare command", async () => {
    const { ctx, added, calls } = makeCtx()
    await (plugin as any).setup(ctx)
    await added[0].execute(invocation({ prompt: { text: "" } }))
    expect(calls.prompt[0].text).toBe("Begin the compose-next workflow.")
  })
})
