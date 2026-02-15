import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { Providers } from "./providers"
import { Toaster } from "sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "Vapor - Liquid AI Dashboard",
  description: "Model training and deployment dashboard",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className}>
        <Providers>{children}</Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
