"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { FileText, Download, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function RapportsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [filters, setFilters] = useState({
    periode: "mois",
    statut: "tous",
    categorie: "toutes",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

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

  const handleGenerateReport = async () => {
    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("Token d'authentification manquant")
      }

      // Construire les paramètres de requête
      const params = new URLSearchParams()
      if (filters.periode !== "tous") {
        params.append("periode", filters.periode)
      }
      if (filters.statut !== "tous") {
        params.append("statut", filters.statut)
      }
      if (filters.categorie !== "toutes") {
        params.append("categorie", filters.categorie)
      }

      const response = await fetch(`${apiUrl}/api/admin/rapports?${params.toString()}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          // L'endpoint n'existe pas encore, générer un rapport côté client
          alert("La génération de rapport est en cours de développement. Les données seront bientôt disponibles.")
          setLoading(false)
          return
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      // Récupérer les données JSON
      const rapport = await response.json()
      
      // Créer un blob JSON pour le téléchargement
      const jsonString = JSON.stringify(rapport, null, 2)
      const blob = new Blob([jsonString], { type: "application/json" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `rapport-signalements-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      // Afficher un message de succès
      alert(`Rapport généré avec succès !\n\nTotal signalements: ${rapport.statistiques?.total || 0}\nNouveau: ${rapport.statistiques?.nouveau || 0}\nEn attente: ${rapport.statistiques?.enAttente || 0}\nEn cours: ${rapport.statistiques?.enCours || 0}\nRésolu: ${rapport.statistiques?.resolu || 0}`)
    } catch (error: any) {
      console.error("Erreur lors de la génération du rapport:", error)
      alert(error.message || "Une erreur est survenue lors de la génération du rapport")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Génération de rapports
          </h1>
          <p className="text-muted-foreground">Générez des rapports détaillés sur les signalements</p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Paramètres du rapport</CardTitle>
            <CardDescription>Configurez les filtres pour votre rapport</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="periode">Période</Label>
              {isMounted ? (
                <Select
                  value={filters.periode}
                  onValueChange={(value) => setFilters({ ...filters, periode: value })}
                >
                  <SelectTrigger id="periode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semaine">Cette semaine</SelectItem>
                    <SelectItem value="mois">Ce mois</SelectItem>
                    <SelectItem value="trimestre">Ce trimestre</SelectItem>
                    <SelectItem value="annee">Cette année</SelectItem>
                    <SelectItem value="tous">Toutes les périodes</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground flex items-center">
                  {filters.periode === "semaine" ? "Cette semaine" :
                   filters.periode === "mois" ? "Ce mois" :
                   filters.periode === "trimestre" ? "Ce trimestre" :
                   filters.periode === "annee" ? "Cette année" : "Toutes les périodes"}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="statut">Statut</Label>
              {isMounted ? (
                <Select
                  value={filters.statut}
                  onValueChange={(value) => setFilters({ ...filters, statut: value })}
                >
                  <SelectTrigger id="statut">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tous">Tous les statuts</SelectItem>
                    <SelectItem value="NOUVEAU">Nouveau</SelectItem>
                    <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                    <SelectItem value="EN_COURS">En cours</SelectItem>
                    <SelectItem value="RESOLU">Résolu</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground flex items-center">
                  {filters.statut === "tous" ? "Tous les statuts" :
                   filters.statut === "NOUVEAU" ? "Nouveau" :
                   filters.statut === "EN_ATTENTE" ? "En attente" :
                   filters.statut === "EN_COURS" ? "En cours" : "Résolu"}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categorie">Catégorie</Label>
              {isMounted ? (
                <Select
                  value={filters.categorie}
                  onValueChange={(value) => setFilters({ ...filters, categorie: value })}
                >
                  <SelectTrigger id="categorie">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="toutes">Toutes les catégories</SelectItem>
                    <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="Environnement">Environnement</SelectItem>
                    <SelectItem value="Sécurité">Sécurité</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground flex items-center">
                  {filters.categorie === "toutes" ? "Toutes les catégories" : filters.categorie}
                </div>
              )}
            </div>

            <div className="pt-4">
              <Button
                onClick={handleGenerateReport}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Calendar className="mr-2 h-4 w-4 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Générer le rapport
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

