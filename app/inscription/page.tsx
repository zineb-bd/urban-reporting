"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    role: "CITOYEN",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Vérifier que les mots de passe correspondent
      if (formData.password !== formData.confirmPassword) {
        setError("Les mots de passe ne correspondent pas")
        setLoading(false)
        return
      }

      // Appeler l'API d'inscription
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          telephone: formData.telephone || null,
          adresse: formData.adresse || null,
          role: formData.role,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      })

      if (!response.ok) {
        // Lire le contenu de la réponse d'abord
        const responseText = await response.text()
        let errorMessage = `Erreur ${response.status}: ${response.statusText}`
        
        try {
          const errorData = JSON.parse(responseText)
          
          // Gérer les erreurs de validation qui viennent du backend
          if (errorData.errors) {
            const validationErrors = Object.entries(errorData.errors)
              .map(([field, message]) => `${field}: ${message}`)
              .join(", ")
            errorMessage = `Erreurs de validation: ${validationErrors}`
          } else if (errorData.message) {
            errorMessage = errorData.message
          } else if (errorData.error) {
            errorMessage = errorData.error
          }
        } catch {
          // Si ce n'est pas du JSON, utiliser le texte brut
          errorMessage = responseText || errorMessage
        }
        
        console.error("Erreur d'inscription:", {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage
        })
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      console.log("✅ Inscription réussie:", data)
      
      // Sauvegarder le token et l'utilisateur
      if (data.token) {
        localStorage.setItem("token", data.token)
        console.log("✅ Token sauvegardé")
      }
      if (data.user) {
        // Convertir l'utilisateur au format frontend
        const userToSet = {
          id: data.user.id,
          nom: data.user.nom,
          prenom: data.user.prenom,
          email: data.user.email,
          role: data.user.role,
        }
        localStorage.setItem("user", JSON.stringify(userToSet))
        console.log("✅ Utilisateur sauvegardé:", userToSet)
        
        // Recharger la page pour mettre à jour le contexte d'authentification
        // ou rediriger directement vers la page appropriée
        if (data.user.role === "ADMIN") {
          window.location.href = "/admin/dashboard"
        } else if (data.user.role === "TECHNICIEN") {
          window.location.href = "/technicien/dashboard"
        } else {
          window.location.href = "/mes-signalements"
        }
      } else {
        console.error("❌ Pas d'utilisateur dans la réponse")
        // Si pas d'utilisateur dans la réponse, rediriger vers login
        router.push("/login")
      }
    } catch (err: any) {
      console.error("Erreur lors de l'inscription:", err)
      setError(err.message || "Une erreur est survenue lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center bg-secondary/30 px-4 py-12">
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
            <CardDescription>
              Rejoignez la communauté et commencez à signaler les problèmes de votre ville
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom</Label>
                  <Input
                    id="nom"
                    placeholder="Dupont"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input
                    id="prenom"
                    placeholder="Jean"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jean.dupont@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input
                    id="telephone"
                    type="tel"
                    placeholder="01 23 45 67 89"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Type de compte</Label>
                  {isMounted ? (
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger id="role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CITOYEN">Citoyen</SelectItem>
                        <SelectItem value="TECHNICIEN">Technicien municipal</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground flex items-center">
                      {formData.role === "CITOYEN" ? "Citoyen" : "Technicien municipal"}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse</Label>
                <Input
                  id="adresse"
                  placeholder="123 rue de la République, Paris"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Création du compte..." : "Créer mon compte"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Vous avez déjà un compte ? </span>
              <Link href="/login" className="font-medium text-primary hover:underline">
                Se connecter
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
