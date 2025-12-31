"use client"

import { Mail, MapPin, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-card/50 border-t border-border py-16 px-4">
      <div className="container mx-auto space-y-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="font-bold text-lg">Cité Engagement</span>
            </div>
            <p className="text-sm text-foreground/70">Transformez votre ville en signalant les problèmes urbains.</p>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Produit</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-foreground/70 hover:text-orange-500 transition-colors">
                  Fonctionnalités
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-orange-500 transition-colors">
                  Tarification
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-orange-500 transition-colors">
                  Sécurité
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Entreprise</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-foreground/70 hover:text-orange-500 transition-colors">
                  À propos
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-orange-500 transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-orange-500 transition-colors">
                  Carrières
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-foreground/70">
                <Mail className="w-4 h-4" />
                contact@citeengagement.fr
              </li>
              <li className="flex items-center gap-2 text-foreground/70">
                <Phone className="w-4 h-4" />
                +33 1 2345 6789
              </li>
              <li className="flex items-start gap-2 text-foreground/70">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Paris, France</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-foreground/60">
          <p>&copy; 2025 Cité Engagement. Tous droits réservés.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-orange-500 transition-colors">
              Confidentialité
            </a>
            <a href="#" className="hover:text-orange-500 transition-colors">
              Conditions
            </a>
            <a href="#" className="hover:text-orange-500 transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
