"use client"

import { HeaderHome } from "@/components/header-home"
import { Hero } from "@/components/hero"
import { ProblemCategories } from "@/components/problem-categories"
import { Stats } from "@/components/stats"
import { HowItWorks } from "@/components/how-it-works"
import { Testimonials } from "@/components/testimonials"
import { CTA } from "@/components/cta"
import { FooterHome } from "@/components/footer-home"
import { useAuth } from "@/lib/auth-context"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "ADMIN") {
        router.push("/admin/dashboard")
      } else if (user.role === "TECHNICIEN") {
        router.push("/technicien/dashboard")
      } else if (user.role === "CITOYEN") {
        router.push("/mes-signalements")
      }
    }
  }, [isAuthenticated, user, router])

  // Show landing page only for non-authenticated users
  if (isAuthenticated) {
    return null
  }

  return (
    <>
      <HeaderHome />
      <Hero />
      <ProblemCategories />
      <Stats />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <FooterHome />
    </>
  )
}
