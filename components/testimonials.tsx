"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Star, Loader2 } from "lucide-react"

interface Avis {
  id: number
  note: number
  commentaire: string
  dateCreation: string
  user: {
    id: number
    prenom: string
    nom: string
    email: string
  }
}

const colors = [
  "from-blue-500 to-blue-600",
  "from-purple-500 to-purple-600",
  "from-pink-500 to-pink-600",
  "from-green-500 to-green-600",
  "from-orange-500 to-orange-600",
]

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Avis[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAvis = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        const url = `${apiUrl}/api/avis/latest?limit=3`
        console.log("🔍 Récupération des avis depuis:", url)
        
        const response = await fetch(url)
        console.log("📡 Réponse API:", response.status, response.statusText)
        
        if (response.ok) {
          const data = await response.json()
          console.log("✅ Données reçues:", data)
          setTestimonials(Array.isArray(data) ? data : [])
        } else {
          const errorText = await response.text()
          console.error("❌ Erreur API:", response.status, errorText)
          setTestimonials([])
        }
      } catch (error) {
        console.error("❌ Erreur de connexion:", error)
        setTestimonials([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAvis()
  }, [])

  const getInitials = (prenom: string, nom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase()
  }

  const getColor = (index: number) => {
    return colors[index % colors.length]
  }

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

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : testimonials.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.id}
              className="p-8 border border-border/50 bg-card/50 backdrop-blur hover:border-[#00648E]/50 transition-all duration-300"
            >
              <div className="space-y-6">
                {/* Rating */}
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < testimonial.note
                          ? "fill-yellow-500 text-yellow-500"
                          : "fill-gray-300 text-gray-300 dark:fill-gray-600 dark:text-gray-600"
                      }`}
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-base text-foreground/90 leading-relaxed italic">
                  "{testimonial.commentaire}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${getColor(index)} flex items-center justify-center`}
                  >
                    <span className="text-white font-bold text-sm">
                      {getInitials(testimonial.user.prenom, testimonial.user.nom)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {testimonial.user.prenom} {testimonial.user.nom}
                    </p>
                    <p className="text-sm text-foreground/60">Citoyen</p>
                  </div>
                </div>
              </div>
            </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun avis pour le moment. Soyez le premier à partager votre expérience !</p>
          </div>
        )}
      </div>
    </section>
  )
}

