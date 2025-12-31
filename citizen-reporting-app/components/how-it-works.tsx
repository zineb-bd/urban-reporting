"use client"

import { Card } from "@/components/ui/card"
import { UserPlus, AlertCircle, MapPin, CheckCircle } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      number: "1",
      title: "Créer un compte",
      description: "Inscrivez-vous en quelques secondes avec votre email",
    },
    {
      icon: AlertCircle,
      number: "2",
      title: "Signaler un problème",
      description: "Sélectionnez la catégorie et ajoutez une photo + description",
    },
    {
      icon: MapPin,
      number: "3",
      title: "Localiser le problème",
      description: "Utilisez le GPS pour indiquer la localisation exacte",
    },
    {
      icon: CheckCircle,
      number: "4",
      title: "Suivre la résolution",
      description: "Recevez des mises à jour en temps réel jusqu'à la résolution",
    },
  ]

  return (
    <section className="py-12 md:py-16 px-4 relative bg-card/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto relative z-10 space-y-10">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">Comment ça marche?</h2>
          <p className="text-lg text-foreground/70">4 étapes simples pour signaler et suivre les problèmes urbains</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative">
                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+32px)] w-[calc(100%-64px)] h-1 bg-gradient-to-r from-orange-500/50 to-transparent" />
                )}

                <Card className="p-6 border border-border/50 bg-card/70 backdrop-blur h-full flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-background border-2 border-border flex items-center justify-center">
                      <span className="text-sm font-bold text-orange-500">{step.number}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                    <p className="text-sm text-foreground/70 mt-2">{step.description}</p>
                  </div>
                </Card>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
