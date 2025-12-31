"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Calendar, User, AlertCircle, Clock, CheckCircle2, MessageSquare, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, use, useMemo } from "react"
import dynamic from "next/dynamic"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

// Dynamic import for Leaflet map
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })

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

interface SignalementUser {
  id: number
  nom: string
  prenom: string
  email: string
  role: string
}

interface Signalement {
  id: number
  titre: string
  description: string
  categorie: string
  statut: "NOUVEAU" | "EN_ATTENTE" | "EN_COURS" | "RESOLU"
  priorite: "BASSE" | "MOYENNE" | "HAUTE"
  dateCreation: string
  latitude: number
  longitude: number
  photoUrl?: string | null
  adresse?: string | null
  user: SignalementUser
  technicien?: SignalementUser | null
}

interface Technicien {
  id: number
  nom: string
  prenom: string
  email: string
}

interface Commentaire {
  id: number
  contenu: string
  dateCreation: string
  auteur: SignalementUser
}

export default function SignalementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user: currentUser, isAuthenticated } = useAuth()
  const router = useRouter()
  const [signalement, setSignalement] = useState<Signalement | null>(null)
  const [techniciens, setTechniciens] = useState<Technicien[]>([])
  const [selectedTechnicienId, setSelectedTechnicienId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isAssigning, setIsAssigning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState("")
  const [isMapReady, setIsMapReady] = useState(false)
  const [commentaires, setCommentaires] = useState<Commentaire[]>([])
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  // Icône personnalisée de pin rouge pour le marqueur
  const customIcon = useMemo(() => {
    if (typeof window === "undefined") return null
    const L = require("leaflet")
    
    // Créer une icône SVG de pin rouge
    const svgIcon = `
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C10.477 0 6 4.477 6 10C6 17 16 30 16 30C16 30 26 17 26 10C26 4.477 21.523 0 16 0Z" fill="#DC2626"/>
        <circle cx="16" cy="10" r="6" fill="white"/>
      </svg>
    `
    
    return L.icon({
      iconUrl: "data:image/svg+xml;base64," + btoa(svgIcon),
      iconSize: [32, 40],
      iconAnchor: [16, 40],
      popupAnchor: [0, -40],
    })
  }, [])

  useEffect(() => {
    setIsMapReady(true)
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Token d'authentification manquant")
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

        // Récupérer le signalement
        let signalementResponse
        try {
          signalementResponse = await fetch(`${apiUrl}/api/signalements/${id}`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })
        } catch (fetchError: any) {
          console.error("❌ Erreur de connexion au backend:", fetchError)
          throw new Error(
            `Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur ${apiUrl}. Erreur: ${fetchError.message}`
          )
        }

        if (!signalementResponse.ok) {
          if (signalementResponse.status === 401 || signalementResponse.status === 403) {
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            router.push("/login")
            return
          }
          throw new Error(`Erreur ${signalementResponse.status}: ${signalementResponse.statusText}`)
        }

        const signalementData = await signalementResponse.json()
        setSignalement(signalementData)
        if (signalementData.technicien) {
          setSelectedTechnicienId(signalementData.technicien.id.toString())
        }

        // Récupérer les commentaires du signalement
        try {
          const commentairesResponse = await fetch(`${apiUrl}/api/signalements/${id}/commentaires`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          if (commentairesResponse.ok) {
            const commentairesData = await commentairesResponse.json()
            setCommentaires(commentairesData || [])
            console.log(`✅ ${commentairesData?.length || 0} commentaire(s) récupéré(s)`)
          }
        } catch (commentError: any) {
          console.error("❌ Erreur lors de la récupération des commentaires:", commentError)
          // Ne pas bloquer l'affichage de la page si la récupération des commentaires échoue
        }

        // Si l'utilisateur est admin, récupérer la liste des techniciens depuis la base de données
        if (currentUser?.role === "ADMIN") {
          try {
            const techniciensResponse = await fetch(`${apiUrl}/api/users/techniciens`, {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            })

            if (!techniciensResponse.ok) {
              if (techniciensResponse.status === 401 || techniciensResponse.status === 403) {
                localStorage.removeItem("token")
                localStorage.removeItem("user")
                router.push("/login")
                return
              }
              console.error(`❌ Erreur lors de la récupération des techniciens: ${techniciensResponse.status}`)
            } else {
              const techniciensData = await techniciensResponse.json()
              setTechniciens(techniciensData || [])
              console.log(`✅ ${techniciensData?.length || 0} technicien(s) récupéré(s) depuis la base de données PostgreSQL`)
              if (techniciensData && techniciensData.length > 0) {
                console.log("📋 Liste des techniciens:", techniciensData.map((t: Technicien) => `${t.prenom} ${t.nom} (${t.email})`))
              }
            }
          } catch (techError: any) {
            console.error("❌ Erreur lors de la récupération des techniciens:", techError)
            // Ne pas bloquer l'affichage de la page si la récupération des techniciens échoue
          }
        }
      } catch (err: any) {
        console.error("Erreur lors de la récupération des données:", err)
        setError(err.message || "Une erreur est survenue lors du chargement des données")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id, isAuthenticated, currentUser, router])

  const handleAssignTechnicien = async () => {
    if (!selectedTechnicienId) {
      setError("Veuillez sélectionner un technicien")
      return
    }

    try {
      setIsAssigning(true)
      setError(null)

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token d'authentification manquant")
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      const response = await fetch(`${apiUrl}/api/signalements/${id}/assigner?technicienId=${selectedTechnicienId}`, {
        method: "PATCH",
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
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const updatedSignalement = await response.json()
      setSignalement(updatedSignalement)
      
      // Afficher un message de succès (vous pouvez ajouter une notification toast ici)
      alert("Technicien assigné avec succès!")
    } catch (err: any) {
      console.error("Erreur lors de l'assignation du technicien:", err)
      setError(err.message || "Une erreur est survenue lors de l'assignation du technicien")
    } finally {
      setIsAssigning(false)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim()) {
      setError("Le commentaire ne peut pas être vide")
      return
    }

    try {
      setIsSubmittingComment(true)
      setError(null)

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token d'authentification manquant")
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      const response = await fetch(`${apiUrl}/api/signalements/${id}/commentaires`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contenu: newComment.trim(),
        }),
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
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const createdCommentaire = await response.json()
      
      // Ajouter le nouveau commentaire à la liste
      setCommentaires((prev) => [...prev, createdCommentaire])
      setNewComment("")
      
      console.log("✅ Commentaire publié avec succès")
    } catch (err: any) {
      console.error("Erreur lors de la publication du commentaire:", err)
      setError(err.message || "Une erreur est survenue lors de la publication du commentaire")
    } finally {
      setIsSubmittingComment(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error && !signalement) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
            <Button onClick={() => router.push("/signalements")} className="mt-4">
              Retour aux signalements
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!signalement) {
    return null
  }

  const statusInfo = statusConfig[signalement.statut]
  const priorityInfo = priorityConfig[signalement.priorite]
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/signalements" className="text-sm text-muted-foreground hover:text-foreground">
            ← Retour aux signalements
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                  <div className="flex gap-2">
                    <Badge variant={priorityInfo.variant}>{priorityInfo.label}</Badge>
                    <div
                      className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs text-white ${statusInfo.color}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {statusInfo.label}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">#{signalement.id}</span>
                </div>
                <CardTitle className="text-2xl">{signalement.titre}</CardTitle>
                <CardDescription className="flex items-center gap-4 pt-2">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {signalement.user.prenom} {signalement.user.nom}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(signalement.dateCreation).toLocaleDateString("fr-FR")}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {signalement.photoUrl && (
                  <div className="flex justify-center">
                    <div className="max-w-2xl w-full border border-border rounded-lg overflow-hidden bg-muted/50 p-4">
                      <img
                        src={signalement.photoUrl}
                        alt={signalement.titre}
                        className="w-full h-auto rounded-md object-contain max-h-[500px] mx-auto"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="mb-2 font-semibold">Description</h3>
                  <p className="text-muted-foreground">{signalement.description}</p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Catégorie</h3>
                  <Badge variant="outline">{signalement.categorie}</Badge>
                </div>
                {signalement.technicien && (
                  <div>
                    <h3 className="mb-2 font-semibold">Technicien assigné</h3>
                    <p className="text-muted-foreground">
                      {signalement.technicien.prenom} {signalement.technicien.nom}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Commentaires ({commentaires.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Liste des commentaires */}
                {commentaires.length > 0 && (
                  <div className="space-y-4">
                    {commentaires.map((commentaire) => (
                      <div key={commentaire.id} className="flex gap-4 border-b border-border pb-4 last:border-0">
                        <Avatar>
                          <AvatarFallback>
                            {commentaire.auteur.prenom[0]}
                            {commentaire.auteur.nom[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="font-semibold">
                              {commentaire.auteur.prenom} {commentaire.auteur.nom}
                            </span>
                            <Badge
                              variant={commentaire.auteur.role === "TECHNICIEN" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {commentaire.auteur.role === "TECHNICIEN" ? "Technicien" : commentaire.auteur.role === "ADMIN" ? "Admin" : "Citoyen"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(commentaire.dateCreation).toLocaleDateString("fr-FR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{commentaire.contenu}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Formulaire d'ajout de commentaire */}
                <form onSubmit={handleCommentSubmit} className="space-y-4 border-t border-border pt-6">
                  <Textarea
                    placeholder="Ajouter un commentaire..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    disabled={isSubmittingComment}
                  />
                  <Button type="submit" disabled={isSubmittingComment || !newComment.trim()}>
                    {isSubmittingComment ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publication...
                      </>
                    ) : (
                      "Publier le commentaire"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Localisation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 w-full overflow-hidden rounded-lg">
                  {isMapReady && (
                    <MapContainer
                      center={[signalement.latitude, signalement.longitude]}
                      zoom={15}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      />
                      <Marker 
                        position={[signalement.latitude, signalement.longitude]}
                        icon={customIcon || undefined}
                      >
                        <Popup>
                          <div className="p-2">
                            <p className="font-semibold text-sm">{signalement.titre}</p>
                            {signalement.adresse && (
                              <p className="text-xs text-muted-foreground mt-1">{signalement.adresse}</p>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  )}
                </div>
                <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {signalement.latitude.toFixed(4)}, {signalement.longitude.toFixed(4)}
                  </span>
                </div>
                {signalement.adresse && (
                  <div className="mt-2 text-sm text-muted-foreground">{signalement.adresse}</div>
                )}
              </CardContent>
            </Card>

            {currentUser?.role === "ADMIN" && (
              <Card>
                <CardHeader>
                  <CardTitle>Assigner un technicien</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Technicien</label>
                    {techniciens.length === 0 ? (
                      <div className="rounded-md border border-dashed border-muted-foreground/25 p-4 text-center text-sm text-muted-foreground">
                        Aucun technicien trouvé dans la base de données
                      </div>
                    ) : (
                      <Select value={selectedTechnicienId} onValueChange={setSelectedTechnicienId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un technicien" />
                        </SelectTrigger>
                        <SelectContent>
                          {techniciens.map((tech) => (
                            <SelectItem key={tech.id} value={tech.id.toString()}>
                              {tech.prenom} {tech.nom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <Button 
                    onClick={handleAssignTechnicien} 
                    disabled={isAssigning || !selectedTechnicienId || techniciens.length === 0}
                    className="w-full"
                  >
                    {isAssigning ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Assignation en cours...
                      </>
                    ) : (
                      "Assigner le technicien"
                    )}
                  </Button>
                  {techniciens.length > 0 && (
                    <p className="text-xs text-muted-foreground text-center">
                      {techniciens.length} technicien(s) disponible(s)
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
