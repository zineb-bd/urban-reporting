"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Search, Filter, Clock, CheckCircle2, AlertCircle, Loader2, FileText, Trash2, MapPin } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

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
  latitude?: number
  longitude?: number
}

const statusConfig = {
  NOUVEAU: { label: "Nouveau", color: "bg-blue-500", icon: AlertCircle },
  EN_ATTENTE: { label: "En attente", color: "bg-yellow-500", icon: Clock },
  EN_COURS: { label: "En cours", color: "bg-orange-500", icon: Clock },
  RESOLU: { label: "Résolu", color: "bg-green-500", icon: CheckCircle2 },
}

const priorityConfig = {
  BASSE: { label: "Basse", variant: "secondary" as const },
  MOYENNE: { label: "Moyenne", variant: "default" as const },
  HAUTE: { label: "Haute", variant: "destructive" as const },
}

export default function SignalementsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [signalements, setSignalements] = useState<Signalement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("TOUS")
  const [categoryFilter, setCategoryFilter] = useState("TOUS")
  const [cityFilter, setCityFilter] = useState("TOUS")
  const [searchQuery, setSearchQuery] = useState("") // Pour le debounce
  const [isMounted, setIsMounted] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // S'assurer que le composant est monté côté client pour éviter les erreurs d'hydratation
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Debounce pour la recherche
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchQuery(search)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [search])

  // Récupérer les signalements depuis le backend
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    const fetchSignalements = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Token d'authentification manquant")
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        // Construire les paramètres de requête
        const params = new URLSearchParams()
        if (statusFilter !== "TOUS") {
          params.append("statut", statusFilter)
        }
        if (categoryFilter !== "TOUS") {
          params.append("categorie", categoryFilter)
        }
        if (searchQuery.trim()) {
          params.append("search", searchQuery.trim())
        }

        const url = `${apiUrl}/api/signalements${params.toString() ? `?${params.toString()}` : ""}`
        
        let response
        try {
          response = await fetch(url, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })
        } catch (fetchError: any) {
          console.error("❌ Erreur de connexion au backend:", fetchError)
          throw new Error(
            `Impossible de se connecter au serveur. Veuillez vérifier que le backend est démarré sur ${apiUrl}. Erreur: ${fetchError.message}`
          )
        }

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            router.push("/login")
            return
          }
          
          // Essayer de récupérer le message d'erreur du backend
          let errorMessage = `Erreur ${response.status}: ${response.statusText}`
          try {
            const contentType = response.headers.get("content-type")
            if (contentType && contentType.includes("application/json")) {
              const errorData = await response.json()
              errorMessage = errorData.message || errorData.error || errorMessage
            }
          } catch (parseError) {
            console.error("Erreur lors de l'analyse de la réponse d'erreur:", parseError)
          }
          
          throw new Error(errorMessage)
        }

        const data = await response.json()
        setSignalements(data || [])
      } catch (err: any) {
        console.error("Erreur lors de la récupération des signalements:", err)
        setError(err.message || "Une erreur est survenue lors de la récupération des signalements")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSignalements()
  }, [isAuthenticated, router, statusFilter, categoryFilter, searchQuery])

  // Fonction pour extraire la ville de l'adresse
  const extractCity = (adresse: string | null | undefined): string | null => {
    if (!adresse || !adresse.trim()) return null
    // Format attendu: "Rue, Ville, Pays" ou "Ville, Pays"
    const parts = adresse.split(",").map(p => p.trim()).filter(p => p.length > 0)
    if (parts.length >= 2) {
      // Prendre l'avant-dernière partie (la ville, avant le pays)
      return parts[parts.length - 2]
    } else if (parts.length === 1) {
      // Si une seule partie, c'est peut-être juste la ville
      return parts[0]
    }
    return null
  }

  // Extraire les villes uniques des signalements
  const availableCities = Array.from(
    new Set(
      signalements
        .map(s => extractCity(s.adresse))
        .filter((city): city is string => city !== null && city !== "")
        .sort()
    )
  )

  // Filtrer les signalements par ville
  const filteredSignalements = signalements.filter((signalement) => {
    if (cityFilter === "TOUS") return true
    const signalementCity = extractCity(signalement.adresse)
    return signalementCity === cityFilter
  })

  const handleDelete = async (signalementId: number) => {
    try {
      setDeletingId(signalementId)
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token d'authentification manquant")
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      const response = await fetch(`${apiUrl}/api/signalements/${signalementId}`, {
        method: "DELETE",
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
        
        const errorText = await response.text()
        let errorMessage = `Erreur ${response.status}: ${response.statusText}`
        try {
          if (errorText && errorText.trim().length > 0) {
            const errorData = JSON.parse(errorText)
            errorMessage = errorData.message || errorData.error || errorMessage
          }
        } catch {
          if (errorText && errorText.trim().length > 0) {
            errorMessage = errorText
          }
        }
        throw new Error(errorMessage)
      }

      // Retirer le signalement de la liste
      setSignalements((prev) => prev.filter((s) => s.id !== signalementId))
      toast.success("Signalement supprimé avec succès")
    } catch (err: any) {
      console.error("Erreur lors de la suppression du signalement:", err)
      toast.error(err.message || "Une erreur est survenue lors de la suppression")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Tous les signalements</h1>
          <p className="text-muted-foreground">Consultez et suivez l'état des problèmes signalés dans votre ville</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un signalement..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              {isMounted ? (
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TOUS">Tous les statuts</SelectItem>
                    <SelectItem value="NOUVEAU">Nouveau</SelectItem>
                    <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                    <SelectItem value="EN_COURS">En cours</SelectItem>
                    <SelectItem value="RESOLU">Résolu</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrer par statut
                </div>
              )}
              {isMounted ? (
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filtrer par catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TOUS">Toutes les catégories</SelectItem>
                    <SelectItem value="Nids de poule">Nids de poule</SelectItem>
                    <SelectItem value="Éclairage public">Éclairage public</SelectItem>
                    <SelectItem value="Déchets">Déchets</SelectItem>
                    <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrer par catégorie
                </div>
              )}
              {isMounted && availableCities.length > 0 ? (
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger>
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filtrer par ville" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TOUS">Toutes les villes</SelectItem>
                    {availableCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : isMounted ? (
                <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrer par ville
                </div>
              ) : (
                <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrer par ville
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#00648E]" />
            <span className="ml-2 text-muted-foreground">Chargement des signalements...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card className="border-destructive mb-8">
            <CardHeader>
              <CardTitle className="text-destructive">Erreur</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.reload()}>Réessayer</Button>
            </CardContent>
          </Card>
        )}

        {/* Results count */}
        {!isLoading && !error && (
          <div className="mb-4 text-sm text-muted-foreground">
            {filteredSignalements.length} signalement{filteredSignalements.length > 1 ? "s" : ""} trouvé
            {filteredSignalements.length > 1 ? "s" : ""}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredSignalements.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Aucun signalement</CardTitle>
              <CardDescription>Aucun signalement ne correspond aux critères de recherche.</CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Signalements Grid */}
        {!isLoading && !error && filteredSignalements.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSignalements.map((signalement) => {
            const statusInfo = statusConfig[signalement.statut as keyof typeof statusConfig]
            const priorityInfo = priorityConfig[signalement.priorite as keyof typeof priorityConfig]
            const StatusIcon = statusInfo.icon
            const isAdmin = user?.role === "ADMIN"

            return (
              <div key={signalement.id} className="relative">
                <Link href={`/signalements/${signalement.id}`}>
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
                        <Badge variant={priorityInfo.variant}>{priorityInfo.label}</Badge>
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
                        <span>{new Date(signalement.dateCreation).toLocaleDateString("fr-FR")}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                {isAdmin && (
                  <div className="absolute top-2 right-2 z-10">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8 shadow-lg"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer le signalement</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer le signalement "{signalement.titre}" ? 
                            Cette action est irréversible et supprimera définitivement le signalement et tous ses commentaires.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={(e) => {
                              e.preventDefault()
                              handleDelete(signalement.id)
                            }}
                            disabled={deletingId === signalement.id}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deletingId === signalement.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Suppression...
                              </>
                            ) : (
                              "Supprimer"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            )
          })}
          </div>
        )}
      </main>
    </div>
  )
}
