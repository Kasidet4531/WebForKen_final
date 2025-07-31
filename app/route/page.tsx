"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { toast } from "sonner"
import { RouteModal } from "@/components/route-modal"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  RotateCcw,
  Package,
  PackageOpen,
  Undo2,
  Send,
  Play,
  RotateCcw as Reset,
  Wifi,
  WifiOff,
  Expand,
  Square,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const stepIcons = {
  left: ArrowLeft,
  right: ArrowRight,
  straight: ArrowUp,
  "u-turn": RotateCcw,
  pick: Package,
  drop: PackageOpen,
  stop: Square,
}

const stepLabels = {
  left: "Turn Left",
  right: "Turn Right",
  straight: "Go Straight",
  "u-turn": "U-Turn",
  pick: "Pick Up",
  drop: "Drop Off",
  stop: "Stop",
  start: "Start",
  reset: "reset",
}

const stepLetters = {
  left: "L",
  right: "R",
  straight: "S",
  "u-turn": "U",
  pick: "P",
  drop: "D",
  stop: "S",
}

export default function RoutePage() {
  const { routeSteps, addRouteStep, removeLastStep, removeStepById, clearRoute, websocket, isConnected, wsIp, setIsRouteExpanded } =
    useAppStore()
  const [stepToDelete, setStepToDelete] = useState<string | null>(null)

  useEffect(() => {
    if (websocket && isConnected) {
      try {
        websocket.send(JSON.stringify({ mode: "route" }))
      } catch (error) {
        console.error("Failed to send mode data:", error)
      }
    }
  }, [websocket, isConnected])

  const handleAddStep = (type: keyof typeof stepIcons) => {
    addRouteStep({ type })
  }

  const handleSendRoute = () => {
    if (!websocket || !isConnected) {
      toast.error("Not connected to WebSocket")
      return
    }

    if (routeSteps.length === 0) {
      toast.error("No route steps to send")
      return
    }

    try {
      const routeString = routeSteps.map(step => stepLetters[step.type]).join("")
      websocket.send(JSON.stringify({ route: routeString }))
      toast.success(`Route sent: ${routeString}`)
    } catch (error) {
      toast.error("Failed to send route")
    }
  }

  const handleStartCommand = () => {
    if (!websocket || !isConnected) {
      toast.error("Not connected to WebSocket")
      return
    }

    try {
      websocket.send(JSON.stringify({ route: "Start" }))
      toast.success("Start command sent")
    } catch (error) {
      toast.error("Failed to send Start command")
    }
  }

  const handleResetCommand = () => {
    if (!websocket || !isConnected) {
      toast.error("Not connected to WebSocket")
      return
    }

    try {
      websocket.send(JSON.stringify({ route: "reset" }))
      toast.success("Reset command sent")
    } catch (error) {
      toast.error("Failed to send reset command")
    }
  }

  const handleStepClick = (stepId: string) => {
    setStepToDelete(stepId)
  }

  const confirmDeleteStep = () => {
    if (stepToDelete) {
      removeStepById(stepToDelete)
      setStepToDelete(null)
      toast.success("Step removed from route")
    }
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Sticky Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-16 z-40 glass border-b border-white/20 dark:border-gray-600/20 p-4 mx-4 rounded-2xl mt-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {isConnected ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-red-500" />}
            <span className="text-sm font-semibold">{isConnected ? "Connected" : "Disconnected"}</span>
          </div>
          {wsIp && (
            <span className="text-xs font-mono glass px-3 py-1 rounded-xl text-gray-600 dark:text-gray-300">
              {wsIp}
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Current Auto Route</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">{routeSteps.length} steps</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsRouteExpanded(true)}
                className="h-8 w-8 p-0 rounded-full"
              >
                <Expand className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="h-16 overflow-x-auto overflow-y-hidden">
            <div className="flex gap-2 h-full" style={{scrollBehavior: 'smooth'}}>
              <AnimatePresence>
                {routeSteps.length === 0 ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-gray-500 dark:text-gray-400 text-center py-4 text-sm flex-1"
                  >
                    No steps added yet
                  </motion.p>
                ) : (
                  routeSteps.map((step, index) => {
                    const Icon = stepIcons[step.type]
                    return (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-2 p-2 glass rounded-xl min-w-fit cursor-pointer hover:bg-red-500/10 hover:border-red-500/30 transition-colors"
                        onClick={() => handleStepClick(step.id)}
                        ref={index === routeSteps.length - 1 ? (el) => {
                          if (el) {
                            setTimeout(() => {
                              el.scrollIntoView({ behavior: 'smooth', inline: 'end', block: 'nearest' })
                            }, 100)
                          }
                        } : undefined}
                      >
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{index + 1}.</span>
                        <Icon className="h-4 w-4 text-orange-500" />
                        <span className="text-xs font-medium whitespace-nowrap">{stepLabels[step.type]}</span>
                      </motion.div>
                    )
                  })
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Movement Controls */}
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="glass-card rounded-3xl border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                  Auto Movement Steps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  {/* Row 1: Left, Straight, Right */}
                  {([
                    ['left', ArrowLeft],
                    ['straight', ArrowUp],
                    ['right', ArrowRight]
                  ] as const).map(([type, Icon], index) => (
                    <motion.div
                      key={type}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <Button
                        onClick={() => handleAddStep(type as keyof typeof stepIcons)}
                        variant="outline"
                        className="touch-button w-full flex flex-col items-center gap-3 h-20 glass border-orange-500/30 hover:bg-orange-500/10 hover:border-orange-500 ripple"
                      >
                        <Icon className="h-6 w-6 text-orange-500" />
                        <span className="text-xs font-bold">{stepLabels[type as keyof typeof stepLabels]}</span>
                      </Button>
                    </motion.div>
                  ))}
                  
                  {/* Row 2: Pick, Stop, Drop */}
                  {([
                    ['pick', Package],
                    ['stop', Square],
                    ['drop', PackageOpen]
                  ] as const).map(([type, Icon], index) => (
                    <motion.div
                      key={type}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <Button
                        onClick={() => handleAddStep(type as keyof typeof stepIcons)}
                        variant="outline"
                        className="touch-button w-full flex flex-col items-center gap-3 h-20 glass border-orange-500/30 hover:bg-orange-500/10 hover:border-orange-500 ripple"
                      >
                        <Icon className="h-6 w-6 text-orange-500" />
                        <span className="text-xs font-bold">{stepLabels[type as keyof typeof stepLabels]}</span>
                      </Button>
                    </motion.div>
                  ))}
                  
                  {/* Row 3: Empty, U-Turn, Empty */}
                  <div></div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    <Button
                      onClick={() => handleAddStep('u-turn')}
                      variant="outline"
                      className="touch-button w-full flex flex-col items-center gap-3 h-20 glass border-orange-500/30 hover:bg-orange-500/10 hover:border-orange-500 ripple"
                    >
                      <RotateCcw className="h-6 w-6 text-orange-500" />
                      <span className="text-xs font-bold">{stepLabels['u-turn']}</span>
                    </Button>
                  </motion.div>
                  <div></div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleSendRoute}
                    className="flex-1 touch-button bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 ripple"
                    disabled={routeSteps.length === 0}
                  >
                    <Send className="mr-3 h-5 w-5" />
                    Send Route
                  </Button>
                  <Button
                    onClick={removeLastStep}
                    variant="outline"
                    className="touch-button glass border-gray-500/30 hover:bg-gray-500/10"
                    disabled={routeSteps.length === 0}
                  >
                    <Undo2 className="h-5 w-5" />
                  </Button>
                </div>

                {routeSteps.length > 0 && (
                  <Button
                    onClick={clearRoute}
                    variant="outline"
                    className="w-full touch-button glass border-red-500/30 text-red-600 hover:bg-red-500/10 hover:border-red-500"
                  >
                    Clear All Steps
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Robot Controls */}
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card className="glass-card rounded-3xl border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-red-600 bg-clip-text text-transparent">
                  Auto Robot Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={handleStartCommand}
                    className="touch-button bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 ripple h-16"
                  >
                    <Play className="mr-3 h-6 w-6" />
                    Start
                  </Button>
                  <Button
                    onClick={handleResetCommand}
                    className="touch-button bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 ripple h-16"
                  >
                    <Reset className="mr-3 h-6 w-6" />
                    Reset
                  </Button>
                </div>

                <div className="text-center p-6 glass rounded-2xl">
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                    Use Start/Reset to control robot execution
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <RouteModal />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={stepToDelete !== null} onOpenChange={() => setStepToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this step?</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to remove this step from the route? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteStep} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
