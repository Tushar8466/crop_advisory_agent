import { useEffect } from "react"
import { useEnvStore } from "@/store/envStore"

export function useHealth() {
  const checkHealth = useEnvStore((state) => state.checkHealth)

  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 30000)
    return () => clearInterval(interval)
  }, [checkHealth])
}
