"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export function DynamicBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const [scrollY, setScrollY] = useState(0)
  const [timeOfDay, setTimeOfDay] = useState<"dawn" | "day" | "dusk" | "night">("night")
  const [time, setTime] = useState(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }

    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours()
      if (hour >= 5 && hour < 8) setTimeOfDay("dawn")
      else if (hour >= 8 && hour < 17) setTimeOfDay("day")
      else if (hour >= 17 && hour < 20) setTimeOfDay("dusk")
      else setTimeOfDay("night")
    }

    updateTimeOfDay()
    const interval = setInterval(updateTimeOfDay, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => prev + 0.005)
    }, 16)
    return () => clearInterval(timer)
  }, [])

  // Time-based color schemes
  const colorSchemes = {
    dawn: {
      base: "radial-gradient(ellipse at 30% 20%, #1a1625 0%, #2d1b3d 30%, #1f1a2e 60%, #0f0f1a 100%)",
      accent1: "rgba(255, 183, 77, 0.08)",
      accent2: "rgba(255, 107, 107, 0.06)",
      accent3: "rgba(138, 43, 226, 0.04)",
    },
    day: {
      base: "radial-gradient(ellipse at 50% 30%, #1e2a3a 0%, #2c3e50 30%, #1a252f 60%, #0f1419 100%)",
      accent1: "rgba(52, 152, 219, 0.08)",
      accent2: "rgba(46, 204, 113, 0.06)",
      accent3: "rgba(155, 89, 182, 0.04)",
    },
    dusk: {
      base: "radial-gradient(ellipse at 70% 20%, #2d1b3d 0%, #1a1625 30%, #2c1810 60%, #1a0f0f 100%)",
      accent1: "rgba(231, 76, 60, 0.08)",
      accent2: "rgba(230, 126, 34, 0.06)",
      accent3: "rgba(142, 68, 173, 0.04)",
    },
    night: {
      base: "radial-gradient(ellipse at 20% 50%, #0f0f23 0%, #1a1a2e 30%, #16213e 60%, #0a0a1a 100%)",
      accent1: "rgba(79, 70, 229, 0.08)",
      accent2: "rgba(139, 92, 246, 0.06)",
      accent3: "rgba(59, 130, 246, 0.04)",
    },
  }

  const currentScheme = colorSchemes[timeOfDay]

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Time-Aware Base Layer */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            currentScheme.base,
            currentScheme.base.replace("30%", "50%").replace("60%", "40%"),
            currentScheme.base,
          ],
        }}
        transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      {/* Aurora-Inspired Vertical Ribbons */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`ribbon-${i}`}
            className="absolute opacity-60"
            style={{
              left: `${15 + i * 20}%`,
              top: "-20%",
              width: "8px",
              height: "140%",
              background: `linear-gradient(180deg, 
                transparent 0%, 
                ${currentScheme.accent1} 20%, 
                ${currentScheme.accent2} 50%, 
                ${currentScheme.accent3} 80%, 
                transparent 100%)`,
              filter: "blur(12px)",
              transform: `rotate(${-5 + i * 2}deg)`,
            }}
            animate={{
              x: [0, Math.sin(time + i) * 30],
              opacity: [0.3, 0.7, 0.3],
              scaleY: [1, 1.2, 1],
              filter: [`blur(12px)`, `blur(8px)`, `blur(12px)`],
            }}
            transition={{
              duration: 15 + i * 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: i * 2,
            }}
          />
        ))}
      </div>

      {/* Animated Mesh Gradients */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, 
              ${currentScheme.accent1} 0%, 
              ${currentScheme.accent2} 30%, 
              transparent 60%),
            radial-gradient(400px circle at ${100 - mousePosition.x}% ${100 - mousePosition.y}%, 
              ${currentScheme.accent3} 0%, 
              transparent 50%)
          `,
        }}
        animate={{
          opacity: [0.4, 0.8, 0.6, 0.8],
        }}
        transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      {/* Animated Noise Texture */}
      <motion.div
        className="absolute inset-0 opacity-[0.015] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
        animate={{
          backgroundPosition: ["0px 0px", "200px 200px", "0px 0px"],
          opacity: [0.01, 0.02, 0.01],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      {/* Parallax Ambient Light Dots */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`dot-${i}`}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 6 + 2,
              height: Math.random() * 6 + 2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: [currentScheme.accent1, currentScheme.accent2, currentScheme.accent3][i % 3],
              boxShadow: `0 0 ${Math.random() * 20 + 10}px ${[currentScheme.accent1, currentScheme.accent2, currentScheme.accent3][i % 3]}`,
            }}
            animate={{
              x: [0, (mousePosition.x - 50) * 0.3 + Math.sin(time + i) * 20, (mousePosition.x - 50) * 0.3],
              y: [
                0,
                (mousePosition.y - 50) * 0.2 + Math.cos(time + i) * 15 - scrollY * 0.1,
                (mousePosition.y - 50) * 0.2 - scrollY * 0.1,
              ],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.8, 1.4, 0.8],
            }}
            transition={{
              duration: 8 + Math.random() * 6,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Floating Geometric Elements */}
      <div className="absolute inset-0">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`geo-${i}`}
            className="absolute opacity-[0.02]"
            style={{
              width: 200 + i * 100,
              height: 200 + i * 100,
              left: `${20 + i * 30}%`,
              top: `${25 + i * 20}%`,
              background: `conic-gradient(from ${time * 30 + i * 120}deg, 
                ${currentScheme.accent1}, 
                ${currentScheme.accent2}, 
                ${currentScheme.accent3}, 
                ${currentScheme.accent1})`,
              clipPath:
                i === 0
                  ? "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)"
                  : i === 1
                    ? "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)"
                    : "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
              filter: "blur(40px)",
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
              x: [(mousePosition.x - 50) * 0.1, (mousePosition.x - 50) * 0.2, (mousePosition.x - 50) * 0.1],
              y: [(mousePosition.y - 50) * 0.1, (mousePosition.y - 50) * 0.15, (mousePosition.y - 50) * 0.1],
            }}
            transition={{
              rotate: { duration: 40 + i * 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
              scale: { duration: 12 + i * 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
              x: { duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
              y: { duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
            }}
          />
        ))}
      </div>

      {/* Subtle Grid Pattern */}
      <motion.div
        className="absolute inset-0 opacity-[0.008]"
        style={{
          backgroundImage: `
            linear-gradient(${currentScheme.accent1} 1px, transparent 1px),
            linear-gradient(90deg, ${currentScheme.accent1} 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
        animate={{
          backgroundPosition: ["0 0", `${Math.sin(time) * 30}px ${Math.cos(time) * 30}px`, "0 0"],
        }}
        transition={{
          duration: 30,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Depth Gradient Overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 0%, transparent 0%, rgba(0, 0, 0, 0.1) 100%),
            radial-gradient(ellipse at 50% 100%, transparent 0%, rgba(0, 0, 0, 0.15) 100%)
          `,
        }}
        animate={{
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{
          duration: 15,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Ambient Corner Lighting */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 opacity-[0.03]"
          style={{
            background: `radial-gradient(circle, ${currentScheme.accent1} 0%, transparent 70%)`,
            filter: "blur(60px)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.02, 0.05, 0.02],
          }}
          transition={{
            duration: 18,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute bottom-0 right-0 w-80 h-80 opacity-[0.025]"
          style={{
            background: `radial-gradient(circle, ${currentScheme.accent2} 0%, transparent 70%)`,
            filter: "blur(50px)",
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.02, 0.04, 0.02],
          }}
          transition={{
            duration: 22,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 5,
          }}
        />
      </div>

      {/* Flowing Data Streams */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.015]" style={{ pointerEvents: "none" }}>
        <defs>
          <linearGradient id="stream1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="30%" stopColor={currentScheme.accent1.replace("0.08", "0.6")} />
            <stop offset="70%" stopColor={currentScheme.accent2.replace("0.06", "0.4")} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="stream2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor={currentScheme.accent3.replace("0.04", "0.5")} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        <motion.path
          d={`M0,${300 + Math.sin(time * 2) * 50} Q${600 + Math.cos(time) * 100},${200 + Math.sin(time * 1.5) * 80} ${1200 + Math.sin(time * 0.8) * 60},${300 + Math.cos(time * 1.2) * 70}`}
          stroke="url(#stream1)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{
            pathLength: [0, 1, 0],
            strokeWidth: [1, 3, 1],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        <motion.path
          d={`M0,${500 + Math.cos(time * 1.3) * 60} Q${800 + Math.sin(time * 0.9) * 120},${350 + Math.cos(time * 1.8) * 100} ${1600 + Math.cos(time * 0.7) * 80},${500 + Math.sin(time * 1.1) * 90}`}
          stroke="url(#stream2)"
          strokeWidth="1.5"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{
            pathLength: [0, 1, 0],
            strokeWidth: [0.5, 2.5, 0.5],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 8,
          }}
        />
      </svg>
    </div>
  )
}
