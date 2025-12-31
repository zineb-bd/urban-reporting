"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, Send, CheckCircle2, AlertCircle } from "lucide-react"
import { HeaderHome } from "@/components/header-home"
import { FooterHome } from "@/components/footer-home"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null)
  const [errorMessage, setErrorMessage] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Réinitialiser le statut d'erreur quand l'utilisateur modifie le formulaire
    if (submitStatus) {
      setSubmitStatus(null)
      setErrorMessage("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)
    setErrorMessage("")

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      const response = await fetch(`${apiUrl}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}: ${response.statusText}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch {
          // Si la réponse n'est pas du JSON, utiliser le message par défaut
        }
        throw new Error(errorMessage)
      }

      setSubmitStatus("success")
      // Réinitialiser le formulaire
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        message: ""
      })
    } catch (err: any) {
      console.error("Erreur lors de l'envoi du message:", err)
      setSubmitStatus("error")
      setErrorMessage(err.message || "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderHome />
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
              Contactez-nous
            </h1>
            <p className="text-lg text-muted-foreground">
              Nous sommes là pour vous aider. Envoyez-nous un message et nous vous répondrons dans les plus brefs délais.
            </p>
          </div>

          {/* Contact Form */}
          <Card className="border-2 shadow-xl">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/30 px-8 pt-8 pb-6">
              <CardTitle className="flex items-center gap-2 text-3xl">
                <Mail className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                Formulaire de contact
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Remplissez le formulaire ci-dessous et nous vous contacterons rapidement
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8 px-8 pb-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nom et Prénom */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom *</Label>
                    <Input
                      id="nom"
                      name="nom"
                      type="text"
                      required
                      value={formData.nom}
                      onChange={handleChange}
                      placeholder="Votre nom"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prenom">Prénom *</Label>
                    <Input
                      id="prenom"
                      name="prenom"
                      type="text"
                      required
                      value={formData.prenom}
                      onChange={handleChange}
                      placeholder="Votre prénom"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="votre.email@exemple.com"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Téléphone */}
                <div className="space-y-2">
                  <Label htmlFor="telephone">Numéro de téléphone *</Label>
                  <Input
                    id="telephone"
                    name="telephone"
                    type="tel"
                    required
                    value={formData.telephone}
                    onChange={handleChange}
                    placeholder="+212 6 00 00 00 00"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Votre message..."
                    rows={6}
                    disabled={isSubmitting}
                    className="resize-none"
                  />
                </div>

                {/* Status Messages */}
                {submitStatus === "success" && (
                  <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.
                    </p>
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="flex items-start gap-2 p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-700 dark:text-red-300">
                        Erreur lors de l'envoi
                      </p>
                      {errorMessage && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errorMessage}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-[#00648E] hover:bg-[#005a7a] text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Envoyer le message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Vous pouvez également nous contacter directement par email à{" "}
              <a href="mailto:contact@citeconnect.fr" className="text-[#00648E] hover:underline">
                contact@citeconnect.fr
              </a>
            </p>
          </div>
        </div>
      </main>
      <FooterHome />
    </div>
  )
}

