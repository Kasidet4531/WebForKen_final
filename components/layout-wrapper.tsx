"use client"

import { memo } from "react"
import { useUserTracking } from "@/hooks/useUserTracking"
import { useConnectionManager } from "@/hooks/useConnectionManager"

function LayoutWrapperComponent({ children }: { children: React.ReactNode }) {
  useUserTracking()
  useConnectionManager()
  return <>{children}</>
}

export const LayoutWrapper = memo(LayoutWrapperComponent)