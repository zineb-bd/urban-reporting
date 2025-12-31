"use client"

import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { ThemeToggle } from "./theme-toggle"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="font-bold text-xl text-foreground hidden sm:block">Cité Engagement</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-foreground/70 hover:text-orange-500 transition-colors">
            Fonctionnalités
          </a>
          <a href="#stats" className="text-foreground/70 hover:text-orange-500 transition-colors">
            Impact
          </a>
          <a href="#contact" className="text-foreground/70 hover:text-orange-500 transition-colors">
            Contact
          </a>
        </nav>

        {/* CTA Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <ThemeToggle />
          <Button variant="ghost" className="text-foreground hover:text-orange-500">
            Connexion
          </Button>
          <Button className="bg-orange-600 hover:bg-orange-700 text-white">Signaler maintenant</Button>
        </div>

        {/* Mobile Menu */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-border p-4 space-y-3 bg-background">
          <a href="#features" className="block text-foreground/70 hover:text-orange-500">
            Fonctionnalités
          </a>
          <a href="#stats" className="block text-foreground/70 hover:text-orange-500">
            Impact
          </a>
          <a href="#contact" className="block text-foreground/70 hover:text-orange-500">
            Contact
          </a>
          <div className="flex gap-2 pt-3">
            <ThemeToggle />
            <Button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white">Signaler maintenant</Button>
          </div>
        </div>
      )}
    </header>
  )
}
