"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { toast } from "sonner"

interface AdminRouteGuardProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function AdminRouteGuard({ children, requireAdmin = true }: AdminRouteGuardProps) {
  const router = useRouter()
  const { isAdminLoggedIn } = useAppStore()

  useEffect(() => {
    if (requireAdmin && !isAdminLoggedIn) {
      toast.error("Access denied. Please login as admin first.")
      router.push("/")
      return
    }
  }, [isAdminLoggedIn, requireAdmin, router])

  // Don't render anything if admin access is required but user is not logged in
  if (requireAdmin && !isAdminLoggedIn) {
    return null
  }

  return <>{children}</>
}