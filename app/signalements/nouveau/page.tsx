"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  MapPin, 
  Upload, 
  Loader2, 
  Search, 
  X, 
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  Save,
  Eye,
  Camera,
  Navigation,
  Sparkles,
  Zap,
  Info
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import dynamic from "next/dynamic"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

// Dynamic import for Leaflet map
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })

// Composant pour gérer les clics sur la carte
const MapClickHandler = dynamic(
  () =>
    import("react-leaflet").then((mod) => {
      const { useMapEvents } = mod
      return function MapClickHandler({ 
        setPosition, 
        onPositionChange 
      }: { 
        setPosition: (pos: [number, number]) => void
        onPositionChange: (pos: [number, number]) => void
      }) {
        useMapEvents({
          click(e: any) {
            const newPosition: [number, number] = [e.latlng.lat, e.latlng.lng]
            setPosition(newPosition)
            onPositionChange(newPosition)
          },
        })
        return null
      }
    }),
  { ssr: false }
)

function LocationMarker({ position, adresse }: { position: [number, number] | null, adresse?: string }) {
  const markerRef = useRef<any>(null)
  
  const customIcon = useMemo(() => {
    if (typeof window === "undefined") return null
    const L = require("leaflet")
    
    // Créer une icône SVG de pin rouge animée
    const svgIcon = `
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C10.477 0 6 4.477 6 10C6 17 16 30 16 30C16 30 26 17 26 10C26 4.477 21.523 0 16 0Z" fill="#DC2626"/>
        <circle cx="16" cy="10" r="6" fill="white"/>
        <circle cx="16" cy="10" r="3" fill="#DC2626"/>
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
    if (markerRef.current && adresse) {
      const timer = setTimeout(() => {
        if (markerRef.current) {
          markerRef.current.openPopup()
        }
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [position, adresse])

  if (!position) return null

  const markerProps: any = { 
    position,
    ref: markerRef
  }
  if (customIcon) {
    markerProps.icon = customIcon
  }

  return (
    <Marker {...markerProps}>
      {adresse && (
        <Popup>
          <div className="p-2 min-w-[200px]">
            <p className="font-semibold text-sm text-[#00648E]">📍 Adresse du signalement</p>
            <p className="text-xs text-muted-foreground mt-1 break-words">{adresse}</p>
          </div>
        </Popup>
      )}
    </Marker>
  )
}

// Catégories avec icônes et couleurs
const categories = [
  { value: "Nids de poule", label: "Nids de poule", icon: "🕳️", color: "bg-orange-500", priority: "HAUTE" },
  { value: "Éclairage public", label: "Éclairage public", icon: "💡", color: "bg-yellow-500", priority: "MOYENNE" },
  { value: "Déchets", label: "Déchets", icon: "🗑️", color: "bg-green-500", priority: "MOYENNE" },
  { value: "Infrastructure", label: "Infrastructure", icon: "🏗️", color: "bg-blue-500", priority: "HAUTE" },
  { value: "Espaces verts", label: "Espaces verts", icon: "🌳", color: "bg-emerald-500", priority: "BASSE" },
  { value: "Signalisation", label: "Signalisation", icon: "🚦", color: "bg-red-500", priority: "HAUTE" },
]

export default function NewSignalementPage() {
  const { user, isAuthenticated } = useAuth()
  const [isMounted, setIsMounted] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [showPreview, setShowPreview] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
    // Charger le brouillon depuis localStorage
    loadDraft()
    // Sauvegarder automatiquement toutes les 30 secondes
    const autoSaveInterval = setInterval(() => {
      saveDraft()
    }, 30000)
    return () => clearInterval(autoSaveInterval)
  }, [])
  
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    categorie: "",
    priorite: "MOYENNE",
    adresse: "",
  })
  
  const [position, setPosition] = useState<[number, number]>([34.0209, -6.8416])
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [isMapReady, setIsMapReady] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [isManualPositionChange, setIsManualPositionChange] = useState(false)
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const addressInputRef = useRef<HTMLInputElement>(null)

  // Calculer le pourcentage de complétion
  const completionPercentage = useMemo(() => {
    let completed = 0
    const total = 5
    if (formData.titre.trim().length >= 5) completed++
    if (formData.description.trim().length >= 20) completed++
    if (formData.categorie) completed++
    if (formData.adresse.trim().length >= 5) completed++
    if (photos.length > 0) completed++
    return Math.round((completed / total) * 100)
  }, [formData, photos])

  // Sauvegarder en brouillon
  const saveDraft = useCallback(() => {
    const draft = {
      formData,
      position,
      photoPreviews,
      timestamp: Date.now()
    }
    localStorage.setItem("signalement_draft", JSON.stringify(draft))
    toast.success("Brouillon sauvegardé automatiquement", {
      duration: 2000,
      position: "bottom-right"
    })
  }, [formData, position, photoPreviews])

  // Charger le brouillon
  const loadDraft = () => {
    try {
      const draftStr = localStorage.getItem("signalement_draft")
      if (draftStr) {
        const draft = JSON.parse(draftStr)
        // Ne charger que si le brouillon a moins de 7 jours
        if (Date.now() - draft.timestamp < 7 * 24 * 60 * 60 * 1000) {
          setFormData(draft.formData)
          setPosition(draft.position)
          setPhotoPreviews(draft.photoPreviews || [])
          toast.info("Brouillon chargé", { duration: 3000 })
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement du brouillon:", error)
    }
  }

  // Effacer le brouillon
  const clearDraft = () => {
    localStorage.removeItem("signalement_draft")
    toast.success("Brouillon effacé")
  }

  useEffect(() => {
    setIsMapReady(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude])
          reverseGeocode(pos.coords.latitude, pos.coords.longitude)
        },
        (error) => {
          console.log("Geolocation error:", error)
          setPosition([34.0209, -6.8416])
        },
      )
    } else {
      setPosition([34.0209, -6.8416])
    }
  }, [])

  // Gestion des photos multiples
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newPhotos: File[] = []
    const newPreviews: string[] = []

    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`L'image ${file.name} est trop grande (max 10MB)`)
        return
      }
      if (!file.type.startsWith("image/")) {
        toast.error(`Le fichier ${file.name} n'est pas une image`)
        return
      }
      newPhotos.push(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result as string)
        if (newPreviews.length === newPhotos.length) {
          setPhotoPreviews([...photoPreviews, ...newPreviews])
          setPhotos([...photos, ...newPhotos])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index))
  }

  // Autocomplétion d'adresses
  const searchAddresses = async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([])
      return
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", Maroc")}&limit=5&countrycodes=ma`,
        {
          headers: {
            'User-Agent': 'CityReport/1.0'
          }
        }
      )
      
      const data = await response.json()
      if (data && data.length > 0) {
        setAddressSuggestions(data.map((item: any) => item.display_name))
        setShowSuggestions(true)
      } else {
        setAddressSuggestions([])
      }
    } catch (error) {
      console.error("Erreur de recherche d'adresse:", error)
    }
  }

  const handleAddressChange = (value: string) => {
    setFormData({ ...formData, adresse: value })
    searchAddresses(value)
    if (value.length >= 5) {
      geocodeAddress(value)
    }
  }

  const selectAddress = (address: string) => {
    setFormData({ ...formData, adresse: address })
    setShowSuggestions(false)
    geocodeAddress(address)
  }

  // Validation en temps réel
  const validateField = (name: string, value: string) => {
    const errors: Record<string, string> = { ...validationErrors }
    
    switch (name) {
      case "titre":
        if (value.length < 5) {
          errors.titre = "Le titre doit contenir au moins 5 caractères"
        } else if (value.length > 100) {
          errors.titre = "Le titre ne peut pas dépasser 100 caractères"
        } else {
          delete errors.titre
        }
        break
      case "description":
        if (value.length < 20) {
          errors.description = "La description doit contenir au moins 20 caractères"
        } else if (value.length > 1000) {
          errors.description = "La description ne peut pas dépasser 1000 caractères"
        } else {
          delete errors.description
        }
        break
      case "categorie":
        if (!value) {
          errors.categorie = "Veuillez sélectionner une catégorie"
        } else {
          delete errors.categorie
          // Estimation automatique de la priorité
          const category = categories.find(c => c.value === value)
          if (category) {
            setFormData(prev => ({ ...prev, priorite: category.priority }))
          }
        }
        break
    }
    
    setValidationErrors(errors)
  }

  // Géocodage de l'adresse
  const geocodeAddress = async (address: string) => {
    if (!address || address.trim().length < 5) return
    if (isManualPositionChange) {
      setIsManualPositionChange(false)
      return
    }

    setIsGeocoding(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ", Maroc")}&limit=1&countrycodes=ma`,
        {
          headers: {
            'User-Agent': 'CityReport/1.0'
          }
        }
      )
      
      const data = await response.json()
      
      if (data && data.length > 0) {
        const result = data[0]
        const lat = parseFloat(result.lat)
        const lon = parseFloat(result.lon)
        setPosition([lat, lon])
        toast.success("Localisation mise à jour", { duration: 2000 })
      }
    } catch (error) {
      console.error("Erreur de géocodage:", error)
      toast.error("Erreur lors de la recherche de l'adresse")
    } finally {
      setIsGeocoding(false)
    }
  }

  // Géocodage inverse
  const reverseGeocode = async (lat: number, lon: number) => {
    setIsGeocoding(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'CityReport/1.0'
          }
        }
      )
      
      const data = await response.json()
      
      if (data && data.display_name) {
        let address = data.display_name
        if (!address.includes("Maroc") && !address.includes("Morocco")) {
          address = address + ", Maroc"
        }
        
        setFormData((prev) => ({
          ...prev,
          adresse: address
        }))
      }
    } catch (error) {
      console.error("Erreur de géocodage inverse:", error)
    } finally {
      setIsGeocoding(false)
    }
  }

  const handlePositionChange = (newPosition: [number, number]) => {
    setIsManualPositionChange(true)
    setPosition(newPosition)
    reverseGeocode(newPosition[0], newPosition[1])
    toast.success("Position mise à jour", { duration: 2000 })
  }

  // Utiliser ma position actuelle
  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude]
          setPosition(newPos)
          reverseGeocode(newPos[0], newPos[1])
          toast.success("Position actuelle utilisée", { duration: 2000 })
        },
        (error) => {
          toast.error("Impossible d'obtenir votre position")
        }
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation finale
    if (!formData.titre || formData.titre.length < 5) {
      toast.error("Le titre doit contenir au moins 5 caractères")
      return
    }
    if (!formData.description || formData.description.length < 20) {
      toast.error("La description doit contenir au moins 20 caractères")
      return
    }
    if (!formData.categorie) {
      toast.error("Veuillez sélectionner une catégorie")
      return
    }

    setIsSubmitting(true)

    try {
      // Préparer les données
      const signalementData = {
        titre: formData.titre,
        description: formData.description,
        categorie: formData.categorie,
        priorite: formData.priorite,
        latitude: position[0],
        longitude: position[1],
        adresse: formData.adresse || null,
      }

      const token = localStorage.getItem("token")
      
      if (!isAuthenticated || !user) {
        toast.error("Vous devez être connecté pour créer un signalement")
        return
      }
      
      if (!token) {
        toast.error("Token d'authentification manquant")
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

      // Upload des photos d'abord si disponibles
      let photoUrls: string[] = []
      if (photos.length > 0) {
        // Ici, vous devriez uploader les photos vers votre backend
        // Pour l'instant, on utilise les previews en base64 (à adapter selon votre API)
        photoUrls = photoPreviews
      }

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }

      const response = await fetch(`${apiUrl}/api/signalements`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...signalementData,
          photoUrl: photoUrls[0] || null,
        }),
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          toast.error("Session expirée. Veuillez vous reconnecter.")
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          setTimeout(() => {
            window.location.href = "/login"
          }, 2000)
          return
        }
        
        const errorText = await response.text()
        let errorMessage = `Erreur ${response.status}`
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const createdSignalement = await response.json()
      
      // Effacer le brouillon après succès
      clearDraft()
      
      toast.success("Signalement créé avec succès !", {
        duration: 3000,
        description: "Vous allez être redirigé vers vos signalements"
      })

      setTimeout(() => {
        window.location.href = "/mes-signalements"
      }, 1500)
    } catch (error: any) {
      console.error("Erreur lors de la création du signalement:", error)
      toast.error(error.message || "Une erreur est survenue lors de la création du signalement")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCategory = categories.find(c => c.value === formData.categorie)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header avec progression */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Créer un signalement
              </h1>
              <p className="text-muted-foreground mt-2">
                Aidez-nous à améliorer votre ville en signalant les problèmes
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={saveDraft}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Sauvegarder
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                Aperçu
              </Button>
            </div>
          </div>
          
          {/* Barre de progression */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progression du formulaire</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informations du signalement */}
              <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Informations du signalement
                  </CardTitle>
                  <CardDescription>Décrivez le problème de manière claire et précise</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {/* Titre */}
                  <div className="space-y-2">
                    <Label htmlFor="titre" className="text-base font-semibold">
                      Titre du signalement <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="titre"
                      placeholder="Ex: Nid de poule avenue Victor Hugo"
                      value={formData.titre}
                      onChange={(e) => {
                        setFormData({ ...formData, titre: e.target.value })
                        validateField("titre", e.target.value)
                      }}
                      className={validationErrors.titre ? "border-destructive" : ""}
                      required
                    />
                    <div className="flex items-center justify-between text-xs">
                      <span className={validationErrors.titre ? "text-destructive" : "text-muted-foreground"}>
                        {validationErrors.titre || `${formData.titre.length}/100 caractères`}
                      </span>
                      {formData.titre.length >= 5 && !validationErrors.titre && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>

                  {/* Catégorie et Priorité */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="categorie" className="text-base font-semibold">
                        Catégorie <span className="text-destructive">*</span>
                      </Label>
                      {isMounted ? (
                        <Select
                          value={formData.categorie}
                          onValueChange={(value) => {
                            setFormData({ ...formData, categorie: value })
                            validateField("categorie", value)
                          }}
                          required
                        >
                          <SelectTrigger id="categorie" className={validationErrors.categorie ? "border-destructive" : ""}>
                            <SelectValue placeholder="Sélectionner une catégorie" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                <div className="flex items-center gap-2">
                                  <span>{cat.icon}</span>
                                  <span>{cat.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                          Sélectionner une catégorie
                        </div>
                      )}
                      {selectedCategory && (
                        <Badge variant="outline" className={`${selectedCategory.color} text-white border-0 mt-2`}>
                          {selectedCategory.icon} {selectedCategory.label}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priorite" className="text-base font-semibold">
                        Priorité <span className="text-destructive">*</span>
                      </Label>
                      {isMounted ? (
                        <Select
                          value={formData.priorite}
                          onValueChange={(value) => setFormData({ ...formData, priorite: value })}
                        >
                          <SelectTrigger id="priorite">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BASSE">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                Basse
                              </div>
                            </SelectItem>
                            <SelectItem value="MOYENNE">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                                Moyenne
                              </div>
                            </SelectItem>
                            <SelectItem value="HAUTE">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-red-500" />
                                Haute
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          {formData.priorite === "BASSE" ? "Basse" : formData.priorite === "MOYENNE" ? "Moyenne" : "Haute"}
                        </div>
                      )}
                      {formData.categorie && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                          <Info className="h-3 w-3" />
                          <span>Priorité suggérée selon la catégorie</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-base font-semibold">
                      Description détaillée <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez le problème en détail, sa localisation précise, son impact, etc..."
                      value={formData.description}
                      onChange={(e) => {
                        setFormData({ ...formData, description: e.target.value })
                        validateField("description", e.target.value)
                      }}
                      rows={6}
                      className={validationErrors.description ? "border-destructive" : ""}
                      required
                    />
                    <div className="flex items-center justify-between text-xs">
                      <span className={validationErrors.description ? "text-destructive" : "text-muted-foreground"}>
                        {validationErrors.description || `${formData.description.length}/1000 caractères`}
                      </span>
                      {formData.description.length >= 20 && !validationErrors.description && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>

                  {/* Adresse avec autocomplétion */}
                  <div className="space-y-2">
                    <Label htmlFor="adresse" className="text-base font-semibold">
                      Adresse du signalement
                    </Label>
                    <div className="relative">
                      <Input
                        ref={addressInputRef}
                        id="adresse"
                        placeholder="Ex: Avenue Mohammed V, Rabat, Maroc"
                        value={formData.adresse}
                        onChange={(e) => handleAddressChange(e.target.value)}
                        onFocus={() => setShowSuggestions(addressSuggestions.length > 0)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        className="pr-10"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isGeocoding ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <Search className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      
                      {/* Suggestions d'adresses */}
                      {showSuggestions && addressSuggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                          {addressSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => selectAddress(suggestion)}
                              className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-sm"
                            >
                              <MapPin className="h-4 w-4 inline mr-2 text-primary" />
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      La carte se mettra à jour automatiquement. Vous pouvez aussi cliquer sur la carte pour localiser.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Photos multiples */}
              <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-primary" />
                    Photos du problème
                  </CardTitle>
                  <CardDescription>Ajoutez jusqu'à 5 photos pour mieux illustrer le problème</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Zone de téléchargement */}
                    {photos.length < 5 && (
                      <div className="flex items-center justify-center w-full">
                        <Label
                          htmlFor="photos"
                          className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/30 hover:bg-secondary/50 transition-all hover:border-primary"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-12 h-12 mb-4 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
                            </p>
                            <p className="text-xs text-muted-foreground">PNG, JPG jusqu'à 10MB (max 5 photos)</p>
                          </div>
                          <Input
                            id="photos"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            multiple
                            onChange={handlePhotoChange}
                          />
                        </Label>
                      </div>
                    )}

                    {/* Galerie de prévisualisation */}
                    {photoPreviews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {photoPreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border-2 border-border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removePhoto(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                              Photo {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Boutons d'action */}
              <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-2">
                <CardContent className="pt-6 space-y-3">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isSubmitting || completionPercentage < 60}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Créer le signalement
                      </>
                    )}
                  </Button>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1" asChild>
                      <Link href="/signalements">
                        Annuler
                      </Link>
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={clearDraft}
                      className="flex-1"
                    >
                      Effacer le brouillon
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar avec carte */}
            <div className="flex flex-col">
              <Card className="border-2 shadow-lg sticky top-8">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Localisation
                    </CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={useCurrentLocation}
                      className="gap-2"
                    >
                      <Navigation className="h-4 w-4" />
                      Ma position
                    </Button>
                  </div>
                  <CardDescription>Cliquez sur la carte pour placer le marqueur</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="w-full overflow-hidden rounded-lg border-2 border-border" style={{ height: "500px" }}>
                    {isMapReady ? (
                      <MapContainer 
                        center={position} 
                        zoom={13} 
                        style={{ height: "100%", width: "100%" }}
                        className="z-0"
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />
                        <MapClickHandler setPosition={setPosition} onPositionChange={handlePositionChange} />
                        <LocationMarker position={position} adresse={formData.adresse} />
                      </MapContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full bg-secondary/30">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground p-3 bg-muted/50 rounded-lg">
                      <MapPin className="h-4 w-4 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Coordonnées</p>
                        <p className="text-xs">
                          Lat: {position[0].toFixed(6)}, Long: {position[1].toFixed(6)}
                        </p>
                      </div>
                    </div>
                    {formData.adresse && (
                      <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="text-xs font-medium text-foreground mb-1">Adresse détectée :</p>
                        <p className="text-xs text-muted-foreground break-words">{formData.adresse}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>

        {/* Aperçu modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Aperçu du signalement</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Titre</Label>
                  <p className="text-lg font-semibold">{formData.titre || "Non renseigné"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Catégorie</Label>
                  {selectedCategory && (
                    <Badge className={`${selectedCategory.color} text-white mt-1`}>
                      {selectedCategory.icon} {selectedCategory.label}
                    </Badge>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Priorité</Label>
                  <Badge variant="outline" className="mt-1">
                    {formData.priorite}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{formData.description || "Non renseigné"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Adresse</Label>
                  <p className="text-sm mt-1">{formData.adresse || "Non renseigné"}</p>
                </div>
                {photoPreviews.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Photos ({photoPreviews.length})</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {photoPreviews.map((preview, index) => (
                        <img key={index} src={preview} alt={`Preview ${index + 1}`} className="rounded-lg" />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
