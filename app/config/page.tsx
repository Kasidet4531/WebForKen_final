"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useAppStore, ConfigData } from "@/lib/store"
import { toast } from "sonner"
import { Settings, Send, Lock } from "lucide-react"
import { motion } from "framer-motion"
import { AdminRouteGuard } from "@/components/admin-route-guard"

export default function ConfigPage() {
  const router = useRouter()
  const { config, websocket, isConnected, currentConfig, setCurrentConfig, isAdminLoggedIn } = useAppStore()
  const [localConfig, setLocalConfig] = useState(config)
  
  console.log('ConfigPage render - currentConfig:', currentConfig)


  useEffect(() => {
    setLocalConfig(config)
  }, [config])

  useEffect(() => {
    if (websocket && isConnected) {
      try {
        websocket.send(JSON.stringify({ mode: "config" }))
      } catch (error) {
        console.error("Failed to send mode data:", error)
      }
    }
  }, [websocket, isConnected])

  // WebSocket message listener for receiving config from ESP32
  useEffect(() => {
    if (websocket) {
      const handleMessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data)
          console.log('Received WebSocket data:', data)
          // Check if received data has config structure (from ESP32)
          if (data && typeof data === 'object' && 
              ('sensor' in data || 'stop' in data || 'turn' in data || 'referent_line_width' in data)) {
            console.log('Setting currentConfig with:', {
              sensor: data.sensor ?? 0,
              stop: data.stop ?? 0,
              turn: data.turn ?? 0,
              referent_line_width: data.referent_line_width ?? 0
            })
            setCurrentConfig({
              sensor: data.sensor ?? 0,
              stop: data.stop ?? 0,
              turn: data.turn ?? 0,
              referent_line_width: data.referent_line_width ?? 0
            })
          } else {
            console.log('Data does not match config structure')
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      websocket.addEventListener('message', handleMessage)
      return () => {
        websocket.removeEventListener('message', handleMessage)
      }
    }
  }, [websocket, setCurrentConfig])


  const handleSendConfig = () => {
    console.log('handleSendConfig called')
    if (!websocket || !isConnected) {
      console.log('WebSocket not connected')
      toast.error("WebSocket not connected! Cannot send data.")
      return
    }

    const isEmpty = (val: number) => val === null || val === undefined || val === 0
    
    const dataToSend = {
      sensor: isEmpty(localConfig.sensor) ? -1 : localConfig.sensor,
      stop: isEmpty(localConfig.stop) ? -1 : localConfig.stop,
      turn: isEmpty(localConfig.turn) ? -1 : localConfig.turn,
      referent_line_width: isEmpty(localConfig.referent_line_width) ? -1 : localConfig.referent_line_width
    }

    console.log('Config JSON to send:', JSON.stringify(dataToSend, null, 2))

    try {
      websocket.send(JSON.stringify(dataToSend))
      toast.success("Configuration sent successfully!")
      // Clear input fields after successful send
      setLocalConfig({ sensor: 0, stop: 0, turn: 0, referent_line_width: 0 })
    } catch (error) {
      toast.error("Failed to send configuration")
    }
  }

  const handleFieldChange = (field: keyof ConfigData, value: string) => {
    // Allow only digits and negative sign at the beginning
    const cleanValue = value.replace(/[^-0-9]/g, '').replace(/(?!^)-/g, '')
    const numValue = cleanValue === "" || cleanValue === "-" ? 0 : Number.parseInt(cleanValue) || 0
    setLocalConfig(prev => ({
      ...prev,
      [field]: numValue
    }))
  }

  return (
    <AdminRouteGuard requireAdmin={true}>
      <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        >
          <Card className="glass-card rounded-3xl border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <Settings className="h-6 w-6 text-white" />
                  </motion.div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                  Configuration
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">

              <div className="space-y-6">
                {[
                  { key: 'sensor' as keyof ConfigData, label: 'Distance Ultra Sonic Sensor' },
                  { key: 'stop' as keyof ConfigData, label: 'Distance to Stop' },
                  { key: 'turn' as keyof ConfigData, label: 'Delay before Turn' },
                  { key: 'referent_line_width' as keyof ConfigData, label: 'Referent Line width' }
                ].map((field, index) => (
                  <motion.div
                    key={field.key}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.4 }}
                    className="space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <Label htmlFor={field.key} className="text-sm font-bold text-gray-700 dark:text-gray-200">
                        {field.label}
                      </Label>
                      <div className="text-xs px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full font-medium">
                        Current: {currentConfig && currentConfig[field.key] !== undefined 
                          ? currentConfig[field.key] 
                          : '--'}
                      </div>
                    </div>
                    <Input
                      id={field.key}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={localConfig[field.key] === 0 ? "" : (localConfig[field.key] || "").toString()}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      className="text-center h-14 rounded-2xl border-2 border-white/30 dark:border-gray-600/30 glass focus:border-orange-500 focus:ring-orange-500/20 focus:ring-4 text-lg font-semibold"
                      placeholder="Enter integer value"
                    />
                  </motion.div>
                ))}
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <Button
                  onClick={handleSendConfig}
                  disabled={!websocket || !isConnected}
                  className="w-full touch-button h-16 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white border-0 ripple text-lg font-bold"
                  size="lg"
                >
                  <Send className="mr-3 h-6 w-6" />
                  Send via WebSocket
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center p-6 glass rounded-2xl"
              >
                <p className="text-sm font-semibold">
                  {isConnected ? (
                    <span className="text-green-600 dark:text-green-400">✓ WebSocket Connected - Ready to Send</span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400">✗ WebSocket Disconnected - Send Blocked</span>
                  )}
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
    </AdminRouteGuard>
  )
}
