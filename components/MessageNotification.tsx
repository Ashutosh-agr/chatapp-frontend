"use client"

import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MessageNotificationProps {
  isVisible: boolean
  contactName: string
  message: string
  onClose: () => void
  onClick: () => void
}

export function MessageNotification({ isVisible, contactName, message, onClose, onClick }: MessageNotificationProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, x: 50 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -100, x: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed top-4 right-4 z-50 max-w-sm cursor-pointer"
          onClick={onClick}
        >
          <div className="glass-dark border border-blue-500/30 rounded-lg p-4 shadow-2xl shadow-blue-500/20">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-500/20 p-2 rounded-full">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white">{contactName}</h4>
                  <p className="text-sm text-white/70 mt-1 line-clamp-2">{message}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white/50 hover:text-white hover:bg-white/10 h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
