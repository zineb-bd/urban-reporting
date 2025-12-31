"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, Eye, EyeOff } from "lucide-react"

import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()

  const [formData, setFormData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const user = await login(formData.email, formData.password)

      if (user.role === "ADMIN") {
        router.push("/admin/dashboard")
      } else if (user.role === "TECHNICIEN") {
        router.push("/technicien/dashboard")
      } else {
        router.push("/mes-signalements")
      }
    } catch (err: any) {
      if (err.message && err.message.includes("Impossible de se connecter au serveur")) {
        setError("Le backend n'est pas accessible. Veuillez vérifier qu'il est démarré sur http://localhost:8080")
      } else {
        setError(err.message || "Email ou mot de passe incorrect")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 items-center justify-center bg-secondary/30 px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
            <CardDescription>
              Connectez-vous pour accéder à votre compte et gérer vos signalements
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Comptes de démo :</strong>
                <br />
                Citoyen : citoyen@mail.com / citoyen123
                <br />
                Technicien : technicien@mail.com / technicien123
                <br />
                Admin : admin@mail.com / admin123
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              {/* Password */}
              <div className="relative">
  <Label htmlFor="password" className="mb-1">Mot de passe</Label> {/* ajout de mb-1 pour l'espace */}
  <div className="relative flex items-center">
    <Input
      id="password"
      type={showPassword ? "text" : "password"}
      placeholder="••••••••"
      value={formData.password}
      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      required
      className="pr-10" // espace pour le bouton
    />
    <button
      type="button"
      className="absolute right-2 text-muted-foreground flex items-center justify-center h-full"
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  </div>
  <Link
    href="/mot-de-passe-oublie"
    className="text-sm text-primary hover:underline block mt-2 text-right"
  >
    Mot de passe oublié ?
  </Link>
</div>


              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Vous n'avez pas de compte ? </span>
              <Link href="/inscription" className="font-medium text-primary hover:underline">
                Créer un compte
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
