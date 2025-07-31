"use client"

import { usePathname, useRouter } from "next/navigation"
import { Route, Settings, Gamepad2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/lib/store"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect } from "react" 

const baseNavItems = [
  { href: "/route", label: "Auto", icon: Route },
  { href: "/manual", label: "Manual", icon: Gamepad2 },
]

export function BottomNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { isUIHidden, isAdminLoggedIn } = useAppStore()

  // Always show base nav items
  // Only show Config when admin is logged in (no admin login button in nav)
  const navItems = [
    ...baseNavItems,
    // Show Config only when admin is logged in
    ...(isAdminLoggedIn ? [{ href: "/config", label: "Config", icon: Settings }] : [])
  ]
  // useEffect(() => {
  //   const ws = useAppStore.getState().websocket
  //   if (ws && ws.readyState === WebSocket.OPEN) {
  //     ws.send(JSON.stringify({ mode: pathname }))
  //   }
  // }, [pathname])

  if (pathname === "/" || (pathname === "/manual" && isUIHidden)) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/20 dark:border-gray-700/20"
      >
        <div className="flex items-center justify-around py-3 px-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <motion.button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 min-w-16 relative",
                  isActive
                    ? "text-orange-500"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
                )}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-orange-500/10 rounded-2xl border border-orange-500/20"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ duration: 0.2 }}
                  className="relative z-10"
                >
                  <Icon className="h-5 w-5 mb-1" />
                </motion.div>
                <span className="text-xs font-semibold relative z-10">{item.label}</span>
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
