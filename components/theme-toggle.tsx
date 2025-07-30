"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { motion } from "framer-motion"

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center space-x-2 opacity-50">
        <Sun className="h-4 w-4" />
        <div className="w-11 h-6 bg-gray-200 rounded-full" />
        <Moon className="h-4 w-4" />
      </div>
    )
  }

  const currentTheme = theme === "system" ? systemTheme : theme
  const isDark = currentTheme === "dark"

  return (
    <div className="flex items-center space-x-2">
      <motion.div
        animate={{
          scale: isDark ? 0.8 : 1,
          opacity: isDark ? 0.5 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <Sun className="h-4 w-4 text-orange-500" />
      </motion.div>
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        className="data-[state=checked]:bg-orange-500"
      />
      <motion.div
        animate={{
          scale: isDark ? 1 : 0.8,
          opacity: isDark ? 1 : 0.5,
        }}
        transition={{ duration: 0.2 }}
      >
        <Moon className="h-4 w-4 text-blue-400" />
      </motion.div>
    </div>
  )
}
