"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { useConnectionManager } from "@/hooks/useConnectionManager"
import { toast } from "sonner"
import { Wifi, WifiOff } from "lucide-react"
import { motion } from "framer-motion"

export default function ConnectPage() {
  const router = useRouter()
  const { wsIp, setWsIp, websocket, isConnected } = useAppStore()
  const { connectWebSocket, stopAutoReconnect } = useConnectionManager()
  const [inputIp, setInputIp] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    setInputIp(wsIp)
  }, [wsIp])

  useEffect(() => {
    if (websocket && isConnected) {
      try {
        websocket.send(JSON.stringify({ mode: "connect" }))
      } catch (error) {
        console.error("Failed to send mode data:", error)
      }
    }
  }, [websocket, isConnected])

  const handleConnect = async () => {
    if (!inputIp.trim()) {
      toast.error("Please enter a WebSocket IP address")
      return
    }

    setIsConnecting(true)
    setWsIp(inputIp)
    
    // Create a temporary WebSocket to test connection
    try {
      const ws = new WebSocket(`ws://${inputIp}:81`)
      
      ws.onopen = () => {
        setIsConnecting(false)
        ws.close()
        connectWebSocket(inputIp)
        router.push("/route")
      }

      ws.onerror = () => {
        setIsConnecting(false)
        toast.error("Failed to connect to WebSocket")
      }
    } catch (error) {
      setIsConnecting(false)
      toast.error("Invalid WebSocket URL")
    }
  }

  const handleChangeIp = () => {
    stopAutoReconnect()
    setInputIp(wsIp)
  }

  return (
    <div className="h-screen overflow-hidden flex items-center justify-center p-4 ">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card rounded-3xl border-0 shadow-2xl ">
          <CardHeader className="text-center pb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl overflow-hidden"
            >
              <img src="kenlogo.png" alt="WSController Logo" className="w-16 h-16 object-cover rounded-2xl" />
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
            
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <Input
                placeholder="ws://192.168.x.x:port"
                value={inputIp}
                onChange={(e) => setInputIp(e.target.value)}
                className="text-center text-lg h-16 rounded-2xl border-2 border-white/30 dark:border-gray-600/30 glass focus:border-orange-500 focus:ring-orange-500/20 focus:ring-4"
                onKeyDown={(e) => e.key === "Enter" && handleConnect()}
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full touch-button h-16 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 ripple text-lg font-bold"
                size="lg"
              >
                {isConnecting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="mr-3"
                  >
                    <WifiOff className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <Wifi className="mr-3 h-6 w-6" />
                )}
                {isConnecting ? "Connecting..." : "Connect"}
              </Button>
            </motion.div>

            {wsIp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ delay: 0.6 }}
                className="text-center space-y-4 pt-6 border-t border-white/20 dark:border-gray-600/20"
              >
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Last used connection:</p>
                <div className="glass rounded-2xl p-4">
                  <p className="text-sm font-mono text-gray-700 dark:text-gray-200">{wsIp}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleChangeIp}
                  className="touch-button glass border-orange-500/30 text-orange-600 hover:bg-orange-500/10"
                >
                  Change IP
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
