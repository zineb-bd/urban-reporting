"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { Loader2, Mail, ArrowLeft, User, Phone, Calendar, MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

interface ContactMessage {
  id: number
  nom: string
  prenom: string
  email: string
  telephone: string
  message: string
  dateCreation: string
}

export default function ContactMessagesPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    } else if (user?.role !== "ADMIN") {
      router.push("/")
      return
    }

    const fetchMessages = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Token d'authentification manquant")
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        const response = await fetch(`${apiUrl}/api/contact/messages`, {
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
        // Trier par date de création (plus récent en premier)
        const sortedData = data.sort((a: ContactMessage, b: ContactMessage) => 
          new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime()
        )
        setMessages(sortedData)
      } catch (err: any) {
        console.error("Erreur lors de la récupération des messages:", err)
        setError(err.message || "Une erreur est survenue lors du chargement des messages")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
  }, [isAuthenticated, user, router])

  const formatDate = (dateString: string) => {
    if (!dateString) return "Date inconnue"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    } catch {
      return dateString
    }
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00648E]" />
        <span className="ml-2 text-muted-foreground">Chargement des messages...</span>
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
              <h1 className="mb-2 text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Messages de contact
              </h1>
              <p className="text-lg text-muted-foreground">
                {messages.length} message{messages.length > 1 ? "s" : ""} reçu{messages.length > 1 ? "s" : ""}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Gestion des contacts</span>
            </div>
          </div>
        </div>

        {/* Messages List */}
        {messages.length > 0 ? (
          <div className="grid gap-6">
            {messages.map((message) => (
              <Card key={message.id} className="border-2 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 text-xl mb-2">
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        {message.prenom} {message.nom}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {message.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {message.telephone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(message.dateCreation)}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-4">
                      Nouveau
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </div>
                    <p className="text-base leading-relaxed whitespace-pre-wrap bg-muted/50 p-4 rounded-lg border">
                      {message.message}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-2">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Mail className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucun message</h3>
              <p className="text-muted-foreground text-center">
                Aucun message de contact n'a été reçu pour le moment.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

