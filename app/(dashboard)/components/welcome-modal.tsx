'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HelpCircle, Rocket, Sparkles } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useLocalStorage } from '@/hooks/use-local-storage'

export function WelcomeModal() {
  const router = useRouter()
  const [hasSeenWelcome, setHasSeenWelcome] = useLocalStorage('vapor-welcome-seen', false)
  const [isOpen, setIsOpen] = useState(!hasSeenWelcome)

  const handleDismiss = () => {
    setHasSeenWelcome(true)
    setIsOpen(false)
  }

  const handleStartTraining = () => {
    setHasSeenWelcome(true)
    setIsOpen(false)
    router.push('/training')
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="h-6 w-6 text-primary" />
              Welcome to Vapor
            </DialogTitle>
            <DialogDescription className="pt-2 text-base">
              A portfolio demonstration of Liquid AI's LFM platform capabilities
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              This application showcases the Liquid Foundation Models platform through an interactive
              training dashboard:
            </p>

            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="text-primary mt-0.5">•</span>
                <span>Explore Liquid Foundation Models across text, vision, audio, and nano variants</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary mt-0.5">•</span>
                <span>Configure and launch simulated training runs with real-time progress</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary mt-0.5">•</span>
                <span>Monitor training metrics with realistic loss curves and status tracking</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary mt-0.5">•</span>
                <span>View deployed model performance and inference statistics</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={handleDismiss} className="flex-1">
              Got it
            </Button>
            <Button onClick={handleStartTraining} className="flex-1 gap-2">
              <Rocket className="h-4 w-4" />
              Start Training
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {hasSeenWelcome && !isOpen && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="default"
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
                aria-label="Show welcome message"
              >
                <HelpCircle className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Show welcome message</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  )
}
