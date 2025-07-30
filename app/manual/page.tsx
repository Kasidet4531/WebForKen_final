"use client"

import { useRef, useCallback, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Joystick } from "@/components/joystick"
import { useAppStore } from "@/lib/store"
import { Gamepad2, Wifi, WifiOff, Maximize2, Minimize2 } from "lucide-react"
import { motion } from "framer-motion"

export default function ManualPage() {
  const { websocket, isConnected, stickGap, isUIHidden, setIsUIHidden } = useAppStore()
  const joystick1Ref = useRef({ x: 0, y: 0 })
  const joystick2Ref = useRef({ x: 0, y: 0 })
  const [currentJoysticks, setCurrentJoysticks] = useState({ joy1: { x: 0, y: 0 }, joy2: { x: 0, y: 0 } })

  useEffect(() => {
    if (websocket && isConnected) {
      try {
        websocket.send(JSON.stringify({ mode: "joystick" }))
      } catch (error) {
        console.error("Failed to send mode data:", error)
      }
    }
  }, [websocket, isConnected])

  // Send joystick data every 50ms (like ExManual)
  useEffect(() => {
    if (!websocket || !isConnected) return

    const interval = setInterval(() => {
      if (websocket.readyState === WebSocket.OPEN) {
        const payload = {
          joy1: joystick1Ref.current,
          joy2: joystick2Ref.current
        }
        try {
          websocket.send(JSON.stringify(payload))
        } catch (error) {
          console.error("Failed to send joystick data:", error)
        }
      }
    }, 50) // 50ms = ~20 frames per second (matching ExManual)

    return () => clearInterval(interval)
  }, [websocket, isConnected])


  const updateJoysticks = useCallback(() => {
    setCurrentJoysticks({ 
      joy1: { ...joystick1Ref.current },
      joy2: { ...joystick2Ref.current }
    })
  }, [])

  const handleJoystick1 = useCallback(
    (x: number, y: number) => {
      joystick1Ref.current = { x: parseFloat(x.toFixed(4)), y: parseFloat((-y).toFixed(4)) }
      updateJoysticks()
    },
    [updateJoysticks],
  )

  const handleJoystick2 = useCallback(
    (x: number, y: number) => {
      joystick2Ref.current = { x: parseFloat(x.toFixed(4)), y: parseFloat(y.toFixed(4)) }
      updateJoysticks()
    },
    [updateJoysticks],
  )

  const toggleUIVisibility = () => {
    setIsUIHidden(!isUIHidden)
  }

  if (isUIHidden) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="flex flex-col md:flex-row items-center justify-center gap-16 md:gap-32 w-full h-full px-8 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          >
            <Joystick
              onMove={handleJoystick1}
              size={200}
              className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/50"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          >
            <Joystick
              onMove={handleJoystick2}
              size={200}
              className="bg-purple-50/50 dark:bg-purple-950/20 border-purple-200/50 dark:border-purple-800/50"
            />
          </motion.div>
        </div>

        {/* Show UI Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed top-4 right-4 z-50"
        >
          <Button variant="ghost" size="sm" onClick={toggleUIVisibility} className="h-12 w-12 p-0 rounded-full glass">
            <Minimize2 className="h-6 w-6" />
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Connection Status */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-3xl border-2 glass ${
            isConnected
              ? "border-green-500/30 bg-green-50/20 dark:bg-green-950/20"
              : "border-red-500/30 bg-red-50/20 dark:bg-red-950/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isConnected ? <Wifi className="h-6 w-6 text-green-500" /> : <WifiOff className="h-6 w-6 text-red-500" />}
              <span
                className={`font-bold text-lg ${
                  isConnected ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
                }`}
              >
                {isConnected ? "Connected - Ready for manual control" : "Not connected to WebSocket"}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={toggleUIVisibility} className="h-10 w-10 p-0 rounded-full glass">
              <Maximize2 className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card rounded-3xl border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-4">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                  className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <Gamepad2 className="h-6 w-6 text-white" />
                </motion.div>
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                  Manual Control
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-10">
              <div className={`flex items-center justify-center flex-col md:flex-row gap-${stickGap} md:gap-16`}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: -50 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                >
                  <Joystick
                    onMove={handleJoystick1}
                    label="Joystick 1"
                    size={180}
                    className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/50"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 50 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                >
                  <Joystick
                    onMove={handleJoystick2}
                    label="Joystick 2"
                    size={180}
                    className="bg-purple-50/50 dark:bg-purple-950/20 border-purple-200/50 dark:border-purple-800/50"
                  />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center space-y-4"
              >
                <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Current Joystick Values</p>
                <div className="glass rounded-2xl p-6">
                  <div className="grid grid-cols-2 gap-6 font-mono text-lg font-bold">
                    <div className="text-center">
                      <div className="text-blue-500 mb-2">Joystick 1</div>
                      <div className="text-sm space-y-1">
                        <div>X: {currentJoysticks.joy1.x.toFixed(3)}</div>
                        <div>Y: {currentJoysticks.joy1.y.toFixed(3)}</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-500 mb-2">Joystick 2</div>
                      <div className="text-sm space-y-1">
                        <div>X: {currentJoysticks.joy2.x.toFixed(3)}</div>
                        <div>Y: {currentJoysticks.joy2.y.toFixed(3)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
