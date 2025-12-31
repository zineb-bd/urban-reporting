"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { FileCheck, ArrowLeft, CheckCircle2, AlertCircle, Clock, Shield, Users, MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"

export default function ReglementPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

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
      if (parsedUser.role !== "TECHNICIEN") {
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
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.role !== "TECHNICIEN") {
    return null
  }

  const reglements = [
    {
      id: 1,
      titre: "Réactivité et délais de traitement",
      icon: Clock,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      points: [
        "Répondre aux assignations dans un délai maximum de 24 heures",
        "Traiter les signalements selon leur priorité (HAUTE, MOYENNE, BASSE)",
        "Mettre à jour régulièrement le statut des interventions en cours",
        "Respecter les délais convenus avec les citoyens"
      ]
    },
    {
      id: 2,
      titre: "Communication et transparence",
      icon: MessageSquare,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      points: [
        "Ajouter des commentaires techniques clairs et détaillés pour chaque intervention",
        "Informer les citoyens de l'avancement des travaux via les mises à jour de statut",
        "Justifier toute décision de refus d'assignation de manière professionnelle",
        "Répondre aux questions et préoccupations des citoyens de manière courtoise"
      ]
    },
    {
      id: 3,
      titre: "Qualité du travail",
      icon: CheckCircle2,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      points: [
        "Effectuer un diagnostic complet avant toute intervention",
        "Documenter les interventions avec des photos avant/après si nécessaire",
        "S'assurer que les réparations sont durables et conformes aux normes",
        "Signaler tout problème technique ou besoin de ressources supplémentaires"
      ]
    },
    {
      id: 4,
      titre: "Gestion des assignations",
      icon: Shield,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
      points: [
        "Accepter ou refuser les assignations dans les délais impartis",
        "Ne refuser une assignation que pour des raisons valides et justifiées",
        "Respecter les compétences et spécialités de chaque technicien",
        "Coordonner avec les autres techniciens en cas de besoin"
      ]
    },
    {
      id: 5,
      titre: "Respect et professionnalisme",
      icon: Users,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/30",
      points: [
        "Maintenir un comportement professionnel en toutes circonstances",
        "Respecter les citoyens et leurs préoccupations",
        "Traiter toutes les demandes avec équité, sans discrimination",
        "Respecter la confidentialité des informations partagées"
      ]
    },
    {
      id: 6,
      titre: "Suivi et reporting",
      icon: FileCheck,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
      points: [
        "Enregistrer le temps passé sur chaque intervention",
        "Mettre à jour le statut des signalements en temps réel",
        "Fournir des rapports précis sur l'état d'avancement",
        "Signaler les problèmes récurrents ou les besoins d'amélioration"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/technicien/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Retour au dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Règlement du technicien
              </h1>
              <p className="text-lg text-muted-foreground">
                Règles et directives à respecter dans l'exercice de vos fonctions
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <FileCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Règlement interne</span>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <Card className="mb-8 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Important
            </CardTitle>
            <CardDescription className="text-base">
              En tant que technicien municipal, vous êtes tenu de respecter ces règles pour garantir un service de qualité aux citoyens. 
              Le non-respect de ces règles peut entraîner des mesures disciplinaires.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Règlements */}
        <div className="grid gap-6 md:grid-cols-2">
          {reglements.map((reglement) => {
            const Icon = reglement.icon
            return (
              <Card key={reglement.id} className="border-2 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className={`border-b ${reglement.bgColor}`}>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className={`p-2 rounded-lg ${reglement.bgColor}`}>
                      <Icon className={`h-6 w-6 ${reglement.color}`} />
                    </div>
                    {reglement.titre}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3">
                    {reglement.points.map((point, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className={`h-5 w-5 ${reglement.color} mt-0.5 flex-shrink-0`} />
                        <span className="text-sm leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Footer Note */}
        <Card className="mt-8 border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-950/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                  Note importante
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Ce règlement est évolutif et peut être mis à jour. Vous serez informé de toute modification. 
                  En cas de questions ou de clarifications nécessaires, n'hésitez pas à contacter votre administrateur.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

