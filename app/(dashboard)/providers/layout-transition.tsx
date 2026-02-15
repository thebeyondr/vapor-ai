"use client"

import { useContext, useEffect, useRef } from "react"
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { useSelectedLayoutSegment } from "next/navigation"
import { AnimatePresence, motion, MotionConfig } from "motion/react"

/**
 * FrozenRouter prevents Next.js App Router from unmounting content during exit animations.
 * Captures the layout context when segment changes and provides previous context to children
 * during the exit animation, then provides current context once segment is stable.
 */
function FrozenRouter({ children }: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext)
  const segment = useSelectedLayoutSegment()

  const prevContext = useRef(context)
  const prevSegment = useRef(segment)

  useEffect(() => {
    if (segment !== prevSegment.current) {
      prevContext.current = context
      prevSegment.current = segment
    }
  }, [context, segment])

  // During segment change, provide previous context to prevent unmount
  const frozenContext = segment !== prevSegment.current ? prevContext.current : context

  return (
    <LayoutRouterContext.Provider value={frozenContext}>
      {children}
    </LayoutRouterContext.Provider>
  )
}

/**
 * LayoutTransition provides smooth page transitions using Motion.
 * Respects prefers-reduced-motion for accessibility.
 * Subtle fade + slide animation (150ms, 8px vertical movement).
 */
export function LayoutTransition({ children }: { children: React.ReactNode }) {
  const segment = useSelectedLayoutSegment()

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={segment}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15, ease: "easeInOut" }}
        >
          <FrozenRouter>{children}</FrozenRouter>
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  )
}
