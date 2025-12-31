"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star, Loader2, CheckCircle2, Trash2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
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

export default function AvisPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [rating, setRating] = useState<number>(0)
  const [hoveredRating, setHoveredRating] = useState<number>(0)
  const [commentaire, setCommentaire] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [existingAvis, setExistingAvis] = useState<any>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    } else if (user?.role !== "CITOYEN") {
      router.push("/")
      return
    }

    // Vérifier si l'utilisateur a déjà laissé un avis
    const checkExistingAvis = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        const response = await fetch(`${apiUrl}/api/avis/my`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data) {
            setExistingAvis(data)
            setRating(data.note)
            setCommentaire(data.commentaire || "")
            setHasSubmitted(true)
          }
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'avis:", error)
      }
    }

    checkExistingAvis()
  }, [isAuthenticated, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast.error("Veuillez sélectionner une note")
      return
    }

    if (!commentaire.trim()) {
      toast.error("Veuillez saisir un commentaire")
      return
    }

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Vous devez être connecté")
        router.push("/login")
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      const url = existingAvis 
        ? `${apiUrl}/api/avis/${existingAvis.id}`
        : `${apiUrl}/api/avis`

      const response = await fetch(url, {
        method: existingAvis ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          note: rating,
          commentaire: commentaire.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Erreur lors de l'envoi de l'avis")
      }

      const data = await response.json()
      setExistingAvis(data)
      setHasSubmitted(true)
      toast.success(existingAvis ? "Votre avis a été mis à jour" : "Merci pour votre avis !")
    } catch (error: any) {
      console.error("Erreur lors de l'envoi de l'avis:", error)
      toast.error(error.message || "Une erreur est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!existingAvis) return

    try {
      setIsDeleting(true)
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Vous devez être connecté")
        router.push("/login")
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      const response = await fetch(`${apiUrl}/api/avis/${existingAvis.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Erreur lors de la suppression de l'avis")
      }

      setExistingAvis(null)
      setRating(0)
      setCommentaire("")
      setHasSubmitted(false)
      toast.success("Votre avis a été supprimé")
    } catch (error: any) {
      console.error("Erreur lors de la suppression de l'avis:", error)
      toast.error(error.message || "Une erreur est survenue")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isAuthenticated || user?.role !== "CITOYEN") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Donner votre avis</h1>
          <p className="text-muted-foreground">
            Partagez votre expérience avec CitéConnect et aidez-nous à nous améliorer
          </p>
        </div>

        {hasSubmitted && existingAvis && (
          <Card className="mb-6 border-green-500/50 bg-green-50/50 dark:bg-green-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                <p className="font-medium">Vous avez déjà laissé un avis. Vous pouvez le modifier ou le supprimer ci-dessous.</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Votre avis</CardTitle>
            <CardDescription>
              Votre avis nous aide à améliorer nos services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div className="space-y-3">
                <Label>Note *</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 transition-colors ${
                          star <= (hoveredRating || rating)
                            ? "fill-yellow-500 text-yellow-500"
                            : "fill-gray-300 text-gray-300 dark:fill-gray-600 dark:text-gray-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {rating === 1 && "Très mauvais"}
                    {rating === 2 && "Mauvais"}
                    {rating === 3 && "Moyen"}
                    {rating === 4 && "Bien"}
                    {rating === 5 && "Excellent"}
                  </p>
                )}
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <Label htmlFor="commentaire">Commentaire *</Label>
                <Textarea
                  id="commentaire"
                  placeholder="Partagez votre expérience avec CitéConnect..."
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  rows={6}
                  required
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {commentaire.length} / 500 caractères
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting || rating === 0 || !commentaire.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : existingAvis ? (
                    "Mettre à jour mon avis"
                  ) : (
                    "Envoyer mon avis"
                  )}
                </Button>
                {existingAvis && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={isDeleting || isSubmitting}
                        className="gap-2"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Suppression...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4" />
                            Supprimer
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          Confirmer la suppression
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer votre avis ? Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

