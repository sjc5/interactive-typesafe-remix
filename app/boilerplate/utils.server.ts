import type { DataFunctionArgs, SerializeFrom } from "@remix-run/node"
import type { ZodSchema } from "zod"
import {
  handle_api_error,
  handle_api_success,
  obj_from_ctx,
} from "~/boilerplate/utils"

const setup_action = async <T>({
  ctx,
  required_role,
  input_schema,
}: SetupActionArgs<T>) => {
  const fd = await obj_from_ctx(ctx)

  const user = { name: "Bill" } // in reality, `await get_user(ctx)`
  if (required_role === "user" && !user) throw new Error("Unauthorized")
  // extend this however you like

  return { ctx, user, input: input_schema.parse(fd) }
}

export const mutation_action = async <T>({
  ctx,
  input_schema,
  required_role,
  mutation_function,
}: MutationActionArgs<T>) => {
  try {
    return handle_api_success(
      await mutation_function(
        await setup_action({ ctx, input_schema, required_role })
      )
    )
  } catch (e) {
    return handle_api_error(e)
  }
}

export type ApiRes = SerializeFrom<
  typeof handle_api_success | typeof mutation_action
>

type RequiredRole = "any" | "anon" | "user" | "admin"
type User = { name: string }

type MutationFunctionArgs<T> = {
  ctx: DataFunctionArgs
  user: User
  input: T
}

type MutationFunction<T> = (props: MutationFunctionArgs<T>) => Promise<any>

type MutationActionArgs<T> = {
  ctx: DataFunctionArgs
  required_role: RequiredRole
  input_schema: ZodSchema<T>
  mutation_function: MutationFunction<T>
}

type SetupActionArgs<T> = Omit<MutationActionArgs<T>, "mutation_function">
