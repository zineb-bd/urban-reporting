"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MapPin, Loader2, Save, X } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, use } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import dynamic from "next/dynamic"

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })

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

function LocationMarker({ position }: { position: [number, number] | null }) {
  if (!position) return null
  return <Marker position={position} />
}

const categories = [
  { value: "Nids de poule", label: "Nids de poule", icon: "🕳️", color: "bg-orange-500" },
  { value: "Éclairage public", label: "Éclairage public", icon: "💡", color: "bg-yellow-500" },
  { value: "Déchets", label: "Déchets", icon: "🗑️", color: "bg-green-500" },
  { value: "Infrastructure", label: "Infrastructure", icon: "🏗️", color: "bg-blue-500" },
  { value: "Espaces verts", label: "Espaces verts", icon: "🌳", color: "bg-emerald-500" },
  { value: "Signalisation", label: "Signalisation", icon: "🚦", color: "bg-red-500" },
]

interface Signalement {
  id: number
  titre: string
  description: string
  categorie: string
  statut: "NOUVEAU" | "EN_ATTENTE" | "EN_COURS" | "RESOLU"
  priorite: "BASSE" | "MOYENNE" | "HAUTE"
  latitude: number
  longitude: number
  photoUrl?: string | null
  adresse?: string | null
}

export default function ModifierSignalementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMapReady, setIsMapReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    categorie: "",
    priorite: "MOYENNE" as "BASSE" | "MOYENNE" | "HAUTE",
    adresse: "",
  })
  
  const [position, setPosition] = useState<[number, number]>([34.0209, -6.8416])
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    const fetchSignalement = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Token d'authentification manquant")
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        const response = await fetch(`${apiUrl}/api/signalements/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            router.push("/login")
            return
          }
          throw new Error(`Erreur ${response.status}`)
        }

        const data: Signalement = await response.json()
        
        // Vérifier que l'utilisateur est le propriétaire
        if (data.statut === "RESOLU") {
          toast.error("Vous ne pouvez pas modifier un signalement résolu")
          router.push(`/signalements/${id}`)
          return
        }

        setFormData({
          titre: data.titre,
          description: data.description,
          categorie: data.categorie,
          priorite: data.priorite,
          adresse: data.adresse || "",
        })
        setPosition([data.latitude, data.longitude])
        setPhotoUrl(data.photoUrl)
        setIsMapReady(true)
      } catch (err: any) {
        console.error("Erreur lors du chargement du signalement:", err)
        setError(err.message || "Une erreur est survenue")
        toast.error(err.message || "Erreur lors du chargement du signalement")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSignalement()
  }, [id, isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
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
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token d'authentification manquant")
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

      const signalementData = {
        titre: formData.titre,
        description: formData.description,
        categorie: formData.categorie,
        priorite: formData.priorite,
        latitude: position[0],
        longitude: position[1],
        adresse: formData.adresse || null,
        photoUrl: photoUrl,
      }

      const response = await fetch(`${apiUrl}/api/signalements/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(signalementData),
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          toast.error("Session expirée. Veuillez vous reconnecter.")
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          router.push("/login")
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

      toast.success("Signalement modifié avec succès !")
      router.push(`/signalements/${id}`)
    } catch (error: any) {
      console.error("Erreur lors de la modification du signalement:", error)
      toast.error(error.message || "Une erreur est survenue lors de la modification")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePositionChange = (newPosition: [number, number]) => {
    setPosition(newPosition)
  }

  const selectedCategory = categories.find(c => c.value === formData.categorie)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
            <Button onClick={() => router.push("/mes-signalements")} className="mt-4">
              Retour aux signalements
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link 
            href={`/signalements/${id}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Retour au signalement
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Modifier le signalement</CardTitle>
            <CardDescription>Modifiez les informations de votre signalement</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Titre */}
              <div className="space-y-2">
                <Label htmlFor="titre">Titre *</Label>
                <Input
                  id="titre"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  required
                />
              </div>

              {/* Catégorie et Priorité */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categorie">Catégorie *</Label>
                  <Select
                    value={formData.categorie}
                    onValueChange={(value) => setFormData({ ...formData, categorie: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priorite">Priorité *</Label>
                  <Select
                    value={formData.priorite}
                    onValueChange={(value: "BASSE" | "MOYENNE" | "HAUTE") => 
                      setFormData({ ...formData, priorite: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BASSE">Basse</SelectItem>
                      <SelectItem value="MOYENNE">Moyenne</SelectItem>
                      <SelectItem value="HAUTE">Haute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Adresse */}
              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse</Label>
                <Input
                  id="adresse"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  placeholder="Ex: Avenue Mohammed V, Casablanca"
                />
              </div>

              {/* Carte */}
              <div className="space-y-2">
                <Label>Localisation *</Label>
                <div className="w-full h-64 rounded-lg border overflow-hidden">
                  {isMapReady ? (
                    <MapContainer 
                      center={position} 
                      zoom={13} 
                      style={{ height: "100%", width: "100%" }}
                      className="z-0"
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <MapClickHandler setPosition={setPosition} onPositionChange={handlePositionChange} />
                      <LocationMarker position={position} />
                    </MapContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Cliquez sur la carte pour changer la position. Coordonnées: {position[0].toFixed(6)}, {position[1].toFixed(6)}
                </p>
              </div>

              {/* Photo actuelle */}
              {photoUrl && (
                <div className="space-y-2">
                  <Label>Photo actuelle</Label>
                  <div className="relative w-full max-w-md">
                    <img 
                      src={photoUrl} 
                      alt="Photo du signalement"
                      className="rounded-lg border w-full object-cover"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Pour changer la photo, utilisez le bouton "Modifier la photo" sur la page de détails
                    </p>
                  </div>
                </div>
              )}

              {/* Boutons */}
              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Modification...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer les modifications
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.push(`/signalements/${id}`)}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

