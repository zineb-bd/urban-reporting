"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useAuth } from "@/lib/auth-context"
import { Loader2, Users, AlertTriangle, Trash2, Power, PowerOff, Shield, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

interface User {
  id: number
  nom: string
  prenom: string
  email: string
  telephone?: string
  adresse?: string
  role: "CITOYEN" | "TECHNICIEN" | "ADMIN"
  enabled: boolean
}

export default function ParametresPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Vérifier d'abord le localStorage avant de rediriger
    const token = localStorage.getItem("token")
    const savedUser = localStorage.getItem("user")
    
    if (!token || !savedUser) {
      router.push("/login")
      return
    }
    
    // Vérifier le rôle depuis le localStorage
    try {
      const parsedUser = JSON.parse(savedUser)
      if (parsedUser.role !== "ADMIN") {
        router.push("/")
        return
      }
    } catch {
      router.push("/login")
      return
    }
    
    // Si isAuthenticated est false mais qu'on a un token, attendre un peu
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        const stillNoAuth = !localStorage.getItem("token")
        if (stillNoAuth) {
          router.push("/login")
        }
      }, 1000)
      return () => clearTimeout(timer)
    }

    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Token d'authentification manquant")
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        const response = await fetch(`${apiUrl}/api/users/all`, {
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
        setUsers(data)
      } catch (err: any) {
        console.error("Erreur lors de la récupération des utilisateurs:", err)
        setError(err.message || "Une erreur est survenue lors du chargement des utilisateurs")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [isAuthenticated, user, router])

  const handleDeleteUser = async (userId: number) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token d'authentification manquant")
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      const response = await fetch(`${apiUrl}/api/users/${userId}`, {
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
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`)
      }

      // Mettre à jour la liste des utilisateurs
      setUsers(users.filter(u => u.id !== userId))
    } catch (err: any) {
      console.error("Erreur lors de la suppression de l'utilisateur:", err)
      alert(err.message || "Une erreur est survenue lors de la suppression")
    }
  }

  const handleToggleUserStatus = async (userId: number) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token d'authentification manquant")
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      const response = await fetch(`${apiUrl}/api/users/${userId}/toggle-status`, {
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
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`)
      }

      const updatedUser = await response.json()
      // Mettre à jour la liste des utilisateurs
      setUsers(users.map(u => u.id === userId ? updatedUser : u))
    } catch (err: any) {
      console.error("Erreur lors de la modification du statut:", err)
      alert(err.message || "Une erreur est survenue lors de la modification")
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "default"
      case "TECHNICIEN":
        return "secondary"
      case "CITOYEN":
        return "outline"
      default:
        return "outline"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrateur"
      case "TECHNICIEN":
        return "Technicien"
      case "CITOYEN":
        return "Citoyen"
      default:
        return role
    }
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00648E]" />
        <span className="ml-2 text-muted-foreground">Chargement des utilisateurs...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Erreur</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Retour au dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                Gestion des utilisateurs
              </h1>
              <p className="text-lg text-muted-foreground">Gérer les comptes utilisateurs de la plateforme</p>
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
              <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Administration</span>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <Card className="border-2 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/30">
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              Liste des utilisateurs
            </CardTitle>
            <CardDescription className="mt-1">
              {users.length} utilisateur{users.length > 1 ? "s" : ""} au total
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {users.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">Nom complet</TableHead>
                      <TableHead className="min-w-[200px]">Email</TableHead>
                      <TableHead className="min-w-[120px]">Téléphone</TableHead>
                      <TableHead className="min-w-[100px]">Rôle</TableHead>
                      <TableHead className="min-w-[100px]">Statut</TableHead>
                      <TableHead className="text-right min-w-[180px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((userItem) => (
                      <TableRow key={userItem.id}>
                        <TableCell className="font-medium">
                          {userItem.prenom} {userItem.nom}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {userItem.email}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {userItem.telephone || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(userItem.role)}>
                            {getRoleLabel(userItem.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={userItem.enabled ? "default" : "secondary"} 
                            className={
                              userItem.enabled 
                                ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20" 
                                : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
                            }
                          >
                            {userItem.enabled ? "Actif" : "Désactivé"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {userItem.role !== "ADMIN" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleUserStatus(userItem.id)}
                                  className="h-8 w-8 p-0"
                                  title={userItem.enabled ? "Désactiver le compte" : "Activer le compte"}
                                >
                                  {userItem.enabled ? (
                                    <PowerOff className="h-4 w-4 text-orange-600" />
                                  ) : (
                                    <Power className="h-4 w-4 text-green-600" />
                                  )}
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                      title="Supprimer l'utilisateur"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{userItem.prenom} {userItem.nom}</strong> ({userItem.email}) ? Cette action est irréversible.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteUser(userItem.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Supprimer
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                            {userItem.role === "ADMIN" && (
                              <span className="text-xs text-muted-foreground">Protégé</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

