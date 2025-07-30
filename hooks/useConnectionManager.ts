"use client"

import { useEffect, useRef, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { toast } from "sonner"

export function useConnectionManager() {
  const router = useRouter()
  const pathname = usePathname()
  const { 
    wsIp, 
    setWsIp, 
    websocket, 
    setWebsocket, 
    isConnected, 
    setIsConnected,
    isAdminLoggedIn 
  } = useAppStore()

  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const shouldAutoReconnectRef = useRef(true)
  const maxReconnectAttempts = 10
  const reconnectDelay = 3000

  const connectWebSocket = useCallback((ip: string) => {
    if (!ip.trim()) return

    try {
      const ws = new WebSocket(`ws://${ip}:81`)
      
      ws.onopen = () => {
        setWebsocket(ws)
        setIsConnected(true)
        reconnectAttemptsRef.current = 0
        shouldAutoReconnectRef.current = true
        toast.success("Connected successfully!")
      }

      ws.onerror = () => {
        setIsConnected(false)
        setWebsocket(null)
        if (reconnectAttemptsRef.current === 0) {
          toast.error("Failed to connect to WebSocket")
        }
      }

      ws.onclose = () => {
        setIsConnected(false)
        setWebsocket(null)
        
        // Auto-reconnect if we should and haven't exceeded attempts
        if (shouldAutoReconnectRef.current && 
            reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket(ip)
          }, reconnectDelay)
        }
      }
    } catch (error) {
      setIsConnected(false)
      setWebsocket(null)
      toast.error("Invalid WebSocket URL")
    }
  }, [setWebsocket, setIsConnected])

  const stopAutoReconnect = useCallback(() => {
    shouldAutoReconnectRef.current = false
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    reconnectAttemptsRef.current = 0
  }, [])

  // Handle redirect logic
  useEffect(() => {
    // Don't redirect on connect page or admin page
    if (pathname === "/" || pathname === "/admin" || isAdminLoggedIn) {
      return
    }

    // If no IP is set, redirect to connect page
    if (!wsIp) {
      router.push("/")
      return
    }

    // If IP exists but not connected, try to auto-reconnect
    if (wsIp && !isConnected && shouldAutoReconnectRef.current) {
      connectWebSocket(wsIp)
    }
  }, [pathname, wsIp, isConnected, isAdminLoggedIn, router, connectWebSocket])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  return {
    connectWebSocket,
    stopAutoReconnect,
    isAutoReconnecting: shouldAutoReconnectRef.current && reconnectAttemptsRef.current > 0
  }
}