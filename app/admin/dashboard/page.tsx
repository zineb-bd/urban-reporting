"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { TrendingUp, Clock, CheckCircle2, AlertTriangle, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    } else if (user?.role !== "ADMIN") {
      router.push("/")
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return null
  }

  const stats = [
    {
      title: "Total signalements",
      value: "1,247",
      change: "+12.5%",
      trend: "up",
      icon: AlertTriangle,
    },
    {
      title: "En attente",
      value: "89",
      change: "-5.2%",
      trend: "down",
      icon: Clock,
    },
    {
      title: "En cours",
      value: "234",
      change: "+8.1%",
      trend: "up",
      icon: TrendingUp,
    },
    {
      title: "Résolus ce mois",
      value: "456",
      change: "+23.4%",
      trend: "up",
      icon: CheckCircle2,
    },
  ]

  const recentSignalements = [
    {
      id: 1,
      titre: "Nid de poule avenue Victor Hugo",
      statut: "EN_COURS",
      priorite: "HAUTE",
      date: "Il y a 2h",
    },
    {
      id: 2,
      titre: "Lampadaire éteint rue de la Paix",
      statut: "NOUVEAU",
      priorite: "MOYENNE",
      date: "Il y a 4h",
    },
    {
      id: 3,
      titre: "Dépôt sauvage place de la Mairie",
      statut: "EN_ATTENTE",
      priorite: "BASSE",
      date: "Il y a 6h",
    },
  ]

  const techniciens = [
    { nom: "Martin Pierre", actifs: 12, resolus: 45 },
    { nom: "Dubois Sophie", actifs: 8, resolus: 52 },
    { nom: "Bernard Luc", actifs: 15, resolus: 38 },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Tableau de bord administrateur</h1>
          <p className="text-muted-foreground">Vue d'ensemble de l'activité et des signalements</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className={`text-xs ${stat.trend === "up" ? "text-accent" : "text-destructive"}`}>
                    {stat.change} par rapport au mois dernier
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Recent Signalements */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Signalements récents</CardTitle>
              <CardDescription>Dernières activités sur la plateforme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSignalements.map((signalement) => (
                  <div
                    key={signalement.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-secondary/50"
                  >
                    <div className="flex-1">
                      <Link href={`/signalements/${signalement.id}`} className="font-medium hover:text-primary">
                        {signalement.titre}
                      </Link>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge
                          variant={
                            signalement.priorite === "HAUTE"
                              ? "destructive"
                              : signalement.priorite === "MOYENNE"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {signalement.priorite}
                        </Badge>
                        <Badge variant="outline">{signalement.statut.replace("_", " ")}</Badge>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{signalement.date}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="mt-4 w-full bg-transparent" asChild>
                <Link href="/signalements">Voir tous les signalements</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Techniciens */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Techniciens actifs
              </CardTitle>
              <CardDescription>Performance de l'équipe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {techniciens.map((tech) => (
                  <div key={tech.nom} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{tech.nom}</span>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{tech.actifs} actifs</span>
                      <span className="text-accent">{tech.resolus} résolus</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full bg-accent"
                        style={{ width: `${(tech.resolus / (tech.resolus + tech.actifs)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" asChild>
                <Link href="/signalements/nouveau">Créer un signalement</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/techniciens">Assigner un technicien</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/rapports">Générer un rapport</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
