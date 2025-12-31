"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { User, LogOut, LayoutDashboard, FileText, Settings, Star, Users, BarChart3, FileCheck } from "lucide-react"
import Link from "next/link"
import { NotificationBell } from "@/components/notification-bell"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  const { user, logout, isAuthenticated } = useAuth()

  const handleLogout = () => {
    logout()
    window.location.href = "/"
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="CitéConnect" className="h-8 w-8" />
          <span className="text-xl font-semibold text-[#00648E]">CitéConnect</span>
        </Link>
        <nav className="flex items-center gap-6">
          {!isAuthenticated && (
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Accueil
            </Link>
          )}

          {/* Citoyen: Voir ses signalements et tous les signalements */}
          {user?.role === "CITOYEN" && (
            <>
              <Link
                href="/signalements"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Tous les signalements
              </Link>
              <Link
                href="/mes-signalements"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Mes signalements
              </Link>
            </>
          )}

          {/* Technicien: Consulter assignations + Changer statuts */}
          {user?.role === "TECHNICIEN" && (
            <Link
              href="/technicien/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Mes assignations
            </Link>
          )}

          {/* Admin: Dashboard, Assigner signalement, Générer rapport */}
          {user?.role === "ADMIN" && (
            <>
              <Link href="/admin/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
              <Link href="/signalements" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Assigner un signalement
              </Link>
              <Link href="/admin/rapports" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Générer un rapport
              </Link>
              <Link href="/admin/contact-messages" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Messages de contact
              </Link>
            </>
          )}

          {isAuthenticated && <NotificationBell />}
          <ThemeToggle />
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span>
                    {user?.prenom} {user?.nom}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {user?.prenom} {user?.nom}
                    </span>
                    <span className="text-xs text-muted-foreground">{user?.email}</span>
                    <span className="mt-1 text-xs font-normal text-primary">{user?.role}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user?.role === "CITOYEN" && (
                  <DropdownMenuItem asChild>
                    <Link href="/mes-signalements" className="cursor-pointer">
                      <FileText className="mr-2 h-4 w-4" />
                      Mes signalements
                    </Link>
                  </DropdownMenuItem>
                )}
                {user?.role === "ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                {user?.role === "TECHNICIEN" && (
                  <DropdownMenuItem asChild>
                    <Link href="/technicien/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Mes assignations
                    </Link>
                  </DropdownMenuItem>
                )}
                {user?.role === "CITOYEN" && (
                  <DropdownMenuItem asChild>
                    <Link href="/avis" className="cursor-pointer">
                      <Star className="mr-2 h-4 w-4" />
                      Donner mon avis
                    </Link>
                  </DropdownMenuItem>
                )}
                {user?.role === "CITOYEN" ? (
                  <DropdownMenuItem asChild>
                    <Link href="/faq" className="cursor-pointer">
                      <FileText className="mr-2 h-4 w-4" />
                      FAQ
                    </Link>
                  </DropdownMenuItem>
                ) : user?.role === "TECHNICIEN" ? (
                  <DropdownMenuItem asChild>
                    <Link href="/reglement" className="cursor-pointer">
                      <FileCheck className="mr-2 h-4 w-4" />
                      Règlement
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href="/parametres" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Paramètres
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Connexion
              </Link>
              <Button asChild>
                <Link href="/inscription">Inscription</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
