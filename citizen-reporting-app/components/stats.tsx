"use client"

export function Stats() {
  const stats = [
    {
      value: "5,234",
      label: "Problèmes résolus",
      description: "Cette année déjà",
    },
    {
      value: "24h",
      label: "Réponse moyenne",
      description: "Services municipaux",
    },
    {
      value: "98%",
      label: "Satisfaction citoyens",
      description: "Taux de satisfaction",
    },
    {
      value: "45",
      label: "Villes partenaires",
      description: "Rejoignez le mouvement",
    },
  ]

  return (
    <section id="stats" className="py-10 md:py-12 px-4 border-y border-border bg-card/30">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-2 flex flex-col items-center">
              <div className="text-4xl md:text-5xl font-bold text-orange-500">{stat.value}</div>
              <div className="text-lg font-semibold text-foreground">{stat.label}</div>
              <p className="text-sm text-foreground/60">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
