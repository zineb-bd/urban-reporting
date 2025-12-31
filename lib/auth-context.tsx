"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

export type UserRole = "CITOYEN" | "TECHNICIEN" | "ADMIN"

export interface User {
  id: number
  nom: string
  prenom: string
  email: string
  role: UserRole
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<User>
  logout: () => void
  isAuthenticated: boolean
  isInitialized: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
  }, [])

  // Fonction pour rafraîchir les données utilisateur depuis le backend
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      const response = await fetch(`${apiUrl}/api/users/me`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const backendUser = await response.json()
        const userToSet: User = {
          id: backendUser.id,
          nom: backendUser.nom,
          prenom: backendUser.prenom,
          email: backendUser.email,
          role: backendUser.role as UserRole,
        }
        localStorage.setItem("user", JSON.stringify(userToSet))
        setUser(userToSet)
      } else {
        // Si le token est invalide, déconnecter l'utilisateur
        if (response.status === 401 || response.status === 403) {
          logout()
        }
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement des données utilisateur:", error)
      // En cas d'erreur réseau, on garde les données du localStorage
    }
  }, [logout])

  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    const token = localStorage.getItem("token")
    
    if (savedUser && token) {
      // Charger les données depuis localStorage en premier (pour un affichage immédiat)
      setUser(JSON.parse(savedUser))
      setIsInitialized(true)
      // Puis rafraîchir depuis le backend pour avoir les données à jour
      refreshUser()
    } else {
      setIsInitialized(true)
    }
  }, [refreshUser])

  const login = async (email: string, password: string): Promise<User> => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
    
    try {
      // Appel au backend pour l'authentification
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      if (!response.ok) {
        // Si le backend répond, c'est une erreur d'authentification
        const errorData = await response.json().catch(() => ({ message: "Email ou mot de passe incorrect" }))
        throw new Error(errorData.message || "Email ou mot de passe incorrect")
      }

      const authResponse = await response.json()
      const { token, user: backendUser } = authResponse

      // Vérifier que le token existe
      if (!token) {
        throw new Error("Token d'authentification manquant dans la réponse du serveur")
      }

      // Convertir l'utilisateur du backend au format frontend
      const userToSet: User = {
        id: backendUser.id,
        nom: backendUser.nom,
        prenom: backendUser.prenom,
        email: backendUser.email,
        role: backendUser.role as UserRole,
      }

      // Stocker le token et l'utilisateur
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(userToSet))
      setUser(userToSet)
      
      return userToSet
    } catch (error: any) {
      // Si l'erreur contient déjà un message (erreur d'authentification du backend), la relancer
      if (error.message && !error.message.includes("fetch")) {
        throw error
      }
      
      // Sinon, c'est une erreur de connexion réseau
      console.error("Erreur de connexion au backend:", error.message)
      throw new Error(
        "Impossible de se connecter au serveur. Veuillez vérifier que le backend est démarré sur http://localhost:8080"
      )
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isInitialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
