"use client"

import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { ProblemCategories } from "@/components/problem-categories"
import { Stats } from "@/components/stats"
import { HowItWorks } from "@/components/how-it-works"
import { Testimonials } from "@/components/testimonials"
import { CTA } from "@/components/cta"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      <ProblemCategories />
      <Stats />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  )
}
