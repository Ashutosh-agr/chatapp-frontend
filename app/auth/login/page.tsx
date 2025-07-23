"use client"

import type React from "react"

import {useState} from "react"
import {useRouter} from "next/navigation"
import {motion, AnimatePresence} from "framer-motion"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowLeft,
  Fingerprint,
  Zap,
} from "lucide-react"
import Link from "next/link"
import {useToast} from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    api?: string
  }>({})
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const router = useRouter()
  const {toast} = useToast()

  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {}

    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      // Shake animation for errors
      const form = e.target as HTMLFormElement
      form.classList.add("animate-shake")
      setTimeout(() => form.classList.remove("animate-shake"), 500)
      return
    }

    setIsLoading(true)

    try {
      const existingToken = localStorage.getItem("token")
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      if (existingToken) {
        headers["Authorization"] = `Bearer ${existingToken}`
      }
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        process.env.VITE_BACKEND_URL ||
        "http://localhost:8080"
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: "POST",
        headers,
        body: JSON.stringify({email, password}),
      })

      if (response.ok) {
        const data = await response.json()
        // Store token and user info
        localStorage.setItem("token", data.token)
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem("userEmail", email)
        if (data.userId) {
          localStorage.setItem("userId", data.userId)
        }
        // console.log("localStorage after login:", {
        //   token: localStorage.getItem("token"),
        //   isLoggedIn: localStorage.getItem("isLoggedIn"),
        //   userEmail: localStorage.getItem("userEmail"),
        //   userId: localStorage.getItem("userId"),
        // })

        toast({
          title: "Welcome back!",
          description: "Successfully logged in to Netronix",
          variant: "message" as any,
        })
        router.push("/chat")
      } else {
        const errorData = await response.json()
        // Catch both 'error' and 'message' fields from backend
        setErrors((prev) => ({
          ...prev,
          api: errorData.error || errorData.message || "Login failed",
        }))
      }
    } catch (error) {
      setErrors((prev) => ({...prev, api: "Network error"}))
    } finally {
      setIsLoading(false)
    }
  }

  const inputVariants = {
    focused: {scale: 1.02, y: -2},
    unfocused: {scale: 1, y: 0},
  }

  const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-purple-400/40 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-30, -120],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Number.POSITIVE_INFINITY,
            delay: Math.random() * 6,
          }}
        />
      ))}
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <FloatingParticles />

      <motion.div
        initial={{opacity: 0, scale: 0.9, y: 20}}
        animate={{opacity: 1, scale: 1, y: 0}}
        transition={{duration: 0.6, ease: "easeOut"}}
        className="w-full max-w-md relative"
      >
        {/* Pulsing highlights when focused */}
        <AnimatePresence>
          {focusedField && (
            <motion.div
              initial={{opacity: 0, scale: 0.8}}
              animate={{opacity: 1, scale: 1}}
              exit={{opacity: 0, scale: 0.8}}
              className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-xl"
            />
          )}
        </AnimatePresence>

        <div className="glass-dark rounded-3xl p-8 text-white relative overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 animate-pulse" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center mb-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/")}
                className="text-white hover:bg-white/10 mr-3 rounded-xl"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center">
                  Welcome Back
                  <motion.div
                    animate={{rotate: [0, 360]}}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                    className="ml-3"
                  >
                    <Zap className="w-6 h-6 text-blue-400" />
                  </motion.div>
                </h1>
                <p className="text-white/60 mt-1">
                  Sign in to continue your journey
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                className="space-y-2"
                variants={inputVariants}
                animate={focusedField === "email" ? "focused" : "unfocused"}
              >
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-white/80"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    className="pl-10 professional-input text-white placeholder:text-white/50 focus:border-purple-400 rounded-xl h-12 transition-all duration-300"
                    placeholder="Enter your email"
                  />
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{opacity: 0, y: -10, x: -10}}
                      animate={{opacity: 1, y: 0, x: 0}}
                      exit={{opacity: 0, y: -10}}
                      className="text-red-400 text-sm flex items-center"
                    >
                      <span className="w-1 h-1 bg-red-400 rounded-full mr-2" />
                      {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                className="space-y-2"
                variants={inputVariants}
                animate={focusedField === "password" ? "focused" : "unfocused"}
              >
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-white/80"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    className="pl-10 pr-20 professional-input text-white placeholder:text-white/50 focus:border-purple-400 rounded-xl h-12 transition-all duration-300"
                    placeholder="Enter your password"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <motion.div
                      whileHover={{scale: 1.1}}
                      className="text-purple-400/60"
                    >
                      <Fingerprint className="w-5 h-5" />
                    </motion.div>
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-white/50 hover:text-white transition-colors"
                      whileHover={{scale: 1.1}}
                      whileTap={{scale: 0.9}}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      initial={{opacity: 0, y: -10, x: -10}}
                      animate={{opacity: 1, y: 0, x: 0}}
                      exit={{opacity: 0, y: -10}}
                      className="text-red-400 text-sm flex items-center"
                    >
                      <span className="w-1 h-1 bg-red-400 rounded-full mr-2" />
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-white/70">
                  <input type="checkbox" className="mr-2 rounded" />
                  Remember me
                </label>
                <Link
                  href="#"
                  className="text-purple-400 hover:text-purple-300 relative group transition-colors duration-300"
                >
                  Forgot password?
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </div>

              <motion.div whileHover={{scale: 1.02}} whileTap={{scale: 0.98}}>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-0 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25 relative group"
                >
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        key="loading"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        className="flex items-center"
                      >
                        <motion.div
                          animate={{rotate: 360}}
                          transition={{
                            duration: 1,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                          }}
                          className="rounded-full h-5 w-5 border-b-2 border-white mr-2"
                        />
                        <motion.span
                          animate={{opacity: [1, 0.5, 1]}}
                          transition={{
                            duration: 1.5,
                            repeat: Number.POSITIVE_INFINITY,
                          }}
                        >
                          Signing In...
                        </motion.span>
                      </motion.div>
                    ) : (
                      <motion.span
                        key="signin"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        className="flex items-center justify-center"
                      >
                        Sign In
                        <motion.div
                          animate={{x: [0, 5, 0]}}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                          }}
                          className="ml-2"
                        >
                          <ArrowLeft className="w-5 h-5 rotate-180" />
                        </motion.div>
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
                {/* Show API error message if present */}
                <AnimatePresence>
                  {errors.api && (
                    <motion.p
                      initial={{opacity: 0, y: -10}}
                      animate={{opacity: 1, y: 0}}
                      exit={{opacity: 0, y: -10}}
                      className="text-red-400 text-sm mt-4 text-center"
                    >
                      {errors.api}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            </form>

            <motion.div
              className="mt-8 text-center"
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              transition={{delay: 0.8}}
            >
              <p className="text-white/70">
                Don't have an account?{" "}
                <Link
                  href="/auth/register"
                  className="text-purple-400 hover:text-purple-300 font-medium relative group transition-colors duration-300"
                >
                  Sign up
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
