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
  User,
  ArrowLeft,
  CheckCircle,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import {useToast} from "@/hooks/use-toast"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const router = useRouter()
  const {toast} = useToast()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
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
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        process.env.VITE_BACKEND_URL ||
        "http://localhost:8080"
      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        // Store token and user info
        localStorage.setItem("token", data.token)
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem("userEmail", formData.email)
        localStorage.setItem(
          "userName",
          `${formData.firstName} ${formData.lastName}`
        )

        setShowSuccess(true)
        toast({
          title: "Welcome to Netronix!",
          description:
            "Your account has been created successfully. Please login to continue.",
          variant: "message" as any,
        })
        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
      } else {
        const errorData = await response.json()
        // Catch both 'error' and 'message' fields from backend
        setErrors((prev) => ({
          ...prev,
          api: errorData.error || errorData.message || "Registration failed",
        }))
      }
    } catch (error) {
      setErrors((prev) => ({...prev, api: "Network error"}))
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({...prev, [field]: value}))
    if (errors[field]) {
      setErrors((prev) => ({...prev, [field]: ""}))
    }
  }

  const inputVariants = {
    focused: {scale: 1.02, y: -2},
    unfocused: {scale: 1, y: 0},
  }

  const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-20, -100],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Number.POSITIVE_INFINITY,
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  )

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <FloatingParticles />
        <motion.div
          initial={{scale: 0, opacity: 0}}
          animate={{scale: 1, opacity: 1}}
          className="text-center"
        >
          <motion.div
            initial={{scale: 0}}
            animate={{scale: 1}}
            transition={{delay: 0.2, type: "spring", stiffness: 200}}
            className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>
          <motion.h1
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.4}}
            className="text-4xl font-bold text-white mb-4"
          >
            Welcome to Netronix!
          </motion.h1>
          <motion.p
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.6}}
            className="text-white/70 text-lg"
          >
            Your account has been created successfully. Redirecting...
          </motion.p>
        </motion.div>
      </div>
    )
  }

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
              className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl"
            />
          )}
        </AnimatePresence>

        <div className="glass-dark rounded-3xl p-8 text-white relative overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 animate-pulse" />
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
                  Create Account
                  <Sparkles className="w-6 h-6 ml-2 text-purple-400" />
                </h1>
                <p className="text-white/60 mt-1">
                  Join the future of communication
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  className="space-y-2"
                  variants={inputVariants}
                  animate={
                    focusedField === "firstName" ? "focused" : "unfocused"
                  }
                >
                  <label
                    htmlFor="firstName"
                    className="text-sm font-medium text-white/80"
                  >
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      onFocus={() => setFocusedField("firstName")}
                      onBlur={() => setFocusedField(null)}
                      className="pl-10 professional-input text-white placeholder:text-white/50 focus:border-blue-400 rounded-xl h-12 transition-all duration-300"
                      placeholder="John"
                    />
                  </div>
                  <AnimatePresence>
                    {errors.firstName && (
                      <motion.p
                        initial={{opacity: 0, y: -10, x: -10}}
                        animate={{opacity: 1, y: 0, x: 0}}
                        exit={{opacity: 0, y: -10}}
                        className="text-red-400 text-sm flex items-center"
                      >
                        <span className="w-1 h-1 bg-red-400 rounded-full mr-2" />
                        {errors.firstName}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div
                  className="space-y-2"
                  variants={inputVariants}
                  animate={
                    focusedField === "lastName" ? "focused" : "unfocused"
                  }
                >
                  <label
                    htmlFor="lastName"
                    className="text-sm font-medium text-white/80"
                  >
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      onFocus={() => setFocusedField("lastName")}
                      onBlur={() => setFocusedField(null)}
                      className="pl-10 professional-input text-white placeholder:text-white/50 focus:border-blue-400 rounded-xl h-12 transition-all duration-300"
                      placeholder="Doe"
                    />
                  </div>
                  <AnimatePresence>
                    {errors.lastName && (
                      <motion.p
                        initial={{opacity: 0, y: -10, x: -10}}
                        animate={{opacity: 1, y: 0, x: 0}}
                        exit={{opacity: 0, y: -10}}
                        className="text-red-400 text-sm flex items-center"
                      >
                        <span className="w-1 h-1 bg-red-400 rounded-full mr-2" />
                        {errors.lastName}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

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
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    className="pl-10 professional-input text-white placeholder:text-white/50 focus:border-blue-400 rounded-xl h-12 transition-all duration-300"
                    placeholder="john@example.com"
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
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    className="pl-10 pr-12 professional-input text-white placeholder:text-white/50 focus:border-blue-400 rounded-xl h-12 transition-all duration-300"
                    placeholder="Create a secure password"
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
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

              <motion.div whileHover={{scale: 1.02}} whileTap={{scale: 0.98}}>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/25 relative group"
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
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating Account...
                      </motion.div>
                    ) : (
                      <motion.span
                        key="create"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        className="flex items-center justify-center"
                      >
                        Create Account
                        <Sparkles className="ml-2 w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-blue-400 hover:text-blue-300 font-medium relative group transition-colors duration-300"
                >
                  Login here
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
