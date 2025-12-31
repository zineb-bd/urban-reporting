"use client"

import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { ThemeToggle } from "./theme-toggle"
import Link from "next/link"

export function HeaderHome() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="CitéConnect" className="h-10 w-10" />
          <span className="font-bold text-xl text-[#00648E] hidden sm:block">CitéConnect</span>
        </Link>

        {/* CTA Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <ThemeToggle />
          <Button variant="ghost" className="text-foreground hover:text-[#00648E]" asChild>
            <Link href="/contact">Contactez-nous</Link>
          </Button>
          <Button variant="ghost" className="text-foreground hover:text-[#00648E]" asChild>
            <Link href="/login">Connexion</Link>
          </Button>
          <Button className="bg-[#00648E] hover:bg-[#005a7a] text-white" asChild>
            <Link href="/inscription">Signaler maintenant</Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-border p-4 space-y-3 bg-background">
          <div className="flex flex-col gap-2 pt-3">
            <div className="flex gap-2">
              <ThemeToggle />
            </div>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/contact">Contactez-nous</Link>
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/login">Connexion</Link>
            </Button>
            <Button className="w-full bg-[#00648E] hover:bg-[#005a7a] text-white" asChild>
              <Link href="/inscription">Signaler maintenant</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}

