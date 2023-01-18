import type { DataFunctionArgs } from "@remix-run/node"
import { z } from "zod"
import { useMutate } from "~/boilerplate/hooks"
import { mutation_action } from "~/boilerplate/utils.server"

const action_path = "/api/create"
const input_schema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number(),
})

export const action = async (ctx: DataFunctionArgs) => {
  return mutation_action({
    ctx,
    input_schema,
    required_role: "user",
    mutation_function: async ({ input, user }) => {
      console.log({ input, user })

      await new Promise((resolve) => setTimeout(resolve, 1000))
      const res = Math.random() > 0.3 ? "success" : "error"
      if (res === "error") throw new Error("error!")
      return res
    },
  })
}

export const useCreateThing = () => {
  return useMutate({
    action,
    action_path,
    input_schema,
    on_success: () => console.log("*** NICE! ***"),
    on_error: () => console.log("*** ERROR! ***"),
  })
}
