"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Zap } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative py-12 md:py-16 px-4 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#00648E]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto space-y-8 flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00648E]/10 border border-[#00648E]/30">
            <Zap className="w-4 h-4 text-[#00648E]" />
            <span className="text-sm font-medium text-[#00648E]">Signalez et changez votre ville</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight text-balance text-center">
            Transformez votre
            <span className="block bg-gradient-to-r from-[#00648E] via-[#005a7a] to-[#00648E] bg-clip-text text-transparent">
              ville en action
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-foreground/70 max-w-2xl text-balance text-center">
            Signalez les problèmes urbains directement aux services municipaux. Suivez leur résolution en temps réel et
            contribuez à une ville plus agréable.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
            <Button className="bg-[#00648E] hover:bg-[#005a7a] text-white h-12 px-8 text-base flex items-center gap-2 group rounded-lg" asChild>
              <Link href="/inscription">
                Commencer maintenant
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-12 px-8 text-base border-[#00648E]/30 hover:bg-[#00648E]/10 text-foreground rounded-lg bg-transparent"
              asChild
            >
              <Link href="/signalements">Voir la démo</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 pt-8 border-t border-border/50 justify-center w-full">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#00648E]">2,500+</div>
              <p className="text-sm text-foreground/60">Citoyens engagés</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#00648E]">98%</div>
              <p className="text-sm text-foreground/60">Satisfaction</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#00648E]">45</div>
              <p className="text-sm text-foreground/60">Villes partenaires</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

