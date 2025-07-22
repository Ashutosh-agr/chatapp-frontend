"use client"

import type React from "react"

import { useState, useEffect, useCallback, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ResizablePanelProps {
  children: ReactNode
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
  className?: string
  onWidthChange?: (width: number) => void
  disabled?: boolean
}

export function ResizablePanel({
  children,
  defaultWidth = 320,
  minWidth = 280,
  maxWidth = 600,
  className = "",
  onWidthChange,
  disabled = false,
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth)
  const [isResizing, setIsResizing] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)
  const [showLimitWarning, setShowLimitWarning] = useState(false)

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return

      e.preventDefault()
      setIsResizing(true)
      setStartX(e.clientX)
      setStartWidth(width)
      document.body.classList.add("resizing-cursor")
    },
    [disabled, width],
  )

  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return

      const deltaX = e.clientX - startX
      const newWidth = startWidth + deltaX

      // Check if we're hitting limits
      const isAtMinLimit = newWidth <= minWidth
      const isAtMaxLimit = newWidth >= maxWidth

      if (isAtMinLimit || isAtMaxLimit) {
        setShowLimitWarning(true)
        setTimeout(() => setShowLimitWarning(false), 1000)
      }

      // Apply limitations with smooth clamping
      const clampedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth)
      setWidth(clampedWidth)
      onWidthChange?.(clampedWidth)
    },
    [isResizing, startX, startWidth, minWidth, maxWidth, onWidthChange],
  )

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false)
    document.body.classList.remove("resizing-cursor")
    setShowLimitWarning(false)
  }, [])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleResizeMove)
      document.addEventListener("mouseup", handleResizeEnd)

      return () => {
        document.removeEventListener("mousemove", handleResizeMove)
        document.removeEventListener("mouseup", handleResizeEnd)
      }
    }
  }, [isResizing, handleResizeMove, handleResizeEnd])

  // Reset width on mobile
  useEffect(() => {
    const handleWindowResize = () => {
      if (window.innerWidth < 768) {
        setWidth(defaultWidth)
      }
    }

    window.addEventListener("resize", handleWindowResize)
    return () => window.removeEventListener("resize", handleWindowResize)
  }, [defaultWidth])

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768

  return (
    <div
      className={`relative ${className}`}
      style={{
        width: isMobile ? `${defaultWidth}px` : `${width}px`,
        minWidth: `${minWidth}px`,
        maxWidth: `${maxWidth}px`,
      }}
    >
      {children}

      {/* Resize Handle */}
      {!isMobile && !disabled && (
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-blue-500/30 transition-all duration-200 z-10 ${
            isResizing ? "bg-blue-500/50" : ""
          }`}
          onMouseDown={handleResizeStart}
          role="separator"
          aria-label="Resize sidebar"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") {
              const newWidth = Math.max(width - 10, minWidth)
              setWidth(newWidth)
              onWidthChange?.(newWidth)
            } else if (e.key === "ArrowRight") {
              const newWidth = Math.min(width + 10, maxWidth)
              setWidth(newWidth)
              onWidthChange?.(newWidth)
            }
          }}
        >
          {/* Resize Handle Visual Indicator */}
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2 w-3 h-8 bg-white/10 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
            <div className="w-0.5 h-4 bg-white/30 rounded-full mr-0.5"></div>
            <div className="w-0.5 h-4 bg-white/30 rounded-full"></div>
          </div>

          {/* Limit Warning Indicator */}
          <div className={`resize-limit-indicator ${showLimitWarning ? "show" : ""}`} />
        </div>
      )}

      {/* Width Indicator Tooltip */}
      <AnimatePresence>
        {isResizing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 glass-dark px-4 py-2 rounded-lg text-white text-sm font-medium shadow-2xl"
          >
            <div className="flex items-center space-x-2">
              <span>Width: {width}px</span>
              <div className="w-1 h-4 bg-blue-400 rounded-full"></div>
            </div>
            <div className="text-xs text-white/60 mt-1 text-center">
              Min: {minWidth}px • Max: {maxWidth}px
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                style={{
                  width: `${((width - minWidth) / (maxWidth - minWidth)) * 100}%`,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
