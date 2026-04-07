import { useState } from "react"
import { toast } from "sonner"

type AsyncFunction<T, A extends any[]> = (...args: A) => Promise<T>

function useFetch<T, A extends any[] = any[]>(cb: AsyncFunction<T, A>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fn = async (...args: A): Promise<T | null> => {
    setLoading(true)
    setError(null)

    try {
      const result = await cb(...args)
      setData(result)
      return result
    } catch (err) {
      const e = err as Error
      setError(e)
      toast.error(e.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    data,
    loading,
    error,
    fn,
    setData,
  }
}

export default useFetch