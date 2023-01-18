import type { ActionFunction } from "@remix-run/node"
import type { FetcherWithComponents } from "@remix-run/react"
import { useFetcher } from "@remix-run/react"
import { useEffect, useState } from "react"
import type { z, ZodError, ZodSchema } from "zod"
import { mutation_state, obj_to_fd } from "~/boilerplate/utils"
import type { ApiRes } from "~/boilerplate/utils.server"

export function useMutate<T>({
  action,
  action_path,
  input_schema,
  on_success,
  on_error,
  on_settled,
}: {
  action: ActionFunction
  action_path: string
  input_schema: ZodSchema<T & Record<string, any>>
  on_success?: () => void
  on_error?: () => void
  on_settled?: () => void
}) {
  const fetcher = useFetcher<typeof action>()
  const { is_error, is_mutating, is_success } = mutation_state(fetcher)
  const [is_validation_error, set_is_validation_error] = useState(false)
  useOnResolve({
    fetcher,
    on_success,
    on_error,
    on_settled,
    is_validation_error,
  })

  const [zod_error, set_zod_error] = useState<ZodError<
    z.infer<typeof input_schema>
  > | null>(null)

  return {
    mutate: async (props: T) => {
      set_is_validation_error(false)
      const parsed_input = input_schema.safeParse(props)
      if (!parsed_input.success) {
        set_is_validation_error(true)
        return set_zod_error(parsed_input.error)
      } else set_zod_error(null)
      fetcher.submit(obj_to_fd(parsed_input.data), {
        method: "post",
        action: action_path,
      })
    },
    is_mutating,
    is_error: is_error || is_validation_error,
    is_success,
    zod_error,
  }
}

export const useOnResolve = ({
  fetcher,
  on_success,
  on_error,
  on_settled,
  is_validation_error,
}: {
  fetcher: FetcherWithComponents<ApiRes>
  on_success?: () => void
  on_error?: () => void
  on_settled?: () => void
  is_validation_error: boolean
}) => {
  const { is_error, is_success } = mutation_state(fetcher)
  const is_settled = is_error || is_success

  useEffect(() => {
    if (is_success && on_success) on_success()
    if ((is_error || is_validation_error) && on_error) on_error()
    if (is_settled && on_settled) on_settled()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.data?.at, is_validation_error])
}
