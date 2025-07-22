import type React from "react"
import type {Metadata} from "next"
import {Inter} from "next/font/google"
import "./globals.css"
import {DynamicBackground} from "@/components/DynamicBackground"
import {Toaster} from "@/components/ui/toaster"

const inter = Inter({subsets: ["latin"]})

export const metadata: Metadata = {
  title: "Netronix - Next Generation Messaging",
  description: "A futuristic chat application with immersive design",
  generator: "v0.dev",
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={`${inter.className} overflow-hidden`}>
        <DynamicBackground />
        <div className="relative z-10 min-h-screen">{children}</div>
        <Toaster />
      </body>
    </html>
  )
}
