"use client"

import { Card } from "@/components/ui/card"
import { AlertCircle, Lightbulb, Trash2, Wrench, Trees, SquareUser as SquareAlert } from "lucide-react"

export function ProblemCategories() {
  const categories = [
    {
      icon: AlertCircle,
      title: "Nids de poule",
      description: "Routes endommagées et surfaces défectueuses",
      color: "from-red-500 to-red-600",
    },
    {
      icon: Lightbulb,
      title: "Éclairage public",
      description: "Réverbères défaillants ou cassés",
      color: "from-yellow-500 to-yellow-600",
    },
    {
      icon: Trash2,
      title: "Déchets",
      description: "Accumulation de déchets ou saletés",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Wrench,
      title: "Infrastructure",
      description: "Problèmes d'équipements publics",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Trees,
      title: "Espaces verts",
      description: "Entretien des arbres et jardins publics",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      icon: SquareAlert,
      title: "Signalisation",
      description: "Panneaux manquants ou endommagés",
      color: "from-orange-500 to-orange-600",
    },
  ]

  return (
    <section className="py-12 md:py-16 px-4 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 -right-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto relative z-10 space-y-10">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">Types de problèmes signalables</h2>
          <p className="text-lg text-foreground/70">
            Signalez tous les types de problèmes urbains pour améliorer votre quartier
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <Card
                key={index}
                className="p-8 border border-border/50 bg-card/50 backdrop-blur hover:border-orange-500/50 hover:bg-card transition-all duration-300 group cursor-pointer"
              >
                <div className="space-y-4">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{category.title}</h3>
                    <p className="text-sm text-foreground/70 mt-2">{category.description}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
