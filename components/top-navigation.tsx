"use client"

import { usePathname, useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAppStore } from "@/lib/store"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

const pageNames = {
  "/": "Connect",
  "/route": "Route Planner",
  "/config": "Configuration",
  "/manual": "Manual Control",
}

export function TopNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { isUIHidden, websocket, setWebsocket, setIsConnected, setWsIp } = useAppStore()
  const currentPageName = pageNames[pathname as keyof typeof pageNames] || "WebSocket Controller"

  const handleLogout = () => {
    // Don't do anything if already on the connect page
    if (pathname === "/") {
      return
    }
    
    if (websocket) {
      websocket.close()
    }
    setWebsocket(null)
    setIsConnected(false)
    setWsIp("")
    toast.success("Logged out successfully!")
    router.push("/")
  }

  if (pathname === "/manual" && isUIHidden) return null

  return (
    <AnimatePresence>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        exit={{ y: -100 }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20 dark:border-gray-700/20"
      >
        <div className="grid grid-cols-3 items-center h-16 px-4">
          <motion.button
            onClick={handleLogout}
            className={`flex items-center space-x-3 justify-self-start ${pathname === "/" ? "cursor-default" : "cursor-pointer"}`}
            whileHover={pathname === "/" ? {} : { scale: 1.05 }}
            whileTap={pathname === "/" ? {} : { scale: 0.95 }}
            type="button"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
              <img src="/autologo.png" alt="WSController Logo" className="w-8 h-8 object-cover rounded-xl" />
            </div>
            {/* <span className="font-bold text-sm text-gray-600 dark:text-gray-300 hidden sm:block whitespace-nowrap">
              Auto Workshop
            </span> */}
          </motion.button>

          <motion.h1
            key={currentPageName}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-bold text-center justify-self-center bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent"
          >
            {currentPageName}
          </motion.h1>

          <div className="justify-self-end">
            <ThemeToggle />
          </div>
        </div>
      </motion.header>
    </AnimatePresence>
  )
}
