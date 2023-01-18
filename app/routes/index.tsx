import { useCreateThing } from "~/routes/api/create"

export default function Index() {
  const {
    mutate: create_thing,
    zod_error,
    is_mutating,
    is_error,
    is_success,
  } = useCreateThing()

  return (
    <>
      <button
        onClick={() => {
          create_thing({
            id: "123",
            name: "John",
            age: 30,
          })
        }}
      >
        {is_mutating ? "Loading..." : "Create Thing"}
      </button>

      {!is_mutating && (
        <>
          {is_error && <p className="big">KABOOM! 💣</p>}
          {is_success && <p className="big">SUCCESS! 🥳</p>}
        </>
      )}

      {zod_error && <pre>{JSON.stringify(zod_error, null, 2)}</pre>}
    </>
  )
}
