"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { MapPin, Calendar, User, AlertCircle, Clock, CheckCircle2, MessageSquare, Loader2, Camera, Upload, X, Trash2, Settings, Edit } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, use, useMemo } from "react"
import dynamic from "next/dynamic"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

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

interface PhotoIntervention {
  id: number
  photoUrl: string
  dateAjout: string
  technicien: SignalementUser
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
  commentairesTechniques?: string | null
  tempsPasseMinutes?: number | null
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
  const [isChangingPhoto, setIsChangingPhoto] = useState(false)
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [newPhotoPreview, setNewPhotoPreview] = useState<string | null>(null)
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [photosIntervention, setPhotosIntervention] = useState<PhotoIntervention[]>([])
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false)
  const [selectedNewStatus, setSelectedNewStatus] = useState<string>("")
  const [interventionPhotos, setInterventionPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const [commentairesTechniques, setCommentairesTechniques] = useState("")
  const [tempsPasseHours, setTempsPasseHours] = useState("")
  const [tempsPasseMinutes, setTempsPasseMinutes] = useState("")
  const [isAccepting, setIsAccepting] = useState(false)
  const [isRefusing, setIsRefusing] = useState(false)

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
    // Vérifier d'abord le localStorage avant de rediriger
    const token = localStorage.getItem("token")
    const savedUser = localStorage.getItem("user")
    
    // Si pas de token ou user dans localStorage, rediriger immédiatement
    if (!token || !savedUser) {
      router.push("/login")
      return
    }
    
    // Si isAuthenticated est false mais qu'on a un token, attendre un peu
    // pour que l'auth context se charge depuis localStorage
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        const stillNoAuth = !localStorage.getItem("token")
        if (stillNoAuth) {
          router.push("/login")
        }
      }, 1000)
      return () => clearTimeout(timer)
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
        console.log("📋 Signalement récupéré:", {
          id: signalementData.id,
          statut: signalementData.statut,
          commentairesTechniques: signalementData.commentairesTechniques,
          tempsPasseMinutes: signalementData.tempsPasseMinutes,
        })
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

        // Récupérer les photos d'intervention
        try {
          const photosResponse = await fetch(`${apiUrl}/api/signalements/${id}/photos-intervention`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          if (photosResponse.ok) {
            const photosData = await photosResponse.json()
            setPhotosIntervention(photosData || [])
            console.log(`✅ ${photosData?.length || 0} photo(s) d'intervention récupérée(s)`)
          }
        } catch (photosError: any) {
          console.error("❌ Erreur lors de la récupération des photos d'intervention:", photosError)
          // Ne pas bloquer l'affichage de la page si la récupération des photos échoue
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("L'image est trop grande (max 10MB)")
        return
      }
      if (!file.type.startsWith("image/")) {
        setError("Le fichier doit être une image")
        return
      }
      setNewPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoUpload = async () => {
    if (!newPhotoFile || !newPhotoPreview) {
      setError("Veuillez sélectionner une image")
      return
    }

    try {
      setIsChangingPhoto(true)
      setError(null)

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token d'authentification manquant")
      }

      // Pour l'instant, on utilise la preview en base64
      // Dans un vrai projet, vous devriez uploader l'image vers un service de stockage
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      
      let response
      try {
        response = await fetch(`${apiUrl}/api/signalements/${id}/photo`, {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            photoUrl: newPhotoPreview,
          }),
        })
      } catch (fetchError: any) {
        console.error("Erreur de connexion au backend:", fetchError)
        throw new Error(
          `Impossible de se connecter au serveur. Veuillez vérifier que le backend est démarré sur ${apiUrl}. ` +
          `Si vous venez d'ajouter cet endpoint, veuillez redémarrer le backend.`
        )
      }

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          router.push("/login")
          return
        }

        if (response.status === 404) {
          throw new Error(
            "L'endpoint de mise à jour de photo n'est pas disponible. " +
            "Veuillez redémarrer le backend pour activer cette fonctionnalité."
          )
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
      setSignalement(updatedSignalement)
      setShowPhotoUpload(false)
      setNewPhotoPreview(null)
      setNewPhotoFile(null)
      
      toast.success("Photo mise à jour avec succès!")
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour de la photo:", err)
      setError(err.message || "Une erreur est survenue lors de la mise à jour de la photo")
    } finally {
      setIsChangingPhoto(false)
    }
  }

  // Vérifier si l'utilisateur peut modifier la photo
  const canEditPhoto = signalement && currentUser && (
    signalement.user.id === currentUser.id || 
    currentUser.role === "ADMIN"
  )

  // Vérifier si l'utilisateur peut changer le statut (seulement les techniciens assignés)
  const canChangeStatus = currentUser && (
    currentUser.role === "TECHNICIEN" && signalement?.technicien?.id === currentUser.id && signalement?.accepteAssignation === true
  )

  const handleStatusChangeClick = (newStatus: string) => {
    setSelectedNewStatus(newStatus)
    setInterventionPhotos([])
    setPhotoPreviews([])
    setStatusChangeDialogOpen(true)
  }

  const handleStatusChangeDirect = async (newStatus: string) => {
    if (!signalement) return

    try {
      setIsChangingStatus(true)
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
      setSignalement(updatedSignalement)
      toast.success("Statut mis à jour avec succès")
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du statut:", err)
      toast.error(err.message || "Une erreur est survenue lors de la mise à jour du statut")
    } finally {
      setIsChangingStatus(false)
    }
  }

  const handleInterventionPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

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

  const removeInterventionPhoto = (index: number) => {
    setInterventionPhotos((prev) => prev.filter((_, i) => i !== index))
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleStatusChangeWithPhotos = async () => {
    if (!signalement || !selectedNewStatus) return

    try {
      setIsChangingStatus(true)
      setError(null)

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token d'authentification manquant")
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

      // Validation des champs obligatoires
      if (!commentairesTechniques.trim()) {
        toast.error("Veuillez remplir les commentaires techniques")
        setIsChangingStatus(false)
        return
      }

      if (!tempsPasseHours.trim() && !tempsPasseMinutes.trim()) {
        toast.error("Veuillez indiquer le temps passé pour résoudre le problème")
        setIsChangingStatus(false)
        return
      }

      // Calculer le temps total en minutes
      const hours = parseInt(tempsPasseHours) || 0
      const minutes = parseInt(tempsPasseMinutes) || 0
      const totalMinutes = hours * 60 + minutes

      if (totalMinutes <= 0) {
        toast.error("Le temps passé doit être supérieur à 0")
        setIsChangingStatus(false)
        return
      }

      // 1. Mettre à jour le statut avec les commentaires techniques et le temps passé
      const statusResponse = await fetch(`${apiUrl}/api/signalements/${id}/statut?statut=${selectedNewStatus}`, {
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
      setSignalement(updatedSignalement)

      // 2. Ajouter les photos d'intervention si présentes
      if (selectedNewStatus === "RESOLU" && interventionPhotos.length > 0) {
        for (let i = 0; i < interventionPhotos.length; i++) {
          const photoFile = interventionPhotos[i]
          const photoPreview = photoPreviews[i]

          try {
            let photoBase64 = photoPreview
            if (!photoPreview.startsWith("data:")) {
              const reader = new FileReader()
              photoBase64 = await new Promise<string>((resolve, reject) => {
                reader.onloadend = () => resolve(reader.result as string)
                reader.onerror = reject
                reader.readAsDataURL(photoFile)
              })
            }

            const photoResponse = await fetch(`${apiUrl}/api/signalements/${id}/photos-intervention`, {
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
              toast.error(`Erreur lors de l'ajout de la photo ${i + 1}`)
            }
          } catch (photoError: any) {
            console.error("Erreur lors de l'ajout d'une photo:", photoError)
            toast.error(`Erreur lors de l'ajout de la photo ${i + 1}: ${photoError.message}`)
          }
        }
      }

      // 3. Recharger les photos d'intervention
      try {
        const photosResponse = await fetch(`${apiUrl}/api/signalements/${id}/photos-intervention`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        if (photosResponse.ok) {
          const photosData = await photosResponse.json()
          setPhotosIntervention(photosData || [])
        }
      } catch (photosError) {
        console.error("Erreur lors de la récupération des photos:", photosError)
      }

      // 4. Fermer le dialog et réinitialiser
      setStatusChangeDialogOpen(false)
      setSelectedNewStatus("")
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
      setIsChangingStatus(false)
    }
  }

  const handleAcceptSignalement = async () => {
    if (!signalement) return

    try {
      setIsAccepting(true)
      setError(null)

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token d'authentification manquant")
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      const response = await fetch(`${apiUrl}/api/signalements/${id}/admin/accepter`, {
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
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const updatedSignalement = await response.json()
      setSignalement(updatedSignalement)
      toast.success("Signalement accepté avec succès")
    } catch (err: any) {
      console.error("Erreur lors de l'acceptation du signalement:", err)
      toast.error(err.message || "Une erreur est survenue lors de l'acceptation du signalement")
    } finally {
      setIsAccepting(false)
    }
  }

  const handleRefuseSignalement = async () => {
    if (!signalement) return

    try {
      setIsRefusing(true)
      setError(null)

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token d'authentification manquant")
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      const response = await fetch(`${apiUrl}/api/signalements/${id}/admin/refuser`, {
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
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      toast.success("Signalement refusé et supprimé")
      router.push("/signalements")
    } catch (err: any) {
      console.error("Erreur lors du refus du signalement:", err)
      toast.error(err.message || "Une erreur est survenue lors du refus du signalement")
      setIsRefusing(false)
    }
  }

  const handleDelete = async () => {
    if (!signalement) return

    try {
      setIsDeleting(true)
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token d'authentification manquant")
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      const response = await fetch(`${apiUrl}/api/signalements/${id}`, {
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

      toast.success("Signalement supprimé avec succès")
      // Rediriger selon le rôle de l'utilisateur
      if (currentUser?.role === "CITOYEN") {
        router.push("/mes-signalements")
      } else {
        router.push("/signalements")
      }
    } catch (err: any) {
      console.error("Erreur lors de la suppression du signalement:", err)
      toast.error(err.message || "Une erreur est survenue lors de la suppression")
    } finally {
      setIsDeleting(false)
    }
  }

  // Vérifier le localStorage uniquement côté client
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  if (!isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }
  
  if (!isAuthenticated) {
    // Attendre que l'auth context se charge
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
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
            <Button 
              onClick={() => {
                if (currentUser?.role === "CITOYEN") {
                  router.push("/mes-signalements")
                } else {
                  router.push("/signalements")
                }
              }} 
              className="mt-4"
            >
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
        <div className="mb-6 flex items-center justify-between">
          <Link 
            href={currentUser?.role === "CITOYEN" ? "/mes-signalements" : "/signalements"} 
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Retour aux signalements
          </Link>
          {((currentUser?.role === "ADMIN") || 
            (currentUser?.role === "CITOYEN" && signalement.user.id === currentUser.id && signalement.statut !== "RESOLU")) && (
            <div className="flex gap-2">
              {currentUser?.role === "CITOYEN" && signalement.user.id === currentUser.id && signalement.statut !== "RESOLU" && (
                <Link href={`/signalements/${id}/modifier`}>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                </Link>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
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
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? (
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

        {error && (
          <div className="mb-4 rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card>
              <CardHeader>
                <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
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
                <CardTitle className="text-2xl mb-2 leading-tight">{signalement.titre}</CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-4 mt-1">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {signalement.user.prenom} {signalement.user.nom}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(signalement.dateCreation).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Photo principale */}
            <Card className="mt-16">
              <CardHeader>
                <CardTitle className="text-lg">Photo du signalement</CardTitle>
              </CardHeader>
              <CardContent>
                {signalement.photoUrl ? (
                  <div className="relative group">
                    <div className="w-full border border-border rounded-lg overflow-hidden bg-muted/50">
                      <img
                        src={signalement.photoUrl}
                        alt={signalement.titre}
                        className="w-full h-auto max-h-[500px] object-contain mx-auto"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg"
                          target.onerror = null
                        }}
                      />
                    </div>
                    {canEditPhoto && (
                      <Dialog open={showPhotoUpload} onOpenChange={setShowPhotoUpload}>
                        <DialogTrigger asChild>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="mt-3 w-full sm:w-auto"
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Changer la photo
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Changer la photo du signalement</DialogTitle>
                            <DialogDescription>
                              Sélectionnez une nouvelle photo pour ce signalement
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="photo">Nouvelle photo</Label>
                              <Input
                                id="photo"
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="cursor-pointer"
                              />
                              <p className="text-xs text-muted-foreground">
                                PNG, JPG jusqu'à 10MB
                              </p>
                            </div>
                            {newPhotoPreview && (
                              <div className="space-y-2">
                                <Label>Aperçu</Label>
                                <div className="border rounded-lg overflow-hidden">
                                  <img
                                    src={newPhotoPreview}
                                    alt="Aperçu"
                                    className="w-full h-64 object-contain"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowPhotoUpload(false)
                                setNewPhotoPreview(null)
                                setNewPhotoFile(null)
                              }}
                            >
                              Annuler
                            </Button>
                            <Button
                              onClick={handlePhotoUpload}
                              disabled={!newPhotoFile || isChangingPhoto}
                            >
                              {isChangingPhoto ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Mise à jour...
                                </>
                              ) : (
                                <>
                                  <Upload className="mr-2 h-4 w-4" />
                                  Mettre à jour
                                </>
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-lg">
                    {canEditPhoto ? (
                      <>
                        <Camera className="h-12 w-12 text-muted-foreground mb-4" />
                        <Dialog open={showPhotoUpload} onOpenChange={setShowPhotoUpload}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                              <Camera className="h-4 w-4" />
                              Ajouter une photo
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Ajouter une photo au signalement</DialogTitle>
                              <DialogDescription>
                                Sélectionnez une photo pour illustrer ce signalement
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="photo">Photo</Label>
                                <Input
                                  id="photo"
                                  type="file"
                                  accept="image/*"
                                  onChange={handlePhotoChange}
                                  className="cursor-pointer"
                                />
                                <p className="text-xs text-muted-foreground">
                                  PNG, JPG jusqu'à 10MB
                                </p>
                              </div>
                              {newPhotoPreview && (
                                <div className="space-y-2">
                                  <Label>Aperçu</Label>
                                  <div className="border rounded-lg overflow-hidden">
                                    <img
                                      src={newPhotoPreview}
                                      alt="Aperçu"
                                      className="w-full h-64 object-contain"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setShowPhotoUpload(false)
                                  setNewPhotoPreview(null)
                                  setNewPhotoFile(null)
                                }}
                              >
                                Annuler
                              </Button>
                              <Button
                                onClick={handlePhotoUpload}
                                disabled={!newPhotoFile || isChangingPhoto}
                              >
                                {isChangingPhoto ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Mise à jour...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Ajouter
                                  </>
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </>
                    ) : (
                      <p className="text-muted-foreground">Aucune photo disponible</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{signalement.description}</p>
              </CardContent>
            </Card>

            {/* Photos d'intervention */}
            {photosIntervention.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Photos d'intervention ({photosIntervention.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {photosIntervention.map((photo) => (
                      <div key={photo.id} className="space-y-2">
                        <div className="aspect-square rounded-lg overflow-hidden border border-border bg-muted/50">
                          <img
                            src={photo.photoUrl}
                            alt={`Photo d'intervention ${photo.id}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg"
                              target.onerror = null
                            }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <p className="font-medium text-foreground">
                            {photo.technicien.prenom} {photo.technicien.nom}
                          </p>
                          <p>
                            {new Date(photo.dateAjout).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

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
            {/* Informations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Catégorie</h4>
                  <Badge variant="outline" className="text-sm">{signalement.categorie}</Badge>
                </div>
                {signalement.technicien && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Technicien assigné</h4>
                    <p className="text-sm text-muted-foreground">
                      {signalement.technicien.prenom} {signalement.technicien.nom}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informations de résolution (admin et technicien seulement, pas le citoyen) */}
            {(currentUser?.role === "ADMIN" || currentUser?.role === "TECHNICIEN") && signalement.statut === "RESOLU" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations de résolution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {signalement.commentairesTechniques ? (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Commentaires techniques</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {signalement.commentairesTechniques}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Commentaires techniques</h4>
                      <p className="text-sm text-muted-foreground italic">Aucun commentaire technique disponible</p>
                    </div>
                  )}
                  {signalement.tempsPasseMinutes !== null && signalement.tempsPasseMinutes !== undefined ? (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Temps passé</h4>
                      <p className="text-sm text-muted-foreground">
                        {Math.floor(signalement.tempsPasseMinutes / 60) > 0 && (
                          <>
                            {Math.floor(signalement.tempsPasseMinutes / 60)} heure{Math.floor(signalement.tempsPasseMinutes / 60) > 1 ? "s" : ""}
                            {signalement.tempsPasseMinutes % 60 > 0 && " et "}
                          </>
                        )}
                        {signalement.tempsPasseMinutes % 60 > 0 && (
                          <>
                            {signalement.tempsPasseMinutes % 60} minute{signalement.tempsPasseMinutes % 60 > 1 ? "s" : ""}
                          </>
                        )}
                        {signalement.tempsPasseMinutes === 0 && "0 minute"}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Temps passé</h4>
                      <p className="text-sm text-muted-foreground italic">Aucune information sur le temps passé</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Localisation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Localisation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-64 sm:h-80 w-full overflow-hidden rounded-lg border border-border bg-muted/30">
                  {isMapReady && (
                    <MapContainer
                      center={[signalement.latitude, signalement.longitude]}
                      zoom={15}
                      style={{ height: "100%", width: "100%" }}
                      className="rounded-lg"
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
                {signalement.adresse && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground break-words leading-relaxed">{signalement.adresse}</span>
                  </div>
                )}
                <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                  <p className="font-mono">Coordonnées: {signalement.latitude.toFixed(6)}, {signalement.longitude.toFixed(6)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Changer le statut */}
            {canChangeStatus && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Changer le statut
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Nouveau statut</label>
                    <Select
                      value={signalement.statut}
                      onValueChange={(value) => {
                        if (currentUser?.role === "TECHNICIEN" && value === "RESOLU") {
                          handleStatusChangeClick(value)
                        } else {
                          handleStatusChangeDirect(value)
                        }
                      }}
                      disabled={isChangingStatus}
                    >
                      <SelectTrigger>
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
                  {isChangingStatus && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Mise à jour en cours...
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {currentUser?.role === "ADMIN" && signalement.statut === "NOUVEAU" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions administrateur</CardTitle>
                  <CardDescription>Accepter ou refuser ce signalement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <Button
                      onClick={handleAcceptSignalement}
                      disabled={isAccepting || isRefusing}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {isAccepting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Acceptation...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Accepter
                        </>
                      )}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          disabled={isAccepting || isRefusing}
                          className="flex-1"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Refuser
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Refuser le signalement</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir refuser le signalement "{signalement.titre}" ? 
                            Cette action est irréversible et supprimera définitivement le signalement.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleRefuseSignalement}
                            disabled={isRefusing}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isRefusing ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Refus en cours...
                              </>
                            ) : (
                              "Refuser"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentUser?.role === "ADMIN" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Assigner un technicien</CardTitle>
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

        {/* Dialog pour le changement de statut à RESOLU avec photos (technicien) */}
        {currentUser?.role === "TECHNICIEN" && (
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
                  <Label htmlFor="commentaires-techniques">Commentaires techniques *</Label>
                  <Textarea
                    id="commentaires-techniques"
                    placeholder="Décrivez les travaux effectués, les solutions appliquées, les matériaux utilisés, etc."
                    value={commentairesTechniques}
                    onChange={(e) => setCommentairesTechniques(e.target.value)}
                    rows={4}
                    disabled={isChangingStatus}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Détails techniques de l'intervention réalisée
                  </p>
                </div>

                {/* Temps passé */}
                <div className="space-y-2">
                  <Label htmlFor="temps-passe">Temps passé pour résoudre le problème *</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="temps-heures" className="text-xs text-muted-foreground">Heures</Label>
                      <Input
                        id="temps-heures"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={tempsPasseHours}
                        onChange={(e) => setTempsPasseHours(e.target.value)}
                        disabled={isChangingStatus}
                      />
                    </div>
                    <div>
                      <Label htmlFor="temps-minutes" className="text-xs text-muted-foreground">Minutes</Label>
                      <Input
                        id="temps-minutes"
                        type="number"
                        min="0"
                        max="59"
                        placeholder="0"
                        value={tempsPasseMinutes}
                        onChange={(e) => setTempsPasseMinutes(e.target.value)}
                        disabled={isChangingStatus}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Temps total passé pour résoudre ce problème
                  </p>
                </div>

                {/* Photos d'intervention */}
                <div className="space-y-2">
                  <Label htmlFor="photos-intervention-detail">Photos d'intervention *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="photos-intervention-detail"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleInterventionPhotoChange}
                      disabled={isChangingStatus || interventionPhotos.length >= 5}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const input = document.getElementById("photos-intervention-detail") as HTMLInputElement
                        input?.click()
                      }}
                      disabled={isChangingStatus || interventionPhotos.length >= 5}
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
                            onClick={() => removeInterventionPhoto(index)}
                            disabled={isChangingStatus}
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
                    setSelectedNewStatus("")
                    setInterventionPhotos([])
                    setPhotoPreviews([])
                    setCommentairesTechniques("")
                    setTempsPasseHours("")
                    setTempsPasseMinutes("")
                  }}
                  disabled={isChangingStatus}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleStatusChangeWithPhotos}
                  disabled={isChangingStatus || interventionPhotos.length === 0 || !commentairesTechniques.trim() || (!tempsPasseHours.trim() && !tempsPasseMinutes.trim())}
                >
                  {isChangingStatus ? (
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
        )}
      </main>
    </div>
  )
}
