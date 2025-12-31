"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { Clock, CheckCircle2, AlertCircle, FileText, Loader2, Check, X, Camera, ImageIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

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
  accepteAssignation?: boolean | null
  justificationRefus?: string | null
  commentairesTechniques?: string | null
  tempsPasseMinutes?: number | null
}

export default function TechnicienDashboard() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [signalements, setSignalements] = useState<Signalement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refuseDialogOpen, setRefuseDialogOpen] = useState(false)
  const [selectedSignalementId, setSelectedSignalementId] = useState<number | null>(null)
  const [justification, setJustification] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false)
  const [selectedStatusChange, setSelectedStatusChange] = useState<{ id: number; newStatus: string } | null>(null)
  const [interventionPhotos, setInterventionPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false)
  const [commentairesTechniques, setCommentairesTechniques] = useState("")
  const [tempsPasseHours, setTempsPasseHours] = useState("")
  const [tempsPasseMinutes, setTempsPasseMinutes] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    } else if (user?.role !== "TECHNICIEN") {
      router.push("/")
      return
    }

    // Récupérer les signalements assignés depuis la base de données
    const fetchSignalements = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Token d'authentification manquant")
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        const response = await fetch(`${apiUrl}/api/signalements/mes-assignations`, {
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
        console.log(`✅ ${data?.length || 0} signalement(s) assigné(s) récupéré(s) depuis la base de données`)
      } catch (err: any) {
        console.error("Erreur lors de la récupération des signalements assignés:", err)
        setError(err.message || "Une erreur est survenue lors du chargement de vos assignations")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSignalements()
  }, [isAuthenticated, user, router])

  const handleStatusChangeClick = async (id: number, newStatus: string) => {
    // Si le nouveau statut est RESOLU, ouvrir le dialog pour permettre l'ajout de photos
    if (newStatus === "RESOLU") {
      setSelectedStatusChange({ id, newStatus })
      setInterventionPhotos([])
      setPhotoPreviews([])
      setCommentairesTechniques("")
      setTempsPasseHours("")
      setTempsPasseMinutes("")
      setStatusChangeDialogOpen(true)
    } else {
      // Pour les autres statuts, changer directement sans dialog
      await handleStatusChangeDirect(id, newStatus)
    }
  }

  const handleStatusChangeDirect = async (id: number, newStatus: string) => {
    try {
      setError(null)
      
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token d'authentification manquant")
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      const response = await fetch(`${apiUrl}/api/signalements/${id}/statut?statut=${newStatus}`, {
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
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      const updatedSignalement = await response.json()
      
      // Mettre à jour la liste locale
      setSignalements((prev) =>
        prev.map((s) => (s.id === id ? { ...s, statut: newStatus as Signalement["statut"] } : s))
      )
      
      toast.success("Statut mis à jour avec succès")
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du statut:", err)
      toast.error(err.message || "Une erreur est survenue lors de la mise à jour du statut")
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Limiter à 5 photos maximum
    const remainingSlots = 5 - interventionPhotos.length
    const filesToAdd = files.slice(0, remainingSlots)

    filesToAdd.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`L'image ${file.name} est trop grande (max 10MB)`)
        return
      }
      if (!file.type.startsWith("image/")) {
        toast.error(`Le fichier ${file.name} doit être une image`)
        return
      }

      setInterventionPhotos((prev) => [...prev, file])
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index: number) => {
    setInterventionPhotos((prev) => prev.filter((_, i) => i !== index))
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleStatusChange = async () => {
    if (!selectedStatusChange) return

    try {
      setIsUploadingPhotos(true)
      setError(null)
      
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token d'authentification manquant")
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

      // Validation des champs obligatoires
      if (!commentairesTechniques.trim()) {
        toast.error("Veuillez remplir les commentaires techniques")
        setIsUploadingPhotos(false)
        return
      }

      if (!tempsPasseHours.trim() && !tempsPasseMinutes.trim()) {
        toast.error("Veuillez indiquer le temps passé pour résoudre le problème")
        setIsUploadingPhotos(false)
        return
      }

      // Calculer le temps total en minutes
      const hours = parseInt(tempsPasseHours) || 0
      const minutes = parseInt(tempsPasseMinutes) || 0
      const totalMinutes = hours * 60 + minutes

      if (totalMinutes <= 0) {
        toast.error("Le temps passé doit être supérieur à 0")
        setIsUploadingPhotos(false)
        return
      }
      
      // 1. Mettre à jour le statut avec les commentaires techniques et le temps passé
      const statusResponse = await fetch(`${apiUrl}/api/signalements/${selectedStatusChange.id}/statut?statut=${selectedStatusChange.newStatus}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentairesTechniques: commentairesTechniques.trim(),
          tempsPasseMinutes: totalMinutes,
        }),
      })

      if (!statusResponse.ok) {
        if (statusResponse.status === 401 || statusResponse.status === 403) {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          router.push("/login")
          return
        }
        throw new Error(`Erreur ${statusResponse.status}: ${statusResponse.statusText}`)
      }

      const updatedSignalement = await statusResponse.json()
      
      // 2. Ajouter les photos d'intervention (obligatoires pour RESOLU)
      if (selectedStatusChange.newStatus === "RESOLU") {
        if (interventionPhotos.length === 0) {
          toast.error("Veuillez ajouter au moins une photo d'intervention pour marquer le signalement comme résolu")
          setIsUploadingPhotos(false)
          return
        }
        for (let i = 0; i < interventionPhotos.length; i++) {
          const photoFile = interventionPhotos[i]
          const photoPreview = photoPreviews[i]
          
          try {
            // Convertir le fichier en base64 si ce n'est pas déjà fait
            let photoBase64 = photoPreview
            if (!photoPreview.startsWith("data:")) {
              const reader = new FileReader()
              photoBase64 = await new Promise<string>((resolve, reject) => {
                reader.onloadend = () => resolve(reader.result as string)
                reader.onerror = reject
                reader.readAsDataURL(photoFile)
              })
            }
            
            const photoResponse = await fetch(`${apiUrl}/api/signalements/${selectedStatusChange.id}/photos-intervention`, {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                photoUrl: photoBase64,
              }),
            })

            if (!photoResponse.ok) {
              const errorText = await photoResponse.text()
              console.error("Erreur lors de l'ajout d'une photo:", errorText)
              
              let errorMessage = `Erreur lors de l'ajout de la photo ${i + 1}`
              try {
                const errorData = JSON.parse(errorText)
                errorMessage = errorData.message || errorData.error || errorMessage
              } catch {
                if (errorText && errorText.trim().length > 0) {
                  errorMessage = errorText
                }
              }
              
              toast.error(errorMessage)
              throw new Error(errorMessage)
            }
          } catch (photoError: any) {
            console.error("Erreur lors de l'ajout d'une photo:", photoError)
            toast.error(`Erreur lors de l'ajout de la photo ${i + 1}: ${photoError.message}`)
          }
        }
      }
      
      // 3. Mettre à jour la liste locale
      setSignalements((prev) =>
        prev.map((s) => (s.id === selectedStatusChange.id ? { ...s, statut: selectedStatusChange.newStatus as Signalement["statut"] } : s))
      )
      
      // 4. Fermer le dialog et réinitialiser
      setStatusChangeDialogOpen(false)
      setSelectedStatusChange(null)
      setInterventionPhotos([])
      setPhotoPreviews([])
      setCommentairesTechniques("")
      setTempsPasseHours("")
      setTempsPasseMinutes("")
      
      toast.success(`Statut mis à jour avec succès${interventionPhotos.length > 0 ? ` et ${interventionPhotos.length} photo(s) ajoutée(s)` : ""}`)
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du statut:", err)
      toast.error(err.message || "Une erreur est survenue lors de la mise à jour du statut")
    } finally {
      setIsUploadingPhotos(false)
    }
  }

  const handleAccept = async (id: number) => {
    try {
      setIsProcessing(true)
      setError(null)

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token d'authentification manquant")
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      const response = await fetch(`${apiUrl}/api/signalements/${id}/accepter`, {
        method: "POST",
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

      const updatedSignalement = await response.json()
      
      // Mettre à jour la liste locale
      setSignalements((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, accepteAssignation: true, justificationRefus: null, statut: updatedSignalement.statut }
            : s
        )
      )
      
      toast.success("Mission acceptée avec succès")
    } catch (err: any) {
      console.error("Erreur lors de l'acceptation de la mission:", err)
      toast.error(err.message || "Une erreur est survenue lors de l'acceptation")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRefuse = async () => {
    if (!selectedSignalementId) return
    
    if (!justification.trim()) {
      toast.error("Veuillez fournir une justification pour le refus")
      return
    }

    try {
      setIsProcessing(true)
      setError(null)

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token d'authentification manquant")
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      const response = await fetch(`${apiUrl}/api/signalements/${selectedSignalementId}/refuser`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          justification: justification.trim(),
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

      const updatedSignalement = await response.json()
      
      // Mettre à jour la liste locale
      setSignalements((prev) =>
        prev.map((s) =>
          s.id === selectedSignalementId
            ? { ...s, accepteAssignation: false, justificationRefus: justification.trim() }
            : s
        )
      )
      
      toast.success("Mission refusée avec succès")
      setRefuseDialogOpen(false)
      setJustification("")
      setSelectedSignalementId(null)
    } catch (err: any) {
      console.error("Erreur lors du refus de la mission:", err)
      toast.error(err.message || "Une erreur est survenue lors du refus")
    } finally {
      setIsProcessing(false)
    }
  }

  const openRefuseDialog = (id: number) => {
    setSelectedSignalementId(id)
    setJustification("")
    setRefuseDialogOpen(true)
  }

  if (!isAuthenticated || user?.role !== "TECHNICIEN") {
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
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Mes assignations</h1>
          <p className="text-muted-foreground">Gérez les signalements qui vous sont assignés</p>
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
                    <CardDescription className="text-sm font-medium">Total assigné</CardDescription>
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
            <span className="ml-2 text-muted-foreground">Chargement de vos assignations...</span>
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
              <CardTitle>Aucune assignation</CardTitle>
              <CardDescription>
                Vous n'avez actuellement aucun signalement assigné. Les administrateurs peuvent vous assigner des signalements depuis la page de détails.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Signalements List */}
        {!isLoading && !error && signalements.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {signalements.map((signalement) => {
              const statusInfo = statusConfig[signalement.statut as keyof typeof statusConfig]
              const StatusIcon = statusInfo.icon

              return (
                <Card key={signalement.id} className="h-full flex flex-col transition-all hover:shadow-lg">
                  <Link href={`/signalements/${signalement.id}`}>
                    <img
                      src={signalement.photoUrl || "/placeholder.svg"}
                      alt={signalement.titre}
                      className="h-48 w-full rounded-t-lg object-cover"
                    />
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
                    <CardContent className="pt-0 pb-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{signalement.categorie}</span>
                        <span>{formatDate(signalement.dateCreation)}</span>
                      </div>
                    </CardContent>
                  </Link>
                  <CardContent className="border-t pt-4 space-y-4">
                    {/* Boutons d'acceptation/refus pour les missions en attente */}
                    {signalement.accepteAssignation === null && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                          Mission en attente de votre réponse
                        </p>
                        <div className="flex gap-2">
                          <Button
                            onClick={(e) => {
                              e.preventDefault()
                              handleAccept(signalement.id)
                            }}
                            disabled={isProcessing}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Accepter
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.preventDefault()
                              openRefuseDialog(signalement.id)
                            }}
                            disabled={isProcessing}
                            variant="destructive"
                            className="flex-1"
                            size="sm"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Refuser
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Message si refusé */}
                    {signalement.accepteAssignation === false && (
                      <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 p-3">
                        <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                          Mission refusée
                        </p>
                        {signalement.justificationRefus && (
                          <p className="text-xs text-red-700 dark:text-red-300">
                            {signalement.justificationRefus}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {/* Changer le statut (seulement si accepté) */}
                    {signalement.accepteAssignation === true && (
                      <div>
                        <label className="mb-2 block text-sm font-medium">Changer le statut</label>
                        <Select
                          value={signalement.statut}
                          onValueChange={(value) => handleStatusChangeClick(signalement.id, value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NOUVEAU">Nouveau</SelectItem>
                            <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                            <SelectItem value="EN_COURS">En cours</SelectItem>
                            <SelectItem value="RESOLU">Résolu</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
        
        {/* Dialog pour le refus avec justification */}
        <Dialog open={refuseDialogOpen} onOpenChange={setRefuseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Refuser la mission</DialogTitle>
              <DialogDescription>
                Veuillez fournir une justification pour le refus de cette mission. Cette information sera visible par l'administrateur.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="justification">Justification du refus *</Label>
                <Textarea
                  id="justification"
                  placeholder="Expliquez pourquoi vous refusez cette mission..."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  rows={4}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  La justification est obligatoire pour refuser une mission.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setRefuseDialogOpen(false)
                  setJustification("")
                  setSelectedSignalementId(null)
                }}
                disabled={isProcessing}
              >
                Annuler
              </Button>
              <Button
                onClick={handleRefuse}
                disabled={isProcessing || !justification.trim()}
                variant="destructive"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Refuser la mission
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog pour le changement de statut à RESOLU avec photos */}
        <Dialog open={statusChangeDialogOpen} onOpenChange={setStatusChangeDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Marquer comme résolu</DialogTitle>
              <DialogDescription>
                Marquez ce signalement comme résolu et ajoutez des photos d'intervention pour documenter les travaux effectués.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/30 p-3 mb-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Important :</strong> Remplissez tous les champs et ajoutez des photos pour documenter les travaux effectués.
                </p>
              </div>

              {/* Commentaires techniques */}
              <div className="space-y-2">
                <Label htmlFor="commentaires-techniques-dashboard">Commentaires techniques *</Label>
                <Textarea
                  id="commentaires-techniques-dashboard"
                  placeholder="Décrivez les travaux effectués, les solutions appliquées, les matériaux utilisés, etc."
                  value={commentairesTechniques}
                  onChange={(e) => setCommentairesTechniques(e.target.value)}
                  rows={4}
                  disabled={isUploadingPhotos}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Détails techniques de l'intervention réalisée
                </p>
              </div>

              {/* Temps passé */}
              <div className="space-y-2">
                <Label htmlFor="temps-passe-dashboard">Temps passé pour résoudre le problème *</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="temps-heures-dashboard" className="text-xs text-muted-foreground">Heures</Label>
                    <Input
                      id="temps-heures-dashboard"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={tempsPasseHours}
                      onChange={(e) => setTempsPasseHours(e.target.value)}
                      disabled={isUploadingPhotos}
                    />
                  </div>
                  <div>
                    <Label htmlFor="temps-minutes-dashboard" className="text-xs text-muted-foreground">Minutes</Label>
                    <Input
                      id="temps-minutes-dashboard"
                      type="number"
                      min="0"
                      max="59"
                      placeholder="0"
                      value={tempsPasseMinutes}
                      onChange={(e) => setTempsPasseMinutes(e.target.value)}
                      disabled={isUploadingPhotos}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Temps total passé pour résoudre ce problème
                </p>
              </div>

              {/* Photos d'intervention */}
              <div className="space-y-2">
                <Label htmlFor="photos-intervention">Photos d'intervention *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="photos-intervention"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoChange}
                    disabled={isUploadingPhotos || interventionPhotos.length >= 5}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const input = document.getElementById("photos-intervention") as HTMLInputElement
                      input?.click()
                    }}
                    disabled={isUploadingPhotos || interventionPhotos.length >= 5}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Vous devez ajouter au moins une photo pour marquer le signalement comme résolu. Maximum 5 photos, 10MB par photo.
                </p>
              </div>

              {/* Aperçu des photos */}
              {photoPreviews.length > 0 && (
                <div className="space-y-2">
                  <Label>Photos sélectionnées ({photoPreviews.length}/5)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {photoPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                          onClick={() => removePhoto(index)}
                          disabled={isUploadingPhotos}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setStatusChangeDialogOpen(false)
                  setSelectedStatusChange(null)
                  setInterventionPhotos([])
                  setPhotoPreviews([])
                  setCommentairesTechniques("")
                  setTempsPasseHours("")
                  setTempsPasseMinutes("")
                }}
                disabled={isUploadingPhotos}
              >
                Annuler
              </Button>
              <Button
                onClick={handleStatusChange}
                disabled={isUploadingPhotos || interventionPhotos.length === 0 || !commentairesTechniques.trim() || (!tempsPasseHours.trim() && !tempsPasseMinutes.trim())}
              >
                {isUploadingPhotos ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Marquer comme résolu
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
