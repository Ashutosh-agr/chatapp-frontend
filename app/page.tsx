"use client"

import {useEffect} from "react"
import {useRouter} from "next/navigation"
import {motion, useScroll, useTransform} from "framer-motion"
import {Button} from "@/components/ui/button"
import {
  MessageCircle,
  Zap,
  Shield,
  Smartphone,
  Code,
  Lock,
  Users,
  Star,
  Github,
  ArrowRight,
  CheckCircle,
} from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const {scrollYProgress} = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3])

  useEffect(() => {
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (isLoggedIn) {
      router.push("/chat")
    }
  }, [router])

  const features = [
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Real-time Messaging",
      description:
        "Instant communication with lightning-fast delivery and read receipts",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "End-to-End Security",
      description:
        "Military-grade encryption ensures your conversations stay private",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Clean UI & Fast Performance",
      description: "Optimized for speed with a beautiful, intuitive interface",
      color: "from-green-500 to-teal-500",
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Cross Platform",
      description: "Works seamlessly across all your devices and platforms",
      color: "from-orange-500 to-red-500",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Senior Developer",
      company: "TechCorp",
      content:
        "The most intuitive chat platform I've ever used. The real-time features are incredible!",
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      name: "Marcus Rodriguez",
      role: "Product Manager",
      company: "StartupXYZ",
      content:
        "Security and performance in one package. Our team productivity has increased 40%.",
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      name: "Emily Watson",
      role: "UX Designer",
      company: "DesignStudio",
      content:
        "Beautiful interface, smooth animations. It's like chatting in the future!",
      avatar: "/placeholder.svg?height=60&width=60",
    },
  ]

  const floatingIcons = [
    {icon: MessageCircle, delay: 0, x: "10%", y: "20%"},
    {icon: Code, delay: 2, x: "80%", y: "15%"},
    {icon: Shield, delay: 4, x: "15%", y: "70%"},
    {icon: Lock, delay: 1, x: "85%", y: "60%"},
    {icon: Users, delay: 3, x: "50%", y: "80%"},
    {icon: Zap, delay: 5, x: "70%", y: "25%"},
  ]

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Floating Developer Icons */}
      <div className="fixed inset-0 pointer-events-none z-5">
        {floatingIcons.map((item, index) => (
          <motion.div
            key={index}
            className="absolute opacity-10"
            style={{left: item.x, top: item.y}}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              rotate: [0, 180, 360],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{
              duration: 15 + index * 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: item.delay,
            }}
          >
            <item.icon className="w-12 h-12 text-blue-400" />
          </motion.div>
        ))}
      </div>

      {/* Hero Section */}
      <motion.section
        className="min-h-screen flex items-center justify-center relative px-4"
        style={{y, opacity}}
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{opacity: 0, y: 50}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 1, ease: "easeOut"}}
          >
            <motion.h1
              className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight"
              initial={{opacity: 0, y: 30}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 1, delay: 0.2}}
            >
              <span className="holographic-text">Connect.</span>{" "}
              <span className="holographic-text">Chat.</span>{" "}
              <span className="holographic-text">Collaborate</span>
              <br />
              <span className="text-white/80 text-5xl md:text-6xl">
                — In Real Time.
              </span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed"
              initial={{opacity: 0, y: 30}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 1, delay: 0.4}}
            >
              Experience the future of communication with our advanced chat
              platform. Secure, fast, and beautifully designed for modern teams.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{opacity: 0, y: 30}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 1, delay: 0.6}}
            >
              <Button
                onClick={() => router.push("/auth/register")}
                className="group relative px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
              >
                <span className="relative z-10 flex items-center">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>

              <Button
                onClick={() => router.push("/auth/login")}
                variant="outline"
                className="px-8 py-4 text-lg font-semibold glass border-white/20 text-white hover:bg-white/10 hover:border-white/30 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Sign In
              </Button>
            </motion.div>
          </motion.div>

          {/* Floating Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto"
            initial={{opacity: 0, y: 50}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 1, delay: 0.8}}
          >
            {[
              {number: "10K+", label: "Active Users"},
              {number: "99.9%", label: "Uptime"},
              {number: "<50ms", label: "Response Time"},
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="floating-card p-6 rounded-xl text-center"
                whileHover={{scale: 1.05, y: -5}}
                transition={{type: "spring", stiffness: 300}}
              >
                <div className="text-3xl font-bold holographic-text mb-2">
                  {stat.number}
                </div>
                <div className="text-white/60">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{opacity: 0, y: 50}}
            whileInView={{opacity: 1, y: 0}}
            transition={{duration: 0.8}}
            viewport={{once: true}}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose <span className="holographic-text">Netronix</span>?
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Built with cutting-edge technology and designed for the modern
              developer workflow
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group floating-card p-8 rounded-2xl text-center hover:scale-105 transition-all duration-300"
                initial={{opacity: 0, y: 50}}
                whileInView={{opacity: 1, y: 0}}
                transition={{duration: 0.6, delay: index * 0.1}}
                viewport={{once: true}}
                whileHover={{y: -10}}
              >
                <motion.div
                  className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{rotate: 360}}
                  transition={{duration: 0.6}}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-white/70 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{opacity: 0, y: 50}}
            whileInView={{opacity: 1, y: 0}}
            transition={{duration: 0.8}}
            viewport={{once: true}}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Loved by <span className="holographic-text">Developers</span>
            </h2>
            <p className="text-xl text-white/70">
              See what our community is saying
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="floating-card p-8 rounded-2xl"
                initial={{opacity: 0, y: 50}}
                whileInView={{opacity: 1, y: 0}}
                transition={{duration: 0.6, delay: index * 0.2}}
                viewport={{once: true}}
                whileHover={{scale: 1.02, y: -5}}
              >
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-white/80 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="text-white font-semibold">
                      {testimonial.name}
                    </div>
                    <div className="text-white/60 text-sm">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative">
        <motion.div
          className="max-w-4xl mx-auto text-center floating-card p-12 rounded-3xl"
          initial={{opacity: 0, scale: 0.9}}
          whileInView={{opacity: 1, scale: 1}}
          transition={{duration: 0.8}}
          viewport={{once: true}}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to <span className="holographic-text">Transform</span> Your
            Communication?
          </h2>
          <p className="text-xl text-white/70 mb-8">
            Join thousands of developers who have already made the switch
          </p>
          <Button
            onClick={() => router.push("/auth/register")}
            className="group relative px-10 py-4 text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-0 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
          >
            <span className="relative z-10 flex items-center">
              Start Chatting Now
              <CheckCircle className="ml-2 w-6 h-6 group-hover:scale-110 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold holographic-text mb-2">
                Netronix
              </h3>
              <p className="text-white/60">
                Built with ❤️ by developers, for developers
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <motion.a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-white/70 hover:text-white transition-colors duration-300"
                whileHover={{scale: 1.1}}
                whileTap={{scale: 0.95}}
              >
                <Github className="w-6 h-6 mr-2" />
                View on GitHub
              </motion.a>
              <div className="text-white/60">
                © 2024 Netronix. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
