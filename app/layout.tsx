import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { ToastProvider } from "@/components/toast-provider"
import "./globals.css"

// Load Poppins font with multiple weights
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "DeskFlow - Login",
  description: "Smart way for office management",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-poppins`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
