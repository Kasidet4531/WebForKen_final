"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface JoystickProps {
  onMove: (x: number, y: number) => void
  className?: string
  size?: number
  label?: string
}

export function Joystick({ onMove, className, size = 140, label }: JoystickProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const activeTouchId = useRef<number | null>(null)

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const deltaX = clientX - centerX
      const deltaY = clientY - centerY

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const maxDistance = size / 2 - 25

      let x = deltaX
      let y = deltaY

      if (distance > maxDistance) {
        x = (deltaX / distance) * maxDistance
        y = (deltaY / distance) * maxDistance
      }

      setPosition({ x, y })

      const normalizedX = x / maxDistance
      const normalizedY = -y / maxDistance

      onMove(normalizedX, normalizedY)
    },
    [onMove, size],
  )

  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      setIsDragging(true)
      handleMove(clientX, clientY)
    },
    [handleMove],
  )

  const handleEnd = useCallback(() => {
    setIsDragging(false)
    setPosition({ x: 0, y: 0 })
    activeTouchId.current = null
    onMove(0, 0)
  }, [onMove])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      handleStart(e.clientX, e.clientY)
    },
    [handleStart],
  )

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      if (activeTouchId.current !== null) return // Already tracking a touch
      const touch = e.changedTouches[0]
      activeTouchId.current = touch.identifier
      handleStart(touch.clientX, touch.clientY)
    },
    [handleStart],
  )

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX, e.clientY)
      }
    }

    const handleMouseUp = () => {
      if (isDragging) {
        handleEnd()
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && activeTouchId.current !== null) {
        // Find the specific touch that belongs to this joystick from changedTouches
        let foundTouch = null
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === activeTouchId.current) {
            foundTouch = e.changedTouches[i]
            break
          }
        }
        
        if (foundTouch) {
          e.preventDefault()
          handleMove(foundTouch.clientX, foundTouch.clientY)
        }
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (isDragging && activeTouchId.current !== null) {
        // Check if our specific touch has ended in changedTouches
        const touchEnded = Array.from(e.changedTouches).some(touch => touch.identifier === activeTouchId.current)
        if (touchEnded) {
          e.preventDefault()
          activeTouchId.current = null
          handleEnd()
        }
      }
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.addEventListener("touchmove", handleTouchMove, { passive: false })
      document.addEventListener("touchend", handleTouchEnd, { passive: false })
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isDragging, handleMove, handleEnd])

  return (
    <div className="flex flex-col items-center space-y-4">
      {label && (
        <motion.span
          className="text-sm font-semibold text-gray-600 dark:text-gray-300 px-4 py-2 glass rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {label}
        </motion.span>
      )}
      <motion.div
        ref={containerRef}
        className={cn("relative rounded-full glass select-none touch-none shadow-2xl", className)}
        style={{ width: size, height: size }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        whileTap={{ scale: 0.98 }}
        animate={{
          boxShadow: isDragging ? "0 25px 50px -12px rgba(251, 146, 60, 0.4)" : "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        }}
      >
        <motion.div
          className="absolute w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full shadow-xl"
          style={{
            left: `calc(50% + ${position.x}px - 20px)`,
            top: `calc(50% + ${position.y}px - 20px)`,
          }}
          animate={{
            scale: isDragging ? 1.3 : 1,
            boxShadow: isDragging ? "0 0 20px rgba(251, 146, 60, 0.8)" : "0 10px 15px -3px rgba(251, 146, 60, 0.2)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
        <div className="absolute inset-3 rounded-full border border-white/30 dark:border-gray-600/30" />
        <div className="absolute inset-6 rounded-full border border-white/20 dark:border-gray-600/20" />
        <div className="absolute inset-9 rounded-full border border-white/10 dark:border-gray-600/10" />
      </motion.div>
    </div>
  )
}
