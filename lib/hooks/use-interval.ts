"use client"

import { useEffect, useRef } from "react"

/**
 * Declarative interval hook based on Dan Abramov's pattern
 * @see https://overreacted.io/making-setinterval-declarative-with-react-hooks/
 * @param callback Function to call on each interval tick
 * @param delay Delay in milliseconds (null to pause interval)
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback)

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval
  useEffect(() => {
    // Don't schedule if delay is null (paused state)
    if (delay === null) {
      return
    }

    const tick = () => {
      savedCallback.current?.()
    }

    const id = setInterval(tick, delay)

    // Cleanup on unmount or when delay changes
    return () => clearInterval(id)
  }, [delay])
}
