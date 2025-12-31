"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  const isContactPage = pathname === "/contact"

  // Ne pas afficher le header/footer sur la page d'accueil et contact car elles ont leur propre header/footer
  if (isHomePage || isContactPage) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">{children}</main>
      <Footer />
    </>
  )
}
