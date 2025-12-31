"use client"

import { Mail, MapPin, Phone } from "lucide-react"

export function FooterHome() {
  return (
    <footer id="contact" className="bg-card/50 border-t border-border py-16 px-4">
      <div className="container mx-auto space-y-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="CitéConnect" className="h-8 w-8" />
              <span className="font-bold text-lg text-[#00648E]">CitéConnect</span>
            </div>
            <p className="text-sm text-foreground/70">Transformez votre ville en signalant les problèmes urbains.</p>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className="text-foreground/70 hover:text-[#00648E] transition-colors">
                  Fonctionnalités
                </a>
              </li>
              <li>
                <a href="/signalements" className="text-foreground/70 hover:text-[#00648E] transition-colors">
                  Signalements
                </a>
              </li>
              <li>
                <a href="/inscription" className="text-foreground/70 hover:text-[#00648E] transition-colors">
                  Inscription
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#stats" className="text-foreground/70 hover:text-[#00648E] transition-colors">
                  Impact
                </a>
              </li>
              <li>
                <a href="#contact" className="text-foreground/70 hover:text-[#00648E] transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="/login" className="text-foreground/70 hover:text-[#00648E] transition-colors">
                  Connexion
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
                contact@citeconnect.fr
              </li>
              <li className="flex items-center gap-2 text-foreground/70">
                <Phone className="w-4 h-4" />
                +212 6 0000000
              </li>
              <li className="flex items-start gap-2 text-foreground/70">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Taroudant, Maroc</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-foreground/60">
          <p>&copy; 2025 CitéConnect. Tous droits réservés.</p>
          <div className="flex gap-6">
          </div>
        </div>
      </div>
    </footer>
  )
}

