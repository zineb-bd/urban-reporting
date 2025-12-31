"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle } from "lucide-react"

const faqData = [
  {
    category: "Général",
    questions: [
      {
        question: "Qu'est-ce que CityReport ?",
        answer:
          "CityReport est une plateforme qui permet aux citoyens de signaler les problèmes urbains (nids de poule, éclairage défectueux, déchets, etc.) directement aux services municipaux et de suivre leur résolution en temps réel.",
      },
      {
        question: "Comment créer un compte ?",
        answer:
          "Cliquez sur 'Inscription' dans le menu, remplissez le formulaire avec vos informations (nom, prénom, email, mot de passe) et validez. Vous recevrez une confirmation par email.",
      },
      {
        question: "Le service est-il gratuit ?",
        answer:
          "Oui, CityReport est entièrement gratuit pour tous les citoyens. Il n'y a aucun frais d'inscription ou d'utilisation.",
      },
    ],
  },
  {
    category: "Signalements",
    questions: [
      {
        question: "Comment créer un signalement ?",
        answer:
          "Connectez-vous à votre compte, cliquez sur 'Nouveau signalement' depuis la page 'Mes signalements', remplissez le formulaire avec les détails du problème, ajoutez une photo si possible, et localisez le problème sur la carte. Cliquez sur 'Créer le signalement' pour l'envoyer.",
      },
      {
        question: "Quels types de problèmes puis-je signaler ?",
        answer:
          "Vous pouvez signaler : nids de poule, éclairage public défectueux, déchets et dépôts sauvages, problèmes d'infrastructure (trottoirs, équipements), espaces verts à entretenir, et signalisation manquante ou endommagée.",
      },
      {
        question: "Combien de temps faut-il pour qu'un signalement soit traité ?",
        answer:
          "Le temps de traitement varie selon la priorité et le type de problème. En moyenne, les signalements sont traités sous 24-48h. Vous recevrez des notifications sur l'avancement de votre signalement.",
      },
      {
        question: "Puis-je modifier ou supprimer un signalement ?",
        answer:
          "Vous pouvez modifier un signalement tant qu'il n'a pas été pris en charge par un technicien. Une fois en cours de traitement, vous pouvez seulement ajouter des commentaires. La suppression n'est possible que pour les signalements non traités.",
      },
    ],
  },
  {
    category: "Suivi",
    questions: [
      {
        question: "Comment suivre l'état de mes signalements ?",
        answer:
          "Rendez-vous dans la section 'Mes signalements' de votre compte. Vous y verrez tous vos signalements avec leur statut actuel (Nouveau, En attente, En cours, Résolu) et pourrez consulter les détails de chacun.",
      },
      {
        question: "Recevrai-je des notifications ?",
        answer:
          "Oui, vous recevrez des notifications par email lorsque le statut de votre signalement change (prise en charge, en cours, résolu). Vous pouvez également consulter les mises à jour directement sur la plateforme.",
      },
      {
        question: "Que signifie chaque statut ?",
        answer:
          "- Nouveau : Signalement créé, en attente d'examen\n- En attente : Signalement examiné, en file d'attente\n- En cours : Problème pris en charge par un technicien\n- Résolu : Problème résolu et vérifié",
      },
    ],
  },
  {
    category: "Compte",
    questions: [
      {
        question: "J'ai oublié mon mot de passe, que faire ?",
        answer:
          "Sur la page de connexion, cliquez sur 'Mot de passe oublié ?'. Entrez votre adresse email et vous recevrez un lien pour réinitialiser votre mot de passe.",
      },
      {
        question: "Comment modifier mes informations personnelles ?",
        answer:
          "Cliquez sur votre nom dans le menu en haut à droite, puis sur 'Paramètres' (ou 'FAQ' pour les citoyens). Vous pourrez modifier votre nom, email, téléphone et adresse.",
      },
      {
        question: "Puis-je supprimer mon compte ?",
        answer:
          "Oui, vous pouvez supprimer votre compte à tout moment depuis les paramètres. Notez que cette action est irréversible et que tous vos signalements seront archivés.",
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="h-8 w-8 text-[#00648E]" />
            <h1 className="text-3xl font-bold">FAQ - Questions fréquentes</h1>
          </div>
          <p className="text-muted-foreground">
            Trouvez les réponses aux questions les plus courantes sur l'utilisation de CityReport
          </p>
        </div>

        <div className="space-y-8">
          {faqData.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="border-l-4 border-l-[#00648E]">
              <CardHeader>
                <CardTitle className="text-xl text-[#00648E]">{category.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((item, itemIndex) => (
                    <AccordionItem key={itemIndex} value={`item-${categoryIndex}-${itemIndex}`}>
                      <AccordionTrigger className="text-left font-semibold">{item.question}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 bg-[#00648E]/10 border-[#00648E]">
          <CardHeader>
            <CardTitle>Vous ne trouvez pas votre réponse ?</CardTitle>
            <CardDescription>
              Contactez notre équipe de support pour obtenir de l'aide supplémentaire
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Email : <a href="mailto:support@cityreport.fr" className="text-[#00648E] hover:underline">support@cityreport.fr</a>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Téléphone : <a href="tel:+33123456789" className="text-[#00648E] hover:underline">+33 1 23 45 67 89</a>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}


