"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

interface Notification {
  id: number
  titre: string
  message: string
  type: string
  lu: boolean
  dateCreation: string
  signalement?: {
    id: number
    titre: string
  }
}

export function NotificationBell() {
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return

    const fetchNotifications = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("token")
        if (!token) {
          setIsLoading(false)
          return
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

        try {
          // Récupérer les notifications
          const response = await fetch(`${apiUrl}/api/notifications`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          if (response.ok) {
            const data = await response.json()
            setNotifications(data || [])
          } else if (response.status === 404) {
            // L'endpoint n'existe pas encore, on ignore silencieusement
            setNotifications([])
          }
        } catch (fetchError) {
          // Erreur de réseau ou endpoint non disponible
          console.warn("Endpoint de notifications non disponible:", fetchError)
          setNotifications([])
        }

        try {
          // Récupérer le nombre de notifications non lues
          const countResponse = await fetch(`${apiUrl}/api/notifications/unread-count`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          if (countResponse.ok) {
            const countData = await countResponse.json()
            setUnreadCount(countData.count || 0)
          } else if (countResponse.status === 404) {
            // L'endpoint n'existe pas encore
            setUnreadCount(0)
          }
        } catch (fetchError) {
          // Erreur de réseau ou endpoint non disponible
          console.warn("Endpoint de comptage de notifications non disponible:", fetchError)
          setUnreadCount(0)
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des notifications:", error)
        setNotifications([])
        setUnreadCount(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()

    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      
      try {
        const response = await fetch(`${apiUrl}/api/notifications/${id}/read`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, lu: true } : n)))
          setUnreadCount((prev) => Math.max(0, prev - 1))
        } else if (response.status === 404) {
          // Endpoint non disponible, on met à jour localement quand même
          setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, lu: true } : n)))
          setUnreadCount((prev) => Math.max(0, prev - 1))
        }
      } catch (fetchError) {
        // Erreur de réseau, on met à jour localement quand même
        console.warn("Endpoint de marquage de notification non disponible:", fetchError)
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, lu: true } : n)))
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Erreur lors du marquage de la notification:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      
      try {
        const response = await fetch(`${apiUrl}/api/notifications/read-all`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })))
          setUnreadCount(0)
        } else if (response.status === 404) {
          // Endpoint non disponible, on met à jour localement quand même
          setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })))
          setUnreadCount(0)
        }
      } catch (fetchError) {
        // Erreur de réseau, on met à jour localement quand même
        console.warn("Endpoint de marquage de toutes les notifications non disponible:", fetchError)
        setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error("Erreur lors du marquage de toutes les notifications:", error)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

      if (diffInSeconds < 60) return "À l'instant"
      if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`
      if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`
      if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`
      return date.toLocaleDateString("fr-FR")
    } catch {
      return dateString
    }
  }

  if (!isAuthenticated) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={(e) => {
                e.preventDefault()
                markAllAsRead()
              }}
            >
              Tout marquer comme lu
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Chargement...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Aucune notification</div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`notification-item flex flex-col items-start p-3 cursor-pointer text-foreground ${
                  !notification.lu ? "bg-muted/50" : ""
                }`}
                onClick={() => {
                  if (!notification.lu) {
                    markAsRead(notification.id)
                  }
                  if (notification.signalement) {
                    window.location.href = `/signalements/${notification.signalement.id}`
                  }
                }}
              >
                <div className="flex items-start justify-between w-full gap-2">
                  <div className="flex-1">
                    <p className={`notification-title text-sm font-medium text-foreground ${!notification.lu ? "font-semibold" : ""}`}>
                      {notification.titre}
                    </p>
                    <p className="notification-message text-xs text-foreground dark:text-foreground mt-1">{notification.message}</p>
                    <p className="notification-date text-xs text-muted-foreground mt-1">{formatDate(notification.dateCreation)}</p>
                  </div>
                  {!notification.lu && (
                    <div className="notification-dot h-2 w-2 rounded-full bg-primary mt-1 flex-shrink-0" />
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="cursor-pointer w-full text-foreground">
            Voir toutes les notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


