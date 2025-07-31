"use client"

import { useAppStore } from "@/lib/store"

interface AdminVisibilityProps {
  children: React.ReactNode
  showWhenLoggedIn?: boolean
  showWhenLoggedOut?: boolean
}

export function AdminVisibility({ 
  children, 
  showWhenLoggedIn = false, 
  showWhenLoggedOut = false 
}: AdminVisibilityProps) {
  const { isAdminLoggedIn } = useAppStore()

  // Show when logged in and showWhenLoggedIn is true
  // OR show when logged out and showWhenLoggedOut is true
  const shouldShow = (isAdminLoggedIn && showWhenLoggedIn) || (!isAdminLoggedIn && showWhenLoggedOut)

  if (!shouldShow) {
    return null
  }

  return <>{children}</>
}