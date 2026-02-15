'use client'

import { useState, useEffect } from 'react'

/**
 * SSR-safe localStorage hook with JSON serialization
 * Syncs state across tabs and components via storage events
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize state with lazy initializer to avoid SSR issues
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that persists to localStorage
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      // Allow value to be a function (like useState)
      const valueToStore = value instanceof Function ? value(storedValue) : value

      setStoredValue(valueToStore)

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))

        // Dispatch custom event for cross-component sync
        window.dispatchEvent(
          new CustomEvent('local-storage', {
            detail: { key, value: valueToStore }
          })
        )
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  // Listen for storage events (cross-tab sync) and custom events (cross-component sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if (e instanceof StorageEvent) {
        // Cross-tab sync
        if (e.key === key && e.newValue) {
          try {
            setStoredValue(JSON.parse(e.newValue))
          } catch (error) {
            console.warn(`Error parsing storage event for key "${key}":`, error)
          }
        }
      } else {
        // Cross-component sync
        const { key: changedKey, value } = e.detail
        if (changedKey === key) {
          setStoredValue(value)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange as EventListener)
    window.addEventListener('local-storage', handleStorageChange as EventListener)

    return () => {
      window.removeEventListener('storage', handleStorageChange as EventListener)
      window.removeEventListener('local-storage', handleStorageChange as EventListener)
    }
  }, [key])

  return [storedValue, setValue]
}
