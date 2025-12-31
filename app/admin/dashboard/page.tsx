"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { TrendingUp, Clock, CheckCircle2, AlertTriangle, Users, Loader2, FileText, BarChart3, ArrowRight, Activity } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface DashboardStats {
  totalSignalements: number
  nouveauxSignalements: number
  enAttente: number
  enCours: number
  resolus: number
  resolusCeMois: number
  recentSignalements: Array<{
    id: number
    titre: string
    statut: string
    priorite: string
    dateCreation: string
  }>
  techniciensStats: Array<{
    id: number
    nom: string
    prenom: string
    actifs: number
    resolus: number
  }>
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    } else if (user?.role !== "ADMIN") {
      router.push("/")
      return
    }

    const fetchStats = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Token d'authentification manquant")
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        const response = await fetch(`${apiUrl}/api/admin/dashboard/stats`, {
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
        setStats(data)
      } catch (err: any) {
        console.error("Erreur lors de la récupération des statistiques:", err)
        setError(err.message || "Une erreur est survenue lors du chargement des statistiques")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return null
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Date inconnue"
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return "À l'instant"
      if (diffMins < 60) return `Il y a ${diffMins} min`
      if (diffHours < 24) return `Il y a ${diffHours}h`
      if (diffDays < 7) return `Il y a ${diffDays}j`
      return date.toLocaleDateString("fr-FR")
    } catch {
      return dateString
    }
  }

  const statsCards = stats ? [
    {
      title: "Total signalements",
      value: stats.totalSignalements.toLocaleString("fr-FR"),
      icon: AlertTriangle,
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-600",
      description: "Tous les signalements",
    },
    {
      title: "En attente",
      value: stats.enAttente.toLocaleString("fr-FR"),
      icon: Clock,
      gradient: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-500/10",
      iconColor: "text-amber-600",
      description: "En attente d'assignation",
    },
    {
      title: "En cours",
      value: stats.enCours.toLocaleString("fr-FR"),
      icon: Activity,
      gradient: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-500/10",
      iconColor: "text-orange-600",
      description: "En traitement",
    },
    {
      title: "Résolus ce mois",
      value: stats.resolusCeMois.toLocaleString("fr-FR"),
      icon: CheckCircle2,
      gradient: "from-green-500 to-green-600",
      bgColor: "bg-green-500/10",
      iconColor: "text-green-600",
      description: "Résolus ce mois",
    },
  ] : []

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00648E]" />
        <span className="ml-2 text-muted-foreground">Chargement des statistiques...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Erreur</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Tableau de bord administrateur
              </h1>
              <p className="text-lg text-muted-foreground">Vue d'ensemble de l'activité et des signalements</p>
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Statistiques en temps réel</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card 
                key={stat.title} 
                className="group relative overflow-hidden border-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Recent Signalements */}
          <Card className="lg:col-span-2 border-2 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/30">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Signalements récents
                  </CardTitle>
                  <CardDescription className="mt-1">Dernières activités sur la plateforme</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {stats.recentSignalements.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {stats.recentSignalements.map((signalement, index) => (
                      <Link
                        key={signalement.id}
                        href={`/signalements/${signalement.id}`}
                        className="block group"
                      >
                        <div className="flex items-center justify-between rounded-xl border-2 border-border p-4 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent dark:hover:from-blue-950/20 hover:shadow-md">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3">
                              <div className={`mt-1 h-2 w-2 rounded-full ${
                                signalement.priorite === "HAUTE" ? "bg-red-500" :
                                signalement.priorite === "MOYENNE" ? "bg-amber-500" : "bg-blue-500"
                              }`} />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                                  {signalement.titre}
                                </h3>
                                <div className="mt-2 flex items-center gap-2 flex-wrap">
                                  <Badge
                                    variant={
                                      signalement.priorite === "HAUTE"
                                        ? "destructive"
                                        : signalement.priorite === "MOYENNE"
                                          ? "default"
                                          : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    {signalement.priorite}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {signalement.statut.replace("_", " ")}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="ml-4 flex items-center gap-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDate(signalement.dateCreation)}
                            </span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Button variant="outline" className="mt-6 w-full group hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-700" asChild>
                    <Link href="/signalements" className="flex items-center justify-center gap-2">
                      Voir tous les signalements
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Aucun signalement récent</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Techniciens */}
          <Card className="border-2 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/30">
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                Techniciens actifs
              </CardTitle>
              <CardDescription className="mt-1">Performance de l'équipe</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {stats.techniciensStats.length > 0 ? (
                <div className="space-y-5">
                  {stats.techniciensStats.map((tech) => {
                    const total = tech.actifs + tech.resolus
                    const percentage = total > 0 ? (tech.resolus / total) * 100 : 0
                    return (
                      <div key={tech.id} className="space-y-3 p-4 rounded-xl border border-border hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-transparent dark:hover:from-purple-950/20 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-base">{tech.prenom} {tech.nom}</span>
                            <p className="text-xs text-muted-foreground mt-0.5">Technicien</p>
                          </div>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-orange-500" />
                            <span className="text-muted-foreground">{tech.actifs} actifs</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-green-600 dark:text-green-400 font-medium">{tech.resolus} résolus</span>
                          </div>
                        </div>
                        {total > 0 && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Taux de résolution</span>
                              <span className="font-medium">{Math.round(percentage)}%</span>
                            </div>
                            <div className="h-3 w-full overflow-hidden rounded-full bg-secondary border border-border">
                              <div
                                className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 ease-out"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Aucun technicien disponible</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  )
}
