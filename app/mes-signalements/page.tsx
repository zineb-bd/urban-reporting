"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { Clock, CheckCircle2, AlertCircle, Plus, FileText, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const statusConfig = {
  NOUVEAU: { label: "Nouveau", color: "bg-blue-500", icon: AlertCircle },
  EN_ATTENTE: { label: "En attente", color: "bg-yellow-500", icon: Clock },
  EN_COURS: { label: "En cours", color: "bg-orange-500", icon: Clock },
  RESOLU: { label: "Résolu", color: "bg-green-500", icon: CheckCircle2 },
}

interface Signalement {
  id: number
  titre: string
  description: string
  categorie: string
  statut: "NOUVEAU" | "EN_ATTENTE" | "EN_COURS" | "RESOLU"
  priorite: "BASSE" | "MOYENNE" | "HAUTE"
  dateCreation: string
  photoUrl?: string | null
  adresse?: string | null
}

export default function MesSignalementsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [signalements, setSignalements] = useState<Signalement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Vérifier d'abord le localStorage avant de rediriger
    const token = localStorage.getItem("token")
    const savedUser = localStorage.getItem("user")
    
    if (!token || !savedUser) {
      router.push("/login")
      return
    }
    
    // Vérifier le rôle depuis le localStorage
    try {
      const parsedUser = JSON.parse(savedUser)
      if (parsedUser.role !== "CITOYEN") {
        router.push("/")
        return
      }
    } catch {
      router.push("/login")
      return
    }
    
    // Si isAuthenticated est false mais qu'on a un token, attendre un peu
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        const stillNoAuth = !localStorage.getItem("token")
        if (stillNoAuth) {
          router.push("/login")
        }
      }, 1000)
      return () => clearTimeout(timer)
    }

    // Récupérer les signalements depuis le backend
    const fetchSignalements = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Token d'authentification manquant")
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        const response = await fetch(`${apiUrl}/api/signalements/mes-signalements`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            router.push("/login")
            return
          }
          throw new Error(`Erreur ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        setSignalements(data || [])
      } catch (err: any) {
        console.error("Erreur lors de la récupération des signalements:", err)
        setError(err.message || "Une erreur est survenue lors de la récupération de vos signalements")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSignalements()
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.role !== "CITOYEN") {
    return null
  }

  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Mes signalements</h1>
            <p className="text-muted-foreground">Consultez et suivez l'état de vos signalements</p>
          </div>
          <Button asChild>
            <Link href="/signalements/nouveau">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau signalement
            </Link>
          </Button>
        </div>

        {/* Stats - Horizontal Design */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-[#00648E] hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#00648E]/10 p-3">
                    <FileText className="h-6 w-6 text-[#00648E]" />
                  </div>
                  <div>
                    <CardDescription className="text-sm font-medium">Total</CardDescription>
                    <CardTitle className="text-4xl font-bold text-[#00648E]">{signalements.length}</CardTitle>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/10 p-3">
                    <AlertCircle className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <CardDescription className="text-sm font-medium">Nouveaux</CardDescription>
                    <CardTitle className="text-4xl font-bold text-blue-500">
                      {signalements.filter((s) => s.statut === "NOUVEAU").length}
                    </CardTitle>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-yellow-500/10 p-3">
                    <Clock className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <CardDescription className="text-sm font-medium">En cours</CardDescription>
                    <CardTitle className="text-4xl font-bold text-yellow-500">
                      {signalements.filter((s) => s.statut === "EN_COURS" || s.statut === "EN_ATTENTE").length}
                    </CardTitle>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-500/10 p-3">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <CardDescription className="text-sm font-medium">Résolus</CardDescription>
                    <CardTitle className="text-4xl font-bold text-green-500">
                      {signalements.filter((s) => s.statut === "RESOLU").length}
                    </CardTitle>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#00648E]" />
            <span className="ml-2 text-muted-foreground">Chargement de vos signalements...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Erreur</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.reload()}>Réessayer</Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && signalements.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Aucun signalement</CardTitle>
              <CardDescription>Vous n'avez pas encore créé de signalement.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/signalements/nouveau">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer votre premier signalement
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Signalements List */}
        {!isLoading && !error && signalements.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {signalements.map((signalement) => {
              const statusInfo = statusConfig[signalement.statut as keyof typeof statusConfig]
              const StatusIcon = statusInfo.icon

              return (
                <Link key={signalement.id} href={`/signalements/${signalement.id}`}>
                  <Card className="h-full transition-all hover:shadow-lg">
                    <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-muted">
                      {signalement.photoUrl ? (
                        <img
                          src={signalement.photoUrl}
                          alt={signalement.titre}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg"
                            target.onerror = null
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <FileText className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardHeader className="pb-3">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <Badge variant={signalement.priorite === "HAUTE" ? "destructive" : "default"}>
                          {signalement.priorite}
                        </Badge>
                        <div
                          className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs text-white ${statusInfo.color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </div>
                      </div>
                      <CardTitle className="line-clamp-2">{signalement.titre}</CardTitle>
                      <CardDescription className="line-clamp-2">{signalement.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{signalement.categorie}</span>
                        <span>{formatDate(signalement.dateCreation)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
