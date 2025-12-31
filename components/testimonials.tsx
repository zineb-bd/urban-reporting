"use client"

import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"

export function Testimonials() {
  const testimonials = [
    {
      name: "Marie Dupont",
      role: "Résidente à Paris",
      avatar: "MD",
      rating: 5,
      quote:
        "Enfin une plateforme efficace! J'ai signalé un nid de poule devant chez moi et il a été réparé en 2 semaines.",
      color: "from-blue-500 to-blue-600",
    },
    {
      name: "Jean Martin",
      role: "Citoyen à Lyon",
      avatar: "JM",
      rating: 5,
      quote: "Super transparent. On voit exactement le statut de nos signalements. C'est du vrai engagement citoyen!",
      color: "from-purple-500 to-purple-600",
    },
    {
      name: "Sophie Bernard",
      role: "Résidente à Toulouse",
      avatar: "SB",
      rating: 5,
      quote:
        "L'app est tellement facile à utiliser. J'ai signalé un éclairage cassé et j'ai reçu des updates régulières.",
      color: "from-pink-500 to-pink-600",
    },
  ]

  return (
    <section className="py-12 md:py-16 px-4 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto relative z-10 space-y-10">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">Ce que disent les utilisateurs</h2>
          <p className="text-lg text-foreground/70">Des milliers de citoyens satisfaits font déjà la différence</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="p-8 border border-border/50 bg-card/50 backdrop-blur hover:border-[#00648E]/50 transition-all duration-300"
            >
              <div className="space-y-6">
                {/* Rating */}
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-base text-foreground/90 leading-relaxed italic">"{testimonial.quote}"</p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center`}
                  >
                    <span className="text-white font-bold text-sm">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-foreground/60">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

