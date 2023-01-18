import type { DataFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import type { FetcherWithComponents } from "@remix-run/react"
import superjson from "superjson"
import type { ApiRes } from "~/boilerplate/utils.server"

export const obj_to_fd = (obj: Record<string, any>): FormData => {
  const formData = new FormData()
  for (const key of Object.keys(obj)) {
    formData.append(key, superjson.stringify(obj[key]))
  }
  return formData
}

export const obj_from_ctx = async (ctx: DataFunctionArgs) => {
  const arr = Array.from(await ctx.request.formData())
  const obj: Record<string, any> = {}
  for (const [key, value] of arr) {
    obj[key] = superjson.parse(value as string)
  }
  return obj
}

export const handle_api_error = (e: unknown) => {
  if (e instanceof Error) {
    return json(
      {
        success: false,
        error: e.message,
        at: Date.now(),
      },
      { status: 400 }
    )
  }
  throw new Error("Unknown error")
}

export const handle_api_success = (res: any) => {
  return json(
    {
      success: true,
      data: res,
      at: Date.now(),
    },
    { status: 200 }
  )
}

export const mutation_state = (fetcher: FetcherWithComponents<ApiRes>) => {
  return {
    is_mutating: fetcher.state !== "idle",
    is_success: Boolean(fetcher.data?.success),
    is_error: Boolean(fetcher.data && !fetcher.data?.success),
  }
}
