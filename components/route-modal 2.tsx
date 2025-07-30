"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useAppStore } from "@/lib/store"
import { ArrowLeft, ArrowRight, ArrowUp, RotateCcw, Package, PackageOpen, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

const stepIcons = {
  left: ArrowLeft,
  right: ArrowRight,
  straight: ArrowUp,
  "u-turn": RotateCcw,
  pick: Package,
  drop: PackageOpen,
}

const stepLabels = {
  left: "Turn Left",
  right: "Turn Right",
  straight: "Go Straight",
  "u-turn": "U-Turn",
  pick: "Pick Up",
  drop: "Drop Off",
}

export function RouteModal() {
  const { routeSteps, isRouteExpanded, setIsRouteExpanded, removeStepById } = useAppStore()
  const [stepToDelete, setStepToDelete] = useState<string | null>(null)

  const handleStepClick = (stepId: string) => {
    setStepToDelete(stepId)
  }

  const confirmDeleteStep = () => {
    if (stepToDelete) {
      removeStepById(stepToDelete)
      setStepToDelete(null)
      toast.success("Step removed from route")
    }
  }

  return (
    <Dialog open={isRouteExpanded} onOpenChange={setIsRouteExpanded}>
      <DialogContent className="glass-card border-0 max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
            Route Steps ({routeSteps.length})
          </DialogTitle>
          
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-4">
          <AnimatePresence>
            {routeSteps.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400"
              >
                No steps added yet
              </motion.div>
            ) : (
              routeSteps.map((step, index) => {
                const Icon = stepIcons[step.type]
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass rounded-2xl p-4 flex flex-col items-center gap-3 cursor-pointer hover:bg-red-500/10 hover:border-red-500/30 transition-colors relative group"
                    onClick={() => handleStepClick(step.id)}
                  >
                    <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{index + 1}</span>
                    <Icon className="h-8 w-8 text-orange-500" />
                    <span className="text-sm font-medium text-center">{stepLabels[step.type]}</span>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-4 w-4 text-red-500" />
                    </div>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={stepToDelete !== null} onOpenChange={() => setStepToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ลบขั้นตอนนี้?</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบขั้นตอนนี้ออกจากเส้นทางหรือไม่? การกระทำนี้ไม่สามารถยกเลิกได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteStep} className="bg-red-500 hover:bg-red-600">
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
