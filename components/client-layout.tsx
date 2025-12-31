"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  // Ne pas afficher le header/footer sur la page d'accueil car elle a son propre header/footer
  if (isHomePage) {
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
