"use client"

import { Card } from "@/components/ui/card"
import { MapPin, Activity, TrendingUp, Users, Lock, Camera } from "lucide-react"

export function Features() {
  const features = [
    {
      icon: MapPin,
      title: "Localisation GPS",
      description: "Signalez avec précision les problèmes urbains",
    },
    {
      icon: Camera,
      title: "Documentation visuelle",
      description: "Ajoutez des photos pour plus de clarté",
    },
    {
      icon: Activity,
      title: "Suivi en temps réel",
      description: "Recevez des mises à jour instantanées",
    },
    {
      icon: TrendingUp,
      title: "Analytics & Rapports",
      description: "Consultez l'impact de vos signalements",
    },
    {
      icon: Users,
      title: "Communauté urbaine",
      description: "Connectez-vous avec d'autres citoyens",
    },
    {
      icon: Lock,
      title: "Données sécurisées",
      description: "Votre confidentialité est protégée",
    },
  ]

  return (
    <section id="features" className="py-20 md:py-32 px-4 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto relative z-10 space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">Tout ce dont vous avez besoin</h2>
          <p className="text-lg text-foreground/70">
            Des outils puissants pour signaler, documenter et suivre les problèmes urbains
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className="p-6 border border-border/50 bg-card/50 backdrop-blur hover:border-orange-500/50 hover:bg-card transition-all duration-300 group"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-orange-600/20 flex items-center justify-center group-hover:bg-orange-600/30 transition-colors">
                    <Icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-foreground/70">{feature.description}</p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
