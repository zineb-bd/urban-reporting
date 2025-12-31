 "use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Upload, Loader2, Search } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useMemo, useRef } from "react"
import dynamic from "next/dynamic"
import { useAuth } from "@/lib/auth-context"

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

  // Ouvrir automatiquement le popup quand la position ou l'adresse change
  useEffect(() => {
    if (markerRef.current && adresse) {
      // Attendre un peu pour que le marqueur soit bien rendu
      const timer = setTimeout(() => {
        if (markerRef.current) {
          markerRef.current.openPopup()
        }
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [position, adresse])

  if (!position) return null

  // Utiliser l'icône personnalisée si disponible, sinon utiliser le marqueur par défaut
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

export default function NewSignalementPage() {
  const { user, isAuthenticated } = useAuth()
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    categorie: "",
    priorite: "MOYENNE",
    adresse: "",
  })
  // Coordonnées par défaut : Rabat, Maroc
  const [position, setPosition] = useState<[number, number]>([34.0209, -6.8416])
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [isManualPositionChange, setIsManualPositionChange] = useState(false)

  useEffect(() => {
    setIsMapReady(true)
    // Get user location (fallback to Rabat, Morocco if denied)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude])
        },
        (error) => {
          console.log("[v0] Geolocation error:", error)
          // Default to Rabat, Morocco
          setPosition([34.0209, -6.8416])
        },
      )
    } else {
      // Default to Rabat, Morocco if geolocation not available
      setPosition([34.0209, -6.8416])
    }
  }, [])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Géocodage de l'adresse pour mettre à jour la carte
  const geocodeAddress = async (address: string) => {
    if (!address || address.trim().length < 5) {
      return // Ne pas géocoder si l'adresse est trop courte
    }

    // Ne pas géocoder si c'est un changement manuel de position
    if (isManualPositionChange) {
      setIsManualPositionChange(false)
      return
    }

    setIsGeocoding(true)
    try {
      // Utiliser Nominatim (OpenStreetMap) pour le géocodage
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
      }
    } catch (error) {
      console.error("Erreur de géocodage:", error)
    } finally {
      setIsGeocoding(false)
    }
  }

  // Géocodage inverse : convertir les coordonnées en adresse
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
        // Formater l'adresse pour le Maroc
        let address = data.display_name
        
        // Si l'adresse contient "Maroc" ou "Morocco", on la garde telle quelle
        // Sinon, on ajoute ", Maroc" à la fin
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

  // Gérer le changement de position manuel (clic sur la carte)
  const handlePositionChange = (newPosition: [number, number]) => {
    // Marquer que c'est un changement manuel pour éviter la boucle
    setIsManualPositionChange(true)
    // Mettre à jour l'adresse via géocodage inverse
    reverseGeocode(newPosition[0], newPosition[1])
  }

  // Délai pour éviter trop de requêtes pendant la saisie
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.adresse) {
        geocodeAddress(formData.adresse)
      }
    }, 1000) // Attendre 1 seconde après la fin de la saisie

    return () => clearTimeout(timeoutId)
  }, [formData.adresse])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Préparer les données à envoyer
      const signalementData = {
        titre: formData.titre,
        description: formData.description,
        categorie: formData.categorie,
        priorite: formData.priorite,
        latitude: position[0],
        longitude: position[1],
        adresse: formData.adresse || null,
        photoUrl: photoPreview || null,
      }

      // Récupérer le token depuis localStorage (si disponible)
      const token = localStorage.getItem("token")
      
      // URL du backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      
      // Vérifier si l'utilisateur est connecté
      if (!isAuthenticated || !user) {
        throw new Error("Vous devez être connecté pour créer un signalement. Veuillez vous connecter.")
      }
      
      // Vérifier que le token existe
      if (!token) {
        throw new Error("Token d'authentification manquant. Veuillez vous reconnecter.")
      }
      
      // Préparer les headers
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }

      console.log("Envoi de la requête à:", `${apiUrl}/api/signalements`)
      console.log("Données envoyées:", signalementData)

      // Envoyer la requête au backend
      const response = await fetch(`${apiUrl}/api/signalements`, {
        method: "POST",
        headers,
        body: JSON.stringify(signalementData),
      }).catch((fetchError) => {
        // Gérer les erreurs de réseau
        console.error("Erreur de réseau:", fetchError)
        throw new Error(
          `Impossible de contacter le serveur. Vérifiez que le backend est démarré sur ${apiUrl}. ` +
          `Erreur: ${fetchError.message}`
        )
      })

      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}: ${response.statusText}`
        
        // Gérer les erreurs d'authentification
        if (response.status === 401) {
          errorMessage = "Session expirée. Veuillez vous reconnecter."
          localStorage.removeItem("token")
          localStorage.removeItem("user")
        } else if (response.status === 403) {
          errorMessage = "Accès refusé. Vous devez être connecté pour créer un signalement. Veuillez vous reconnecter."
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          // Rediriger vers la page de connexion
          setTimeout(() => {
            window.location.href = "/login"
          }, 2000)
        } else {
          // Essayer de lire le message d'erreur JSON si disponible
          try {
            const contentType = response.headers.get("content-type")
            if (contentType && contentType.includes("application/json")) {
              const text = await response.text()
              if (text && text.trim().length > 0) {
                const errorData = JSON.parse(text)
                errorMessage = errorData.message || errorData.error || errorMessage
              }
            }
          } catch (parseError) {
            // Si la réponse n'est pas du JSON valide, utiliser le message par défaut
            console.error("Erreur lors de l'analyse de la réponse:", parseError)
          }
        }
        
        throw new Error(errorMessage)
      }

      const createdSignalement = await response.json()
      console.log("Signalement créé avec succès:", createdSignalement)

      // Rediriger vers la page des signalements
      window.location.href = "/mes-signalements"
    } catch (error: any) {
      console.error("Erreur lors de la création du signalement:", error)
      const errorMessage = error.message || "Une erreur est survenue lors de la création du signalement. Veuillez réessayer."
      alert(errorMessage)
      
      // Si c'est une erreur d'authentification, rediriger vers la page de connexion
      if (error.message && error.message.includes("Session expirée")) {
        window.location.href = "/login"
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Créer un signalement</h1>
          <p className="text-muted-foreground">
            Signalez un problème dans votre ville pour qu'il soit pris en charge rapidement
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations du signalement</CardTitle>
                  <CardDescription>Décrivez le problème de manière claire et précise</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="titre">Titre du signalement *</Label>
                    <Input
                      id="titre"
                      placeholder="Ex: Nid de poule avenue Victor Hugo"
                      value={formData.titre}
                      onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="categorie">Catégorie *</Label>
                      {isMounted ? (
                        <Select
                          value={formData.categorie}
                          onValueChange={(value) => setFormData({ ...formData, categorie: value })}
                          required
                        >
                          <SelectTrigger id="categorie">
                            <SelectValue placeholder="Sélectionner une catégorie" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Nids de poule">Nids de poule</SelectItem>
                            <SelectItem value="Éclairage public">Éclairage public</SelectItem>
                            <SelectItem value="Déchets">Déchets</SelectItem>
                            <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                            <SelectItem value="Espaces verts">Espaces verts</SelectItem>
                            <SelectItem value="Signalisation">Signalisation</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                          Sélectionner une catégorie
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priorite">Priorité *</Label>
                      {isMounted ? (
                        <Select
                          value={formData.priorite}
                          onValueChange={(value) => setFormData({ ...formData, priorite: value })}
                        >
                          <SelectTrigger id="priorite">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BASSE">Basse</SelectItem>
                            <SelectItem value="MOYENNE">Moyenne</SelectItem>
                            <SelectItem value="HAUTE">Haute</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          {formData.priorite === "BASSE" ? "Basse" : formData.priorite === "MOYENNE" ? "Moyenne" : "Haute"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description détaillée *</Label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez le problème en détail..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={5}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adresse">Adresse du signalement</Label>
                    <div className="relative">
                      <Input
                        id="adresse"
                        placeholder="Ex: Avenue Mohammed V, Rabat, Maroc"
                        value={formData.adresse}
                        onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                      />
                      {isGeocoding && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-[#00648E]" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Indiquez l'adresse précise du problème. La carte se mettra à jour automatiquement. Vous pouvez aussi cliquer sur la carte pour la localiser.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Photo du problème</CardTitle>
                  <CardDescription>Ajoutez une photo pour aider à identifier le problème</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <Label
                        htmlFor="photo"
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        {photoPreview ? (
                          <img
                            src={photoPreview || "/placeholder.svg"}
                            alt="Preview"
                            className="h-full w-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-12 h-12 mb-4 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
                            </p>
                            <p className="text-xs text-muted-foreground">PNG, JPG jusqu'à 10MB</p>
                          </div>
                        )}
                        <Input
                          id="photo"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handlePhotoChange}
                        />
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card className="bg-accent/10">
                <CardContent className="pt-6">
                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      "Créer le signalement"
                    )}
                  </Button>
                  <Button type="button" variant="outline" className="w-full mt-2 bg-transparent" asChild>
                    <Link href="/signalements">Annuler</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Map Sidebar - Full Height */}
            <div className="flex flex-col">
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Localisation</CardTitle>
                  <CardDescription>Cliquez sur la carte du Maroc pour placer le marqueur à l'emplacement du problème</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col space-y-4">
                  <div className="w-full overflow-hidden rounded-lg border" style={{ height: "600px" }}>
                    {isMapReady ? (
                      <MapContainer 
                        center={position} 
                        zoom={12} 
                        style={{ height: "100%", width: "100%" }}
                        className="z-0"
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | Carte du Maroc'
                        />
                        <MapClickHandler setPosition={setPosition} onPositionChange={handlePositionChange} />
                        <LocationMarker position={position} adresse={formData.adresse} />
                      </MapContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full bg-secondary/30">
                        <Loader2 className="h-8 w-8 animate-spin text-[#00648E]" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>
                        Lat: {position[0].toFixed(4)}, Long: {position[1].toFixed(4)}
                      </span>
                    </div>
                    {formData.adresse && (
                      <div className="p-2 bg-secondary/50 rounded-md">
                        <p className="text-xs font-medium text-foreground">Adresse saisie :</p>
                        <p className="text-xs text-muted-foreground">{formData.adresse}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
