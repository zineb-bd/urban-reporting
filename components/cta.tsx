"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function CTA() {
  return (
    <section className="py-12 md:py-16 px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-bl from-[#00648E]/30 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-600/30 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-2xl text-center space-y-6 relative z-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00648E]/10 border border-[#00648E]/30">
            <Sparkles className="w-4 h-4 text-[#00648E]" />
            <span className="text-sm text-[#00648E]">Prêt à commencer?</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">Rejoignez le mouvement urbain</h2>
          <p className="text-lg text-foreground/70">
            Contribuez à une ville plus agréable. Des milliers de citoyens engagés font déjà la différence.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button className="bg-[#00648E] hover:bg-[#005a7a] text-white h-12 px-8 text-base flex items-center justify-center gap-2 group rounded-lg" asChild>
            <Link href="/inscription">
              Commencer gratuitement
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button
            variant="outline"
            className="border-[#00648E]/30 text-foreground hover:bg-[#00648E]/10 h-12 px-8 text-base rounded-lg bg-transparent"
            asChild
          >
            <Link href="/signalements">En savoir plus</Link>
          </Button>
        </div>

        <p className="text-sm text-foreground/60">Aucune carte de crédit requise. Accès gratuit pendant 14 jours.</p>
      </div>
    </section>
  )
}

