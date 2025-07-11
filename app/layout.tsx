import type React from "react"
import type { Metadata } from "next"
import { Poppins, Dancing_Script } from "next/font/google"
import "./globals.css"
import 'mapbox-gl/dist/mapbox-gl.css'
import { Analytics } from "@vercel/analytics/next"

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"]
})

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dancing-script"
})

export const metadata: Metadata = {
  title: "TravelGenie AI",
  description: "Your travel planning companion",
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${poppins.className} ${dancingScript.variable} min-h-screen`}>
        <main className="min-h-screen">{children}</main>
        <Analytics />
      </body>
    </html>
  )
}
