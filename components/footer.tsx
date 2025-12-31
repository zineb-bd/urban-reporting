
export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="CitéConnect" className="h-6 w-6" />
            <span className="font-semibold text-[#00648E]">CitéConnect</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 CitéConnect. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
