"use client"

import { useEffect, useRef } from "react"
import { useAppStore } from "@/lib/store"

export function useUserTracking() {
  const { addConnectedUser, updateUserActivity } = useAppStore()
  const hasTracked = useRef(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (hasTracked.current) return

    const getUserIP = async () => {
      try {
        const existingIp = localStorage.getItem("userIp")
        if (existingIp) {
          updateUserActivity(existingIp)
          return
        }

        const response = await fetch("/api/user/track", {
          method: "POST",
        })
        const data = await response.json()
        
        if (data.ip) {
          localStorage.setItem("userIp", data.ip)
          const user = {
            ip: data.ip,
            userAgent: navigator.userAgent,
            connectedAt: new Date(),
            lastActivity: new Date(),
          }
          addConnectedUser(user)
        }
      } catch (error) {
        console.error("Failed to track user:", error)
      }
    }

    getUserIP()
    hasTracked.current = true

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      const userIp = localStorage.getItem("userIp")
      if (userIp) {
        updateUserActivity(userIp)
      }
    }, 30000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])
}